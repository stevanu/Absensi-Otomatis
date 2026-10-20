/**
 * Mounts all API routers. Generic CRUD is mounted for every configured entity;
 * specific modules get their own routers.
 */

import express from 'express';
import { ENTITIES } from '../../config/index.js';
import { genericRouter } from './generic.js';
import devicesRouter from './devices.js';
import attendanceRouter from './attendance.js';
import reportsRouter from './reports.js';
import aiRouter from './ai.js';
import syncRouter from './sync.js';
import webhookRouter from './webhook.js';

const router = express.Router();

// Health check (no store needed).
router.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Generic CRUD per entity.
for (const entity of ENTITIES) {
  router.use(`/${entity}`, genericRouter(entity));
}

// Specific modules.
router.use('/devices', devicesRouter);
router.use('/attendance', attendanceRouter);
router.use('/reports', reportsRouter);
router.use('/ai', aiRouter);
router.use('/sync', syncRouter);
router.use('/webhook', webhookRouter);

export default router;
