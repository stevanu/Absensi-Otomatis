/**
 * Attendance service.
 *
 * Key responsibility: NEVER store duplicate taps. Each attendance record gets a
 * stable composite id = `${deviceId}|${pin}|${datetime}` so re-pulling from a
 * device or re-syncing from Sheets is idempotent (upsert, not insert).
 */

import sheets from '../core/sheetsStore.js';
import { pullAttendance } from '../devices/deviceClient.js';

/** Build a deterministic, collision-free id for one attendance row. */
export function attendanceId(deviceId, pin, datetime) {
  return [deviceId || 'unknown', pin ?? 'unknown', datetime ?? 'unknown'].join('|');
}

/**
 * Ingest raw logs (from a device or external source) with de-duplication.
 * @returns {{inserted:number, skipped:number}}
 */
export async function ingestLogs(rawLogs, deviceId) {
  const rows = [];
  for (const log of rawLogs || []) {
    const pin = log.pin ?? log.employeeId ?? log.id;
    const datetime = log.datetime ?? log.timestamp ?? log.time;
    if (!pin || !datetime) continue; // skip unusable rows instead of faking
    const id = attendanceId(deviceId, pin, datetime);
    rows.push({
      id,
      deviceId: deviceId || log.deviceId,
      pin,
      employeeId: log.employeeId || pin,
      datetime,
      type: log.type ?? (log.status ?? 'IN'),
      raw: typeof log === 'object' ? JSON.stringify(log) : String(log),
    });
  }
  if (rows.length === 0) return { inserted: 0, skipped: 0 };
  const result = await sheets.bulkUpsert('attendance_log', rows, 'id');
  const inserted = result?.inserted ?? rows.length;
  return { inserted, skipped: rows.length - inserted };
}

/** List attendance with optional filters. */
export async function listAttendance({ employeeId, from, to, deviceId, limit } = {}) {
  let rows = (await sheets.list('attendance_log')) || [];
  if (employeeId) rows = rows.filter((r) => r.employeeId === employeeId || r.pin === employeeId);
  if (deviceId) rows = rows.filter((r) => r.deviceId === deviceId);
  if (from) rows = rows.filter((r) => r.datetime >= from);
  if (to) rows = rows.filter((r) => r.datetime <= to);
  rows.sort((a, b) => String(b.datetime).localeCompare(String(a.datetime)));
  if (limit) rows = rows.slice(0, Number(limit));
  return rows;
}

/** Pull from a configured device and ingest (de-duplicated). */
export async function syncFromDevice(device) {
  const pull = await pullAttendance(device);
  if (!pull.ok) return pull;
  const res = await ingestLogs(pull.logs, device.id || device.ip);
  return { ok: true, ...res, note: pull.note };
}
