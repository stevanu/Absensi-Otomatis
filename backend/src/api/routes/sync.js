/**
 * Sync + health routes.
 */

import express from "express";
import { runSync, syncStatus } from "../../core/sync.js";
import { config } from "../../config/index.js";
import { getPool } from "../../core/mysqlBackup.js";

const router = express.Router();

router.get("/status", async (_req, res) => {
  let mysqlConnected = false;

  try {
    const pool = getPool();
    const conn = await pool.getConnection();

    try {
      await conn.ping();
      mysqlConnected = true;
    } finally {
      conn.release();
    }
  } catch (_e) {
    mysqlConnected = false;
  }

  res.json({
    sheets: config.gas.enabled,
    mysql: {
      host: config.mysql.host,
      database: config.mysql.database,
      connected: mysqlConnected,
    },
    ai: config.ai.enabled,
    sync: syncStatus(),
  });
});

router.post("/now", async (_req, res) => {
  try {
    if (!config.gas.enabled) {
      return res.status(400).json({
        error: "Sheets (GAS) belum dikonfigurasi.",
      });
    }

    const report = await runSync();

    res.json({
      ok: true,
      report,
    });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
