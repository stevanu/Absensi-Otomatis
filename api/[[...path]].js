/**
 * Vercel serverless entry — catch-all for /api/*.
 *
 * Fingerspot (and the SPA) call /api/... ; Vercel strips the /api prefix
 * before reaching this handler, so we mount the API router at "/" and
 * normalise req.url just in case either behaviour changes.
 *
 * The 12h backup scheduler (node-cron) is intentionally NOT started here:
 * serverless functions are ephemeral. Use the Vercel Cron defined in
 * vercel.json (POST /api/sync/now) instead.
 */
import { createApp } from '../backend/src/app.js';

const app = createApp({ mountPrefix: '/' });

export default function handler(req, res) {
  // Normalise path so the router (mounted at "/") sees the correct route.
  if (req.url.startsWith('/api')) {
    req.url = req.url.slice(4) || '/';
  }
  if (req.url === '') req.url = '/';
  return app(req, res);
}
