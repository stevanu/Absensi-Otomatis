# Deploy ke Vercel (Fingerspot Web)

Proyek ini sudah di-convert supaya bisa jalan di Vercel **tanpa server yang nyala terus**.
Frontend otomatis jadi static, backend jadi serverless function. Webhook Fingerspot
(`POST /api/webhook/fingerspot`) jadi punya URL publik yang stabil — cocok untuk push data
dari mesin, tidak perlu ngrok.

## Yang sudah diubah
- `backend/src/app.js` — factory `createApp()` (dipakai lokal & Vercel).
- `backend/src/server.js` — cuma `app.listen` + jalankan scheduler (lokal).
- `api/[[...path]].js` — entry serverless Vercel (catch-all `/api/*`).
- `vercel.json` — build frontend, SPA rewrite, cron backup 12 jam.
- `package.json` (root) — dependency backend untuk Vercel.

## Cara deploy
1. **Install Vercel CLI** (sekali): `npm i -g vercel`
2. **Login**: `vercel login`
3. **Deploy** (di folder ini):
   ```bash
   vercel            # pertama kali: pilih "link to existing"? No -> buat project baru
   vercel --prod     # kalau mau langsung production
   ```
   Vercel akan:
   - build frontend (`cd frontend && npm install && npm run build`)
   - output ke `frontend/dist` (static)
   - daftarkan function `api/[[...path]].js`

## Environment Variables (wajib di set di Dashboard Vercel)
Buka **Project → Settings → Environment Variables**, lalu isi:

| Nama | Contoh | Keterangan |
|---|---|---|
| `GAS_URL` | `https://script.google.com/macros/s/xxx/exec` | URL Google Apps Script (wajib, kalau kosong Sheets mati) |
| `GAS_TOKEN` | `rahasia123` | Token GAS (wajib) |
| `AI_ENABLED` | `true` / `false` | Fitur AI |
| `AI_BASE_URL` | `https://api.groq.com/openai/v1` | Endpoint AI |
| `AI_API_KEY` | `gsk_...` | API key AI |
| `AI_MODEL` | `openai/gpt-oss-20b` | Model AI |
| `MYSQL_HOST` | `db.example.com` | Backup MySQL (harus **publik**, bukan localhost) |
| `MYSQL_PORT` | `3306` | |
| `MYSQL_USER` | `root` | |
| `MYSQL_PASSWORD` | `...` | |
| `MYSQL_DATABASE` | `fingerspot_backup` | |
| `DEVICE_SIMULATE` | `false` | |

> Catatan: `PORT` **tidak** dipakai di Vercel (dikelola otomatis).

## Webhook Fingerspot (push dari mesin)
Setelah deploy, kamu dapat URL seperti:
```
https://nama-app-kamu.vercel.app/api/webhook/fingerspot
```
Daftarkan URL itu di **Fingerspot console** (developer.fingerspot.io) sebagai Webhook/Callback.
Tiap karyawan tap → Fingerspot push JSON → langsung masuk sheet `attendance_log` → tampil
di menu **Log Absensi**.

### Tes tanpa mesin
```bash
curl -X POST https://nama-app-kamu.vercel.app/api/webhook/fingerspot \
  -H "Content-Type: application/json" \
  -d '{"type":"attlog","cloud_id":"DEMO01","data":{"pin":"1","scan":"2026-10-21 08:01","verify":"finger","status_scan":"scan in"}}'
```
Respons: `{"ok":true,"deviceId":"DEMO01","inserted":1,"skipped":0}`

## Backup MySQL 12 jam (cron)
`vercel.json` sudah daftarin cron `0 */12 * * *` → `POST /api/sync/now`.
Butuh `MYSQL_*` terisi **dan DB bisa diakses dari internet**. Kalau DB di localhost laptop,
backup tidak bisa jalan di Vercel (tapi webhook → Sheets tetap jalan).

## Catatan
- **Cold start**: function yang idle bisa lambat ~1–3 detik di request pertama. Aman untuk log absensi.
- **Timeout**: default 10 detik, di-set `maxDuration: 60` di vercel.json (butuh akun Pro untuk >60).
- Penarikan via **EasyLink SDK** (Sinkron tombol di menu Perangkat) butuh SDK lokal jalan —
  itu tidak bisa di Vercel, gunakan jalur **webhook** di atas sebagai pengganti.
