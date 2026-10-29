# Fingerspot Web — Sistem HR & Absensi Berbasis Web

Replika web profesional dari aplikasi **Fingerspot.io Desktop**: Dashboard, Perangkat,
Log Absensi, Timesheet, Laporan, Jadwal & Shift, Cuti & Izin, Lembur, Hari Libur,
Karyawan, Perusahaan, Pengguna, Pengaturan — **plus Asisten AI HRD**.

> Dibangun dengan React + Tailwind (frontend) dan Node/Express (backend).
> semua data berasal dari Google Sheets / perangkat nyata di LAN.

---

## Arsitektur Penyimpanan

```
┌──────────────┐    REST/JSON     ┌──────────────────────┐
│  React UI    │ ───────────────▶ │  Backend (Express)   │
│ (Tailwind)   │                  │                      │
└──────────────┘                  │  • Generic CRUD      │
                                  │  • AI Agent (LLM)    │
                                  │  • Device LAN scan   │
                                  └──────────┬───────────┘
                                            │
                       ┌────────────────────┼─────────────────────┐
                       ▼                    ▼                     ▼
              ┌────────────────┐   ┌──────────────────┐   ┌──────────────┐
              │ Google Sheets  │   │  MySQL (backup)  │   │ Mesin Absensi│
              │  (PRIMARY DB)  │   │  sync tiap 12 jam│   │  (LAN/Revo)  │
              └────────────────┘   └──────────────────┘   └──────────────┘
```

- **Penyimpanan utama = Google Spreadsheet** (lewat Google Apps Script `integrations/google-apps-script.gs`).
- **Cadangan = MySQL**: setiap 12 jam (00:00 & 12:00) data dari Sheets ditarik & di-_upsert_ ke MySQL (tanpa duplikat, kunci = `id`).
- **Perangkat**: dideteksi otomatis di LAN (scan TCP port 5005/4370/80/8080). Sync menarik log absensi dan otomatis **menghindari duplikat** (kunci = `deviceId|pin|datetime`).
- **AI Agent**: LLM OpenAI-compatible (mis. Groq) menjawab pertanyaan HR berdasar data nyata.

---

## 1. Setup Google Sheets (Database Utama)

1. Buka https://script.google.com → **New Project**.
2. Hapus isi `Code.gs`, lalu **paste** seluruh isi `integrations/google-apps-script.gs`.
3. **Project Settings → Script Properties** → tambah `AUTH_TOKEN` (string acak, mis. `fsw_rahasia123`).
4. Pilih fungsi `setupSheets` → klik **Run ▶** (izin akses Spreadsheet).
5. **Deploy → New Deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone** (token tetap menyaring akses)
6. Copy **URL Web App** → masukkan ke `backend/.env` sebagai `GAS_URL`.
7. Masukkan `AUTH_TOKEN` yang sama ke `backend/.env` sebagai `GAS_TOKEN`.

> Pastikan Spreadsheet yang terikat pada project Apps Script adalah spreadsheet yang
> ingin dipakai sebagai database (File → New → Spreadsheet saat membuat container, atau
> ganti `openStore()` menjadi `SpreadsheetApp.openById('ID_ANDA')`).

---

## 2. Setup MySQL (Cadangan)

Buat database (skema tabel dibuat otomatis saat sync pertama):

```sql
CREATE DATABASE fingerspot_backup CHARACTER SET utf8mb4;
```

Isi `backend/.env`: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.

---

## 3. Backend

```bash
cd backend
cp .env.example .env        # lalu isi GAS_URL, GAS_TOKEN, MySQL, AI_API_KEY
npm install
npm run dev                # http://localhost:4000
```

Endpoint utama: `/api/health`, `/api/<entity>`, `/api/devices/discover`,
`/api/attendance`, `/api/reports/*`, `/api/ai/ask`, `/api/sync/*`.

---

## 4. Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 (proxy /api → :4000)
# atau build lalu dilayani langsung oleh backend:
npm run build
```

Di produksi, cukup jalankan backend — ia menyajikan `frontend/dist` secara otomatis.

---

## 5. Menyambungkan Mesin Absensi 

1. Pastikan PC dan mesin **se-jaringan (LAN sama)**.
2. Buka menu **Perangkat → Pindai LAN**. Host yang merespons port mesin akan muncul.
3. Klik **Tambah** → simpan. Lalu **Tes** koneksi, lalu **Sinkron** untuk tarik log.
4. Alternatif tanpa SDK vendor: isi `apiUrl` (bridge/Cloud API Revo) dan `apiKey` pada
   perangkat; backend akan menarik JSON log dari URL tersebut.

Log yang ditarik otomatis di-de-duplikasi (tidak ada tap ganda).

---

## 6. Asisten AI HRD

Isi `backend/.env`:

```
AI_ENABLED=true
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=gsk_xxxx
AI_MODEL=openai/gpt-oss-20b
```

Buka menu **Asisten AI**, ajukan pertanyaan (mis. "Siapa yang sering telat?") atau pilih
satu karyawan untuk analisa & rekomendasi coaching.

---

## Struktur Kode

```
fingerspot-web/
├── backend/
│   └── src/
│       ├── config/          # pembacaan .env, daftar entitas
│       ├── core/           # sheetsStore, mysqlBackup, sync (12 jam)
│       ├── devices/        # discovery LAN + deviceClient
│       ├── ai/             # agent HRD (context + LLM)
│       ├── services/       # crudService, attendanceService (dedup), reportService
│       ├── api/routes/     # generic CRUD + device/attendance/reports/ai/sync
│       └── server.js
├── frontend/
│   └── src/
│       ├── layout/         # AppLayout (shell)
│       ├── elements/       # atom UI: Button, Card, Input, Select, Modal, Table, Badge, Stat, …
│       ├── fragments/      # Sidebar, Topbar, CrudTable, EntityFormModal, ConfirmDialog, …
│       ├── pages/          # Dashboard, Devices, Attendance, Timesheet, Reports, AI, Settings, EntityPage
│       ├── lib/            # api client + entities config (sumber konfigurasi tunggal)
│       ├── store/          # UI context (toast, sidebar)
│       └── hooks/          # useLookups (resolusi label select)
└── integrations/
    └── google-apps-script.gs   # datastore Sheets
```

**Prinsip refactor**: seluruh modul CRUD (Perusahaan, Departemen, Karyawan, Shift, …)
digerakkan oleh **satu** `EntityPage` + `CrudTable` + `EntityFormModal` yang dibaca dari
`lib/entities.js` — tidak ada duplikasi form/table per modul.

---

## Keamanan & Kualitas

- Token Apps Script menyaring akses ke Sheets.
- Password perangkat disimpan di Sheets (enkripsi level transport via HTTPS GAS).
- Tidak ada data dummy/seed; UI menampilkan empty-state bila memang kosong.
- De-duplikasi ganda: `id` unik di Sheets & MySQL, dan `deviceId|pin|datetime` unik di log absensi.
