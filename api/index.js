
import { createApp } from '../backend/src/app.js';

const app = createApp({ mountPrefix: '/' });

export default function handler(req, res) {
  const requestUrl = new URL(
    req.url || '/',
    `https://${req.headers.host || 'localhost'}`
  );

  // Vercel rewrite menyimpan path API asli di __path.
  const originalPath = requestUrl.searchParams.get('__path');

  if (originalPath !== null) {
    requestUrl.searchParams.delete('__path');

    const cleanPath = originalPath.replace(/^\/+/, '');
    req.url = `/${cleanPath}${requestUrl.search}`;
  } else if (
    requestUrl.pathname === '/api' ||
    requestUrl.pathname.startsWith('/api/')
  ) {
    req.url = `${requestUrl.pathname.slice(4) || '/'}${requestUrl.search}`;
  }

  return app(req, res);
}
