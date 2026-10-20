/**
 * Report routes: dashboard summary, department recap, and timesheet.
 */

import express from 'express';
import { summary, recap, timesheet } from '../../services/reportService.js';

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const { from, to, departmentId } = req.query;
    const data = await summary({ from, to, departmentId });
    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/recap', async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await recap({ from, to });
    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/timesheet', async (req, res) => {
  try {
    const { employeeId, month } = req.query;
    const data = await timesheet({ employeeId, month });
    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
