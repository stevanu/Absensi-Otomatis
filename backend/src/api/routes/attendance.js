/**
 * Attendance routes: list (filtered), ingest from device, and manual entry.
 */

import express from 'express';
import { listAttendance, ingestLogs } from '../../services/attendanceService.js';
import { testConnection, pullAttendance } from '../../devices/deviceClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { employeeId, from, to, deviceId, limit } = req.query;
    const rows = await listAttendance({ employeeId, from, to, deviceId, limit });
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Manual / bulk ingest with de-duplication.
router.post('/ingest', async (req, res) => {
  try {
    const raw = Array.isArray(req.body) ? req.body : req.body.logs;
    const deviceId = req.body.deviceId;
    const result = await ingestLogs(raw, deviceId);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Probe a device directly and return raw logs (no persistence).
router.post('/probe', async (req, res) => {
  try {
    const device = req.body;
    const conn = await testConnection(device);
    if (!conn.ok) return res.json({ ok: false, error: conn.error });
    const pull = await pullAttendance(device);
    res.json(pull);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
