/**
 * Local entry point: boots Express, mounts the API, starts the 12h backup
 * sync scheduler, and (in production) serves the built frontend.
 *
 * NOTE: On Vercel this file is NOT used — see api/[[...path]].js instead.
 */
import { createApp } from './app.js';
import { config } from './config/index.js';
import { startSyncScheduler } from './core/sync.js';

const app = createApp();
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`[fingerspot-web] API listening on :${PORT}`);
  console.log(`[fingerspot-web] Sheets(GAS): ${config.gas.enabled ? 'ON' : 'OFF (isi GAS_URL)'}`);
  console.log(`[fingerspot-web] AI: ${config.ai.enabled ? 'ON (' + config.ai.model + ')' : 'OFF'}`);
  startSyncScheduler();
});
