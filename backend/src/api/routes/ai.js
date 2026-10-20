/**
 * AI assistant route.
 */

import express from 'express';
import { askHRD } from '../../ai/agent.js';

const router = express.Router();

router.post('/ask', async (req, res) => {
  try {
    const { question, employeeId } = req.body || {};
    const result = await askHRD({ question, employeeId });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
