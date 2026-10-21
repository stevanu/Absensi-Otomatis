/**
 * Central entity configuration.
 *
 * This is the single source of truth that drives the generic CRUD pages, so we
 * never repeat table/form code per module. Each field can pull its options from
 * another entity (via `optionsFrom`) — the UI resolves those labels at runtime.
 */

const STATUS_OPTIONS = ["Tetap", "Kontrak", "Magang", "Trial"];
const SHIFT_TYPE = ["Tetap", "Fleksibel", "Interval"];
const CYCLE = ["Mingguan", "Harian"];
const LEAVE_KIND = ["Perusahaan", "Pemerintah", "Pribadi"];
const HOLIDAY_TYPE = ["Libur Publik", "Cuti Bersama", "Perusahaan"];
const OVERTIME_TYPE = ["Awal", "Akhir", "Shift"];
const REQUEST_STATUS = ["Menunggu", "Disetujui", "Ditolak"];
const RULE_TYPE = ["Absensi", "Istirahat", "Lembur"];

export const ENTITIES = {
  companies: {
    label: "Perusahaan",
    fields: [
      {
        name: "id",
        label: "ID",
        type: "text",
        required: true,
        placeholder: "COMP-01",
      },
      { name: "name", label: "Nama Perusahaan", type: "text", required: true },
      { name: "address", label: "Alamat", type: "textarea" },
      { name: "phone", label: "Telepon", type: "tel" },
    ],
    columns: ["id", "name", "phone"],
  },

  departments: {
    label: "Departemen",
    fields: [
      {
        name: "id",
        label: "ID",
        type: "text",
        required: true,
        placeholder: "DEP-01",
      },
      { name: "name", label: "Nama Departemen", type: "text", required: true },
      {
        name: "companyId",
        label: "Perusahaan",
        type: "select",
        optionsFrom: "companies",
      },
      { name: "code", label: "Kode", type: "text" },
    ],
    columns: ["id", "name", "companyId", "code"],
  },

  offices: {
    label: "Kantor / Cabang",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      { name: "name", label: "Nama Kantor", type: "text", required: true },
      {
        name: "companyId",
        label: "Perusahaan",
        type: "select",
        optionsFrom: "companies",
      },
      { name: "address", label: "Alamat", type: "textarea" },
      { name: "latitude", label: "Latitude (geofence)", type: "number" },
      { name: "longitude", label: "Longitude (geofence)", type: "number" },
    ],
    columns: ["id", "name", "companyId"],
  },

  positions: {
    label: "Posisi",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      { name: "name", label: "Nama Posisi", type: "text", required: true },
      {
        name: "departmentId",
        label: "Departemen",
        type: "select",
        optionsFrom: "departments",
      },
    ],
    columns: ["id", "name", "departmentId"],
  },

  employees: {
    label: "Karyawan",
    fields: [
      {
        name: "id",
        label: "ID",
        type: "text",
        required: true,
        placeholder: "EMP-001",
      },
      {
        name: "employeeId",
        label: "NIP / No. Induk",
        type: "text",
        required: true,
        unique: true,
      },
      { name: "name", label: "Nama Lengkap", type: "text", required: true },
      { name: "nik", label: "NIK", type: "text" },
      {
        name: "departmentId",
        label: "Departemen",
        type: "select",
        optionsFrom: "departments",
      },
      {
        name: "positionId",
        label: "Posisi",
        type: "select",
        optionsFrom: "positions",
      },
      {
        name: "officeId",
        label: "Kantor",
        type: "select",
        optionsFrom: "offices",
      },
      { name: "phone", label: "No. Telp", type: "tel" },
      { name: "email", label: "Email", type: "email" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: STATUS_OPTIONS,
      },
      { name: "joinDate", label: "Tgl Gabung", type: "date" },
      { name: "contractEnd", label: "Akhir Kontrak", type: "date" },
    ],
    columns: ["employeeId", "name", "departmentId", "positionId", "status"],
  },

  shifts: {
    label: "Shift",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      { name: "name", label: "Nama Shift", type: "text", required: true },
      { name: "type", label: "Tipe", type: "select", options: SHIFT_TYPE },
      { name: "startTime", label: "Jam Masuk", type: "time" },
      { name: "endTime", label: "Jam Keluar", type: "time" },
      { name: "lateTolerance", label: "Toleransi Telat (mnt)", type: "number" },
      { name: "overtimeStart", label: "Mulai Lembur", type: "time" },
    ],
    columns: ["id", "name", "type", "startTime", "endTime"],
  },

  schedules: {
    label: "Jadwal",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      { name: "name", label: "Nama Jadwal", type: "text", required: true },
      { name: "code", label: "Kode", type: "text" },
      { name: "cycle", label: "Siklus", type: "select", options: CYCLE },
      {
        name: "shiftId",
        label: "Shift",
        type: "select",
        optionsFrom: "shifts",
      },
      { name: "startDate", label: "Berlaku Dari", type: "date" },
      { name: "endDate", label: "Berlaku Sampai", type: "date" },
    ],
    columns: ["id", "name", "cycle", "shiftId"],
  },

  rules: {
    label: "Aturan",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      { name: "name", label: "Nama Aturan", type: "text", required: true },
      { name: "type", label: "Tipe", type: "select", options: RULE_TYPE },
      { name: "description", label: "Keterangan", type: "textarea" },
    ],
    columns: ["id", "name", "type"],
  },

  leaves: {
    label: "Jenis Cuti & Izin",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "code", label: "Kode", type: "text" },
      { name: "isPermission", label: "Tandai sebagai Izin", type: "bool" },
      { name: "paid", label: "Berbayar", type: "bool" },
      { name: "quota", label: "Kuota (hari)", type: "number" },
      { name: "kind", label: "Jenis", type: "select", options: LEAVE_KIND },
    ],
    columns: ["id", "name", "code", "isPermission", "paid", "quota"],
  },

  leave_requests: {
    label: "Pengajuan Cuti & Izin",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      {
        name: "employeeId",
        label: "Karyawan",
        type: "select",
        optionsFrom: "employees",
        required: true,
      },
      {
        name: "leaveTypeId",
        label: "Jenis",
        type: "select",
        optionsFrom: "leaves",
        required: true,
      },
      { name: "startDate", label: "Dari", type: "date", required: true },
      { name: "endDate", label: "Sampai", type: "date", required: true },
      { name: "reason", label: "Alasan", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: REQUEST_STATUS,
      },
    ],
    columns: ["employeeId", "leaveTypeId", "startDate", "endDate", "status"],
  },

  overtime_categories: {
    label: "Kategori Lembur",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      { name: "name", label: "Nama Kategori", type: "text", required: true },
      { name: "rate", label: "Rate (x gaji)", type: "number" },
    ],
    columns: ["id", "name", "rate"],
  },

  overtime_requests: {
    label: "Pengajuan Lembur",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      {
        name: "employeeId",
        label: "Karyawan",
        type: "select",
        optionsFrom: "employees",
        required: true,
      },
      { name: "date", label: "Tanggal", type: "date", required: true },
      { name: "type", label: "Tipe", type: "select", options: OVERTIME_TYPE },
      { name: "start", label: "Mulai", type: "time" },
      { name: "end", label: "Selesai", type: "time" },
      { name: "duration", label: "Durasi (jam)", type: "number" },
      {
        name: "categoryId",
        label: "Kategori",
        type: "select",
        optionsFrom: "overtime_categories",
      },
      { name: "note", label: "Catatan", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: REQUEST_STATUS,
      },
    ],
    columns: ["employeeId", "date", "type", "duration", "categoryId", "status"],
  },

  holidays: {
    label: "Hari Libur",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "code", label: "Kode", type: "text" },
      { name: "type", label: "Tipe", type: "select", options: HOLIDAY_TYPE },
      { name: "paid", label: "Berbayar", type: "bool" },
      { name: "date", label: "Tanggal", type: "date", required: true },
      { name: "description", label: "Keterangan", type: "textarea" },
    ],
    columns: ["id", "name", "type", "paid", "date"],
  },

  devices: {
    label: "Perangkat",
    fields: [
      {
        name: "id",
        label: "ID",
        type: "text",
        required: true,
        placeholder: "DEV-01",
      },
      { name: "name", label: "Nama", type: "text", required: true },
      {
        name: "model",
        label: "Model",
        type: "text",
        placeholder: "Revo W-230N",
      },
      { name: "ip", label: "IP Address", type: "text", required: true },
      { name: "port", label: "Port", type: "number", required: true },
      { name: "username", label: "Username", type: "text" },
      { name: "password", label: "Password", type: "password" },
      { name: "apiUrl", label: "API URL (bridge/cloud)", type: "text" },
      { name: "apiKey", label: "API Key", type: "password" },
      { name: "cloudEnabled", label: "Aktifkan Cloud", type: "bool" },
    ],
    columns: ["id", "name", "model", "ip", "port"],
  },

  users: {
    label: "Pengguna",
    fields: [
      { name: "id", label: "ID", type: "text", required: true },
      { name: "username", label: "Username", type: "text", required: true },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: ["Admin", "HRD", "Manager"],
      },
      { name: "email", label: "Email", type: "email" },
    ],
    columns: ["id", "username", "role"],
  },

  attendance_log: {
    label: "Log Absensi",
    readOnly: true,
    fields: [
      { name: "id", label: "ID", type: "text", readonly: true },
      {
        name: "employeeId",
        label: "Karyawan",
        type: "select",
        optionsFrom: "employees",
        readonly: true,
      },
      { name: "deviceId", label: "Perangkat", type: "text", readonly: true },
      { name: "datetime", label: "Waktu", type: "text", readonly: true },
      { name: "type", label: "Tipe", type: "text", readonly: true },
    ],
    columns: ["employeeId", "deviceId", "datetime", "type"],
  },
};

export default ENTITIES;
