import { useEffect, useState } from "react";
import api from "../lib/api.js";
import ENTITIES from "../lib/entities.js";

/**
 * Global lookup cache.
 *
 * Cache disimpan di module scope sehingga tetap hidup selama
 * aplikasi SPA masih berjalan, walaupun component di-unmount.
 *
 * Struktur:
 * cache:
 *   entityKey -> { byId: { id: label } }
 *
 * pending:
 *   entityKey -> Promise
 *
 * pending digunakan untuk mencegah request yang sama dikirim
 * berkali-kali ketika beberapa component mount bersamaan.
 */

const cache = new Map();
const pending = new Map();

function collectReferenced() {
  const refs = new Set();

  for (const cfg of Object.values(ENTITIES)) {
    for (const field of cfg.fields || []) {
      if (field.optionsFrom) {
        refs.add(field.optionsFrom);
      }
    }
  }

  return [...refs];
}

async function loadOne(entityKey) {
  // Sudah ada cache.
  if (cache.has(entityKey)) {
    return cache.get(entityKey);
  }

  // Request untuk entity yang sama sedang berjalan.
  if (pending.has(entityKey)) {
    return pending.get(entityKey);
  }

  const promise = api
    .get(`/${entityKey}`)
    .then((res) => {
      const rows = Array.isArray(res?.data) ? res.data : [];

      const byId = {};

      for (const row of rows) {
        const id = row.id;

        if (id === undefined || id === null || id === "") {
          continue;
        }

        const label =
          row.name ?? row.employeeId ?? row.code ?? row.title ?? row.id ?? "";

        byId[String(id)] = String(label);
      }

      const result = { byId };

      cache.set(entityKey, result);

      return result;
    })
    .catch(() => {
      const result = { byId: {} };

      cache.set(entityKey, result);

      return result;
    })
    .finally(() => {
      pending.delete(entityKey);
    });

  pending.set(entityKey, promise);

  return promise;
}

async function loadAll() {
  const refs = collectReferenced();

  await Promise.all(refs.map((entityKey) => loadOne(entityKey)));

  return cache;
}

export function useLookups() {
  const [ready, setReady] = useState(cache.size > 0);

  useEffect(() => {
    let active = true;

    // Kalau cache sudah ada, tidak perlu menunggu request.
    if (cache.size > 0) {
      setReady(true);
    }

    loadAll().finally(() => {
      if (active) {
        setReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const label = (entityKey, id) => {
    if (id === undefined || id === null || id === "") {
      return "-";
    }

    return cache.get(entityKey)?.byId?.[String(id)] ?? id;
  };

  const list = (entityKey) => {
    const byId = cache.get(entityKey)?.byId || {};

    return Object.entries(byId).map(([id, name]) => ({
      id,
      name,
    }));
  };

  return {
    ready,
    label,
    list,
  };
}

/**
 * Utility untuk kebutuhan setelah create/update/delete.
 *
 * Contoh:
 * invalidateLookup("employees")
 */
export function invalidateLookup(entityKey) {
  cache.delete(entityKey);
}

/**
 * Clear seluruh lookup cache.
 */
export function clearLookupCache() {
  cache.clear();
}

/**
 * Preload lookup dari luar component.
 */
export async function preloadLookups() {
  return loadAll();
}

export default useLookups;
