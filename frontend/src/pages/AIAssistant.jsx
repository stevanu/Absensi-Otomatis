import { useState } from "react";
import api from "../lib/api.js";
import { useUI } from "../store/ui.jsx";
import Topbar from "../fragments/Topbar.jsx";
import PageHeader from "../fragments/PageHeader.jsx";
import Card from "../elements/Card.jsx";
import Select from "../elements/Select.jsx";
import Button from "../elements/Button.jsx";
import Spinner from "../elements/Spinner.jsx";
import Badge from "../elements/Badge.jsx";
import { useLookups } from "../hooks/useLookups.js";

const SUGGESTIONS = [
  "Berapa karyawan yang telat hari ini?",
  "Buatkan ringkasan kehadiran bulan ini.",
  "Apa rekomendasi untuk menurunkan tingkat ketidakhadiran?",
  "Analisa satu karyawan & beri saran coaching.",
];

export default function AIAssistant() {
  const { toast } = useUI();
  const { list } = useLookups();
  const [employeeId, setEmployeeId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    if (!q.trim()) return;
    const userQ = q;
    setMessages((m) => [...m, { role: "user", text: userQ }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await api.post("/ai/ask", {
        question: userQ,
        employeeId: employeeId || undefined,
      });
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: res.answer,
          meta:
            res.mode === "live"
              ? `mode: live · ${res.model || ""}`
              : `mode: ${res.mode}`,
        },
      ]);
    } catch (e) {
      toast.error(e.message);
      setMessages((m) => [
        ...m,
        { role: "ai", text: e.message, meta: "error" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar
        title="Asisten AI"
        subtitle="Analisa, rekomendasi, dan jawab pertanyaan seputar karyawan"
      />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <PageHeader
          title="Asisten AI HRD"
          description="Model LLM (OpenAI-compatible Groq) menjawab berdasar data dari Google Sheets."
        />

        <Card className="mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <Select
              label="Fokus ke satu karyawan (opsional)"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              options={list("employees")}
              placeholder="— Semua karyawan —"
              className="min-w-[260px] flex-1"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-ink-300 px-3 py-1 text-xs text-ink-600 hover:bg-ink-100"
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

        <Card className="min-h-[320px]">
          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-ink-400">
                Ajukan pertanyaan HR, mis. "Cek karyawan yang sering telat" atau
                pilih karyawan lalu minta analisa.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user" ? "flex justify-end" : "flex justify-start"
                }
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-900"}`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.meta && (
                    <p className="mt-1 text-[11px] opacity-60">{m.meta}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-ink-100 px-4 py-3">
                  <Spinner label="AI berpikir…" />
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-4 flex gap-2">
          <input
            className="input-base"
            placeholder="Tulis pertanyaan HR…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(question)}
          />
          <Button onClick={() => ask(question)} loading={loading}>
            Kirim
          </Button>
        </div>
      </div>
    </>
  );
}
