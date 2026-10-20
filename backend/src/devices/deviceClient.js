// backend/src/devices/deviceClient.js

// Konfigurasi Default
const DEFAULT_SDK_URL = process.env.EASYLINK_SDK_URL || "http://localhost:7005";
const DEFAULT_TIMEOUT = 10000; // 10 detik

/**
 * Normalisasi data perangkat
 */
function normalizeDevice(deviceInput) {
  return {
    id: deviceInput.id || null,
    name: deviceInput.name || "Unknown Device",
    ip: deviceInput.ip || "192.168.1.100",
    port: deviceInput.port || 5005, // PORT MESIN REVO W-230N
    sn:
      deviceInput.sn ||
      deviceInput.serialNumber ||
      deviceInput.serial_number ||
      "",
    sdkUrl: deviceInput.sdkUrl || DEFAULT_SDK_URL,
  };
}

/**
 * Helper memanggil HTTP ke EasyLink SDK
 */
async function callSdk(sdkUrl, endpoint, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${sdkUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        error: `HTTP Error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    clearTimeout(timeoutId);
    return { ok: false, error: error.message };
  }
}

/**
 * Tes Koneksi ke SDK & Mesin
 */
export async function testConnection(deviceInput) {
  const device = normalizeDevice(deviceInput);

  // 1. Cek Service SDK
  const sdkCheck = await callSdk(device.sdkUrl, "/ping", {
    sn: device.sn,
  }).catch(() => null);

  if (!sdkCheck || !sdkCheck.ok) {
    return {
      ok: false,
      stage: "sdk",
      error: `EasyLink SDK tidak merespons di ${device.sdkUrl}. Pastikan service berjalan.`,
    };
  }

  // 2. Cek koneksi SDK ke Mesin
  const infoResult = await callSdk(device.sdkUrl, "/api/get_device", {
    sn: device.sn,
    ip: device.ip,
    port: device.port,
  });

  if (!infoResult.ok) {
    return {
      ok: false,
      stage: "device",
      error: `SDK aktif, tapi gagal terhubung ke mesin: ${infoResult.error}`,
    };
  }

  return {
    ok: true,
    message: "Koneksi ke EasyLink SDK dan Mesin (Port 5005) berhasil!",
  };
}

/**
 * Tarik Data Absensi (Dipanggil oleh attendanceService.js)
 */
export async function pullAttendance(deviceInput) {
  const device = normalizeDevice(deviceInput);

  const result = await callSdk(device.sdkUrl, "/api/get_attlog", {
    sn: device.sn,
    ip: device.ip,
    port: device.port,
  });

  if (!result.ok) {
    return {
      ok: false,
      stage: "sdk",
      error: `Gagal menarik data: ${result.error}`,
    };
  }

  const logs = result.data.data || result.data.logs || [];

  const normalizedLogs = logs.map((log) => ({
    pin: log.pin || log.user_id,
    datetime: log.scan_time || log.datetime || log.timestamp,
    status: "Hadir",
    deviceId: device.id,
    deviceName: device.name,
  }));

  return {
    ok: true,
    stage: "sdk",
    logs: normalizedLogs,
    note: "attendance-from-easylink-sdk",
  };
}
