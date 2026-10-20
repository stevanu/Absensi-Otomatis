import { config } from "../config/index.js";
import sheets from "../core/sheetsStore.js";

function systemPrompt() {
  return [
    "Kamu adalah asisten HRD profesional untuk sistem absensi & kehadiran.",
    "Jawab dalam Bahasa Indonesia yang ramah, padat, dan berbasis data.",
    "Berikan analisa, temuan, dan rekomendasi konkret yang bisa dijalankan HRD.",
    "Jangan membuat data fiktif; gunakan hanya konteks yang diberikan.",
    "Untuk satu karyawan, berikan: ringkasan kehadiran, risiko (telat/alpha),",
    "dan 2-3 rekomendasi peningkatan (coaching / kebijakan).",
  ].join(" ");
}

async function gatherContext({ employeeId } = {}) {
  const limit = config.ai.contextRows;
  const ctx = {};
  try {
    ctx.employees = (await sheets.list("employees")) || [];
  } catch {
    ctx.employees = [];
  }
  try {
    ctx.attendance = (await sheets.list("attendance_log")) || [];
  } catch {
    ctx.attendance = [];
  }
  try {
    ctx.leaves = (await sheets.list("leaves")) || [];
  } catch {
    ctx.leaves = [];
  }
  try {
    ctx.overtime = (await sheets.list("overtime_requests")) || [];
  } catch {
    ctx.overtime = [];
  }

  if (employeeId) {
    ctx.focusEmployee = ctx.employees.find(
      (e) => e.id === employeeId || e.employeeId === employeeId,
    );
    ctx.focusAttendance = ctx.attendance
      .filter((a) => a.employeeId === employeeId || a.pin === employeeId)
      .slice(-limit);
  }

  // Keep payload small: summarize instead of dumping everything
  const summary = {
    totalKaryawan: ctx.employees.length,
    totalLog: ctx.attendance.length,
    sampelAttendance: ctx.attendance.slice(-limit),
    cuti: ctx.leaves,
    lembur: ctx.overtime.slice(-20),
  };
  if (ctx.focusEmployee) {
    summary.focusEmployee = ctx.focusEmployee;
    summary.focusAttendance = ctx.focusAttendance;
  }
  return summary;
}

function buildUserMessage(question, context) {
  return `Pertanyaan HRD: ${question}\n\nData konteks (JSON, maks ${config.ai.contextRows} baris):\n${JSON.stringify(
    context,
  )}`;
}

/**
 * @param {{question:string, employeeId?:string}} input
 */
export async function askHRD({ question, employeeId } = {}) {
  if (!question || !question.trim()) {
    return { mode: "error", answer: "Pertanyaan kosong." };
  }
  if (!config.ai.enabled) {
    return { mode: "disabled", answer: "AI dinonaktifkan (AI_ENABLED=false)." };
  }
  if (!config.ai.apiKey) {
    return { mode: "no-key", answer: "AI_API_KEY belum diisi di .env." };
  }

  const context = await gatherContext({ employeeId });
  const messages = [
    { role: "system", content: systemPrompt() },
    { role: "user", content: buildUserMessage(question, context) },
  ];

  try {
    const res = await fetch(
      `${config.ai.baseUrl.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.ai.apiKey}`,
        },
        body: JSON.stringify({
          model: config.ai.model,
          messages,
          temperature: 0.3,
          max_tokens: 1200,
        }),
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!res.ok) {
      const t = await res.text();
      return {
        mode: "error",
        answer: `Model error (${res.status}): ${t.slice(0, 300)}`,
      };
    }
    const json = await res.json();
    const answer =
      json?.choices?.[0]?.message?.content || "(tidak ada jawaban)";
    return {
      mode: "live",
      answer,
      model: config.ai.model,
      contextKeys: Object.keys(context),
    };
  } catch (err) {
    return { mode: "error", answer: `Gagal memanggil model: ${err.message}` };
  }
}
