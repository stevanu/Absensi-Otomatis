const BASE = "/api";

/**
 * API CACHE
 */

const cache = new Map();
const pending = new Map();

const DEFAULT_TTL = 30_000;

/**
 * PATH / CACHE KEY
 */

function normalizePath(path) {
  if (!path) return "/";

  const raw = String(path);

  const [pathname, query = ""] = raw.split("?");

  if (!query) {
    return pathname || "/";
  }

  try {
    const params = new URLSearchParams(query);

    params.sort();

    const normalizedQuery = params.toString();

    return normalizedQuery
      ? `${pathname || "/"}?${normalizedQuery}`
      : pathname || "/";
  } catch {
    return raw.endsWith("?") ? raw.slice(0, -1) : raw;
  }
}

function getCached(path) {
  return cache.get(normalizePath(path)) || null;
}

function setCached(path, data) {
  const key = normalizePath(path);

  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

function isFresh(item, ttl = DEFAULT_TTL) {
  if (!item) return false;

  return Date.now() - item.timestamp < ttl;
}

function removeCache(path) {
  cache.delete(normalizePath(path));
}

function invalidatePrefix(prefix) {
  const normalized = normalizePath(prefix);

  for (const key of cache.keys()) {
    if (
      key === normalized ||
      key.startsWith(`${normalized}?`) ||
      key.startsWith(`${normalized}/`)
    ) {
      cache.delete(key);
    }
  }
}

function clearCache() {
  cache.clear();
}

/**
 * CACHE GROUP
 */

function invalidateAttendance() {
  invalidatePrefix("/attendance");
  invalidatePrefix("/timesheet");
  invalidatePrefix("/reports");
  invalidatePrefix("/stats");
}

function invalidateEmployees() {
  invalidatePrefix("/employees");
  invalidatePrefix("/users");
}

function invalidateDevices() {
  invalidatePrefix("/devices");
  invalidatePrefix("/device");
  invalidatePrefix("/attendance");
}

function invalidateSettings() {
  invalidatePrefix("/settings");
}

/**
 * REQUEST
 */

async function req(path, { method = "GET", body, token, signal } = {}) {
  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["x-admin-token"] = token;
  }

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text().catch(() => "");

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      (typeof data === "string" ? data : "") ||
      `${response.status} ${response.statusText}`;

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/**
 * GET
 */

async function get(
  path,
  { cache: useCache = true, force = false, ttl = DEFAULT_TTL, signal } = {},
) {
  const key = normalizePath(path);

  /**
   * 1. Cache fresh.
   */
  if (!force && useCache) {
    const cached = getCached(key);

    if (isFresh(cached, ttl)) {
      return cached.data;
    }
  }

  if (!force && pending.has(key)) {
    return pending.get(key);
  }

  if (force && pending.has(key)) {
    return pending.get(key);
  }

  const promise = req(key, {
    method: "GET",
    signal,
  })
    .then((data) => {
      if (useCache) {
        setCached(key, data);
      }

      return data;
    })
    .finally(() => {
      pending.delete(key);
    });

  pending.set(key, promise);

  return promise;
}

/*
  GENERIC MUTATIONS
 */

async function post(path, body, options = {}) {
  return req(path, {
    ...options,
    method: "POST",
    body,
  });
}

async function put(path, body, options = {}) {
  return req(path, {
    ...options,
    method: "PUT",
    body,
  });
}

async function patch(path, body, options = {}) {
  return req(path, {
    ...options,
    method: "PATCH",
    body,
  });
}

async function del(path, options = {}) {
  return req(path, {
    ...options,
    method: "DELETE",
  });
}

/*
  API
 */

const api = {
  /*
    Generic
   */

  get,

  post,

  put,

  patch,

  delete: del,

  peek(path) {
    return getCached(path);
  },

  refresh(path, options = {}) {
    return get(path, {
      ...options,
      force: true,
    });
  },

  invalidate(path) {
    removeCache(path);
  },

  invalidatePrefix,

  clearCache,

  /*
    Health
   */

  health() {
    return get("/health", {
      ttl: 10_000,
    });
  },

  /*
    Employees
   */

  listEmployees(q = "") {
    const query = String(q || "").trim();

    return get(
      `/employees${query ? `?search=${encodeURIComponent(query)}` : ""}`,
      {
        ttl: 30_000,
      },
    );
  },

  getEmployee(pin) {
    return get(`/employees/${encodeURIComponent(pin)}`, {
      ttl: 15_000,
    });
  },

  async createEmployee(data, token) {
    const result = await post("/employees", data, { token });

    invalidateEmployees();

    return result;
  },

  async updateEmployee(id, data, token) {
    const result = await put(`/employees/${encodeURIComponent(id)}`, data, {
      token,
    });

    invalidateEmployees();

    return result;
  },

  async deleteEmployee(id, token) {
    const result = await del(`/employees/${encodeURIComponent(id)}`, { token });

    invalidateEmployees();

    return result;
  },

  /*
    Attendance
   */

  listAttendance(q = "") {
    const query = String(q || "").trim();

    return get(`/attendance${query ? `?${query}` : ""}`, {
      ttl: 15_000,
    });
  },

  stats() {
    return get("/attendance/stats", {
      ttl: 15_000,
    });
  },

  /**
    Devices
   *
   * Backend utama menggunakan:
   *
   * GET  /devices
   * POST /devices/discover
   * POST /devices/:id/test
   * POST /devices/:id/sync
   */

  listDevices() {
    return get("/devices", {
      ttl: 30_000,
    });
  },

  discoverDevices() {
    return post("/devices/discover", {});
  },

  async createDevice(data, token) {
    const result = await post("/devices", data, { token });

    invalidateDevices();

    return result;
  },

  async updateDevice(id, data, token) {
    const result = await put(`/devices/${encodeURIComponent(id)}`, data, {
      token,
    });

    invalidateDevices();

    return result;
  },

  async deleteDevice(id, token) {
    const result = await del(`/devices/${encodeURIComponent(id)}`, { token });

    invalidateDevices();

    return result;
  },

  async testDeviceById(id, data, token) {
    return post(`/devices/${encodeURIComponent(id)}/test`, data, { token });
  },

  async syncDevice(id, data, token) {
    const result = await post(`/devices/${encodeURIComponent(id)}/sync`, data, {
      token,
    });

    if (result?.ok) {
      invalidateAttendance();
      invalidateDevices();
    }

    return result;
  },

  deviceStatus() {
    return get("/device/status", {
      ttl: 10_000,
    });
  },

  testDevice(token) {
    return post("/device/test", undefined, { token });
  },

  syncUsers(token) {
    return post("/device/sync-users", undefined, { token }).then((result) => {
      invalidateEmployees();
      return result;
    });
  },

  syncAttendance(token) {
    return post("/device/sync-attendance", undefined, { token }).then(
      (result) => {
        invalidateAttendance();
        return result;
      },
    );
  },

  /*
    AI
   */

  askAI(question) {
    return post("/ai/ask", {
      question,
    });
  },
  settings() {
    return get("/settings", {
      ttl: 60_000,
    });
  },

  async updateSettings(data, token) {
    const result = await put("/settings", data, { token });

    invalidateSettings();

    return result;
  },

  /*
    Backup
   */

  backups() {
    return get("/backup", {
      ttl: 30_000,
    });
  },

  async runBackup(token) {
    const result = await post("/backup/run", undefined, { token });

    invalidatePrefix("/backup");

    return result;
  },
};

export { api };

export default api;

/*
 ADMIN TOKEN
 
 Jangan menggunakan "admin" sebagai fallback production.
 
Kalau token belum ada, hasilnya string kosong.
 */
export const ADMIN_TOKEN =
  typeof window !== "undefined"
    ? localStorage.getItem("fs_admin_token") || ""
    : "";
