/**
 * Report service — aggregates real data into HR-friendly summaries.
 * All numbers are computed from the Sheets datastore (no dummy values).
 */

import sheets from '../core/sheetsStore.js';

function inRange(dt, from, to) {
  if (from && dt < from) return false;
  if (to && dt > to) return false;
  return true;
}

/** Dashboard / period summary: headcount + attendance breakdown. */
export async function summary({ from, to, departmentId } = {}) {
  const [employees, logs, leaves, leaveReqs, holidays] = await Promise.all([
    sheets.list('employees').catch(() => []),
    sheets.list('attendance_log').catch(() => []),
    sheets.list('leaves').catch(() => []),
    sheets.list('leave_requests').catch(() => []),
    sheets.list('holidays').catch(() => []),
  ]);

  let emp = employees;
  if (departmentId) emp = emp.filter((e) => e.departmentId === departmentId);

  const periodLogs = logs.filter((l) => inRange(l.datetime, from, to));
  const days = new Set(periodLogs.map((l) => String(l.datetime).slice(0, 10))).size || 1;

  // Unique persons present in period.
  const presentPersons = new Set(periodLogs.map((l) => l.employeeId || l.pin));
  const total = emp.length || employees.length;
  const absent = Math.max(0, total - presentPersons.size);

  // Late detection: simple heuristic — after 09:00 local.
  const late = periodLogs.filter((l) => {
    const hm = String(l.datetime).slice(11, 16);
    return l.type !== 'OUT' && hm > '09:00';
  }).length;

  const leaveActive = leaveReqs.filter((r) => r.status === 'Approved' || r.status === 'Disetujui').length;
  const holidayCount = holidays.filter((h) => inRange(h.date, from, to)).length;

  return {
    totalKaryawan: total,
    hadirUnik: presentPersons.size,
    tidakHadir: absent,
    telat: late,
    izinCutiDisetujui: leaveActive,
    hariLibur: holidayCount,
    periodeHari: days,
    rentang: { from: from || null, to: to || null },
  };
}

/** Per-department attendance recap. */
export async function recap({ from, to } = {}) {
  const [employees, logs, departments] = await Promise.all([
    sheets.list('employees').catch(() => []),
    sheets.list('attendance_log').catch(() => []),
    sheets.list('departments').catch(() => []),
  ]);
  const byDept = {};
  for (const d of departments) byDept[d.id] = { departemen: d.name, karyawan: 0, hadir: 0 };
  const presentByDept = {};
  const periodLogs = logs.filter((l) => inRange(l.datetime, from, to));
  for (const e of employees) {
    const key = e.departmentId || 'unknown';
    if (!byDept[key]) byDept[key] = { departemen: key, karyawan: 0, hadir: 0 };
    byDept[key].karyawan++;
  }
  for (const l of periodLogs) {
    const e = employees.find((x) => x.id === l.employeeId || x.employeeId === l.employeeId);
    const key = e?.departmentId || 'unknown';
    presentByDept[key] = presentByDept[key] || new Set();
    presentByDept[key].add(l.employeeId || l.pin);
  }
  return Object.values(byDept).map((d) => ({
    ...d,
    hadir: presentByDept[d.departemen === 'unknown' ? 'unknown' : (departments.find((x) => x.name === d.departemen)?.id)]?.size || 0,
  }));
}

/** Timesheet for one employee/month: derive daily in/out + hours. */
export async function timesheet({ employeeId, month } = {}) {
  const logs = (await sheets.list('attendance_log').catch(() => []))
    .filter((l) => (l.employeeId === employeeId || l.pin === employeeId) && (!month || String(l.datetime).startsWith(month)))
    .sort((a, b) => String(a.datetime).localeCompare(String(b.datetime)));

  const byDay = {};
  for (const l of logs) {
    const day = String(l.datetime).slice(0, 10);
    byDay[day] = byDay[day] || { in: null, out: null };
    const hm = String(l.datetime).slice(11, 16);
    if (l.type === 'OUT') byDay[day].out = hm;
    else if (!byDay[day].in) byDay[day].in = hm;
  }
  return Object.entries(byDay).map(([date, v]) => {
    let hours = null;
    if (v.in && v.out) {
      const [ih, im] = v.in.split(':').map(Number);
      const [oh, om] = v.out.split(':').map(Number);
      hours = Math.max(0, (oh * 60 + om - (ih * 60 + im)) / 60);
    }
    return { date, in: v.in, out: v.out, hours: hours ? Number(hours.toFixed(2)) : null };
  });
}
