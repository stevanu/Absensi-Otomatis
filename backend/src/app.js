/**
 * App factory, extracted from server.js so the same Express app can be
 * reused by:
 *   - the long-running local server (server.js -> app.listen)
 *   - the Vercel serverless entry (api/[[...path]].js)
 *
 * Mount prefix note:
 *   - Locally we keep the original "/api" prefix.
 *   - On Vercel the catch-all function receives req.url WITHOUT the leading
 *     "/api", so the Vercel entry mounts the router at "/" instead.
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import api from './api/routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp({ mountPrefix = '/api' } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(mountPrefix, api);

  // Serve built frontend if present (single-process / local production).
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith(mountPrefix)) return next();
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'internal_error', message: err.message });
  });

  return app;
}

export default createApp;
