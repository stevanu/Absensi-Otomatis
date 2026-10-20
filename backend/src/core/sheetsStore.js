import { config } from "../config/index.js";

function ensureEnabled() {
  if (!config.gas.enabled) {
    const error = new Error(
      "Google Sheets belum dikonfigurasi. Isi GAS_URL dan GAS_TOKEN di .env.",
    );

    error.code = "GAS_DISABLED";

    throw error;
  }
}

async function call(action, payload = {}, options = {}) {
  ensureEnabled();

  const timeoutMs = Number(options.timeout || 15000);
  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(config.gas.url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: config.gas.token,
        action,
        ...payload,
      }),
      signal: controller.signal,
    });

    const text = await response.text();

    let json = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(
        `Response Google Sheets bukan JSON (HTTP ${response.status}).`,
      );
    }

    if (!response.ok) {
      const error = new Error(
        json?.error || `Google Sheets HTTP ${response.status}`,
      );

      error.code = "GAS_HTTP_ERROR";
      error.status = response.status;

      throw error;
    }

    if (json?.error) {
      const error = new Error(String(json.error));
      error.code = "GAS_ERROR";
      throw error;
    }

    return json && Object.prototype.hasOwnProperty.call(json, "data")
      ? json.data
      : json;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        `Timeout menghubungi Google Sheets (${timeoutMs}ms).`,
      );

      timeoutError.code = "GAS_TIMEOUT";

      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const sheets = {
  list: (entity, where) => call("list", { entity, where }),

  get: (entity, id) => call("get", { entity, id }),

  create: (entity, data) => call("create", { entity, data }),

  update: (entity, id, data) => call("update", { entity, id, data }),

  remove: (entity, id) => call("remove", { entity, id }),

  bulkUpsert: (entity, rows, key = "id") =>
    call(
      "bulkUpsert",
      { entity, rows, key },
      {
        timeout: 30000,
      },
    ),

  query: (entity, where) => call("query", { entity, where }),
};

export default sheets;
