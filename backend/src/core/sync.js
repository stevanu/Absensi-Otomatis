/**
 * Sync job: every 12h (and on manual trigger) pull all rows from the Google
 * Sheets datastore and mirror them into MySQL. Sheets stays the source of truth;
 * MySQL is the backup / analytics mirror. This avoids duplicate rows because
 * MySQL upserts by `id`.
 */

import cron from 'node-cron';
import { config, ENTITIES } from '../config/index.js';
import sheets from './sheetsStore.js';
import { ensureDatabase, upsertRows, countRows } from './mysqlBackup.js';

let running = false;
let lastRun = null;
const history = [];

export async function runSync() {
  if (running) return { skipped: true, reason: 'sync already running' };
  running = true;
  const started = new Date();
  const report = { startedAt: started.toISOString(), entities: {}, ok: true, error: null };
  try {
    await ensureDatabase();
    for (const entity of ENTITIES) {
      try {
        const rows = (await sheets.list(entity)) || [];
        const { inserted, updated } = await upsertRows(entity, rows);
        report.entities[entity] = { count: rows.length, inserted, updated };
      } catch (err) {
        report.entities[entity] = { error: err.message };
        report.ok = false;
      }
    }
  } catch (err) {
    report.ok = false;
    report.error = err.message;
  } finally {
    running = false;
    lastRun = new Date();
    report.finishedAt = lastRun.toISOString();
    history.unshift(report);
    if (history.length > 20) history.pop();
  }
  return report;
}

export function syncStatus() {
  return {
    running,
    lastRun: lastRun ? lastRun.toISOString() : null,
    nextRuns: ['setiap 12 jam (00:00 & 12:00)'],
    history: history.slice(0, 5),
  };
}

export function startSyncScheduler() {
  // Fire at 00:00 and 12:00 every day (covers "every 12 hours").
  cron.schedule('0 0 * * *', () => runSync().catch(() => {}), { timezone: 'Asia/Jakarta' });
  cron.schedule('0 12 * * *', () => runSync().catch(() => {}), { timezone: 'Asia/Jakarta' });
  // Also run once shortly after boot so the backup is never empty for long.
  setTimeout(() => runSync().catch(() => {}), 30_000);
}
