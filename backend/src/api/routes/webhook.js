/**
 * Fingerspot webhook receiver.
 *
 * Fingerspot does NOT support pull from our backend — it PUSHES events to a URL
 * you register in the Fingerspot console (developer.fingerspot.io / Fingerspot
 * cloud). Each tap is sent as a JSON POST with this shape (see their official
 * demo_webhook sample):
 *
 *   {
 *     "type": "attlog",
 *     "cloud_id": "XXXXXX",
 *     "data": {
 *       "pin": "1",
 *       "scan": "2020-07-21 10:11",
 *       "verify": "finger",
 *       "status_scan": "scan in"
 *     }
 *   }
 *
 * Only `type === 'attlog'` is ingested into the attendance_log sheet, using the
 * same de-duplicated upsert as the EasyLink-SDK sync path. Other event types
 * (user/device enrolment, etc.) are acknowledged with 200 so Fingerspot does
 * not retry, but are not stored.
 */

import express from 'express';
import { ingestLogs } from '../../services/attendanceService.js';

const router = express.Router();

router.post('/fingerspot', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || payload.type !== 'attlog' || !payload.data) {
      // Acknowledge (don't store) non-attendance events.
      return res.json({ ok: true, ignored: true, type: payload?.type });
    }

    const d = payload.data;
    const deviceId = payload.cloud_id || 'fingerspot';
    const pin = d.pin ?? d.employeeId ?? d.id;
    const datetime = d.scan ?? d.datetime ?? d.timestamp;
    if (!pin || !datetime) {
      return res.status(400).json({ ok: false, error: 'attlog tanpa pin/datetime' });
    }

    // Shape expected by attendanceService.ingestLogs -> attendance_log sheet.
    const raw = [
      {
        pin,
        employeeId: d.employeeId || pin,
        datetime,
        type: d.status_scan || d.type || 'IN',
        verify: d.verify || '',
      },
    ];

    const result = await ingestLogs(raw, deviceId);
    res.json({ ok: true, deviceId, ...result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
