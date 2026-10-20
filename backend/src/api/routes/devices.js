/**
 * Device routes: LAN discovery, connectivity test, and sync-from-device
 */

import express from "express";
import { discoverLAN } from "../../devices/discovery.js";
import { testConnection, pullAttendance } from "../../devices/deviceClient.js";
import { syncFromDevice } from "../../services/attendanceService.js";
import sheets from "../../core/sheetsStore.js";

const router = express.Router();

// Scan the LAN for attendance machines.
router.post("/discover", async (_req, res) => {
  try {
    const found = await discoverLAN();
    res.json({ data: found, count: found.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List devices already registered in the datastore.
router.get("/", async (_req, res) => {
  try {
    const devices = (await sheets.list("devices")) || [];
    res.json({ data: devices });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Test connectivity to one registered device.
router.post("/:id/test", async (req, res) => {
  try {
    const device = (await sheets.get("devices", req.params.id)) || req.body;
    const result = await testConnection(device);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Pull attendance from one device and ingest (de-duplicated).
router.post("/:id/sync", async (req, res) => {
  try {
    const device = (await sheets.get("devices", req.params.id)) || req.body;
    const result = await syncFromDevice(device);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Quick connectivity probe for an arbitrary host (from discovery results).
router.post("/probe", async (req, res) => {
  try {
    const result = await testConnection(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
