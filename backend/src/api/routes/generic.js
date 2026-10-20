/**
 * Generic CRUD router factory. Mounts REST endpoints for a Sheets-backed entity
 * Avoids repeating the same 5 routes for every module
 *
 *   GET    /api/:entity          -> list (optional ?q= full-text search)
 *   GET    /api/:entity/:id      -> get one
 *   POST   /api/:entity          -> create
 *   PUT    /api/:entity/:id      -> update
 *   DELETE /api/:entity/:id      -> remove
 *   POST   /api/:entity/bulk     -> bulk upsert (de-duplicated by id)
 */

import express from "express";
import { makeCrudService } from "../../services/crudService.js";
import { ID_FIELD } from "../../config/index.js";

export function genericRouter(entity) {
  const router = express.Router();
  const svc = makeCrudService(entity);

  router.get("/", async (req, res) => {
    try {
      let rows = await svc.list();
      const q = req.query.q;
      if (q) {
        const needle = String(q).toLowerCase();
        rows = rows.filter((r) =>
          Object.values(r || {}).some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(needle),
          ),
        );
      }
      res.json({ data: rows, total: rows.length });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const row = await svc.get(req.params.id);
      if (!row) return res.status(404).json({ error: "tidak ditemukan" });
      res.json({ data: row });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const created = await svc.create(req.body);
      res.status(201).json({ data: created });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const updated = await svc.update(req.params.id, req.body);
      res.json({ data: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await svc.remove(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post("/bulk", async (req, res) => {
    try {
      const rows = Array.isArray(req.body) ? req.body : req.body.rows;
      const result = await svc.bulkUpsert(rows || [], ID_FIELD);
      res.json({ ok: true, ...result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
