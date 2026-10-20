/**
 * Generic CRUD service factory. Every Sheets-backed entity uses the same
 * create/read/update/delete behaviour, which keeps the API consistent and
 * avoids duplicated boilerplate across modules.
 */

import sheets from '../core/sheetsStore.js';
import { ID_FIELD } from '../config/index.js';

export function makeCrudService(entity) {
  return {
    async list(where) {
      return (await sheets.list(entity, where)) || [];
    },
    async get(id) {
      return sheets.get(entity, id);
    },
    async create(data) {
      return sheets.create(entity, data);
    },
    async update(id, data) {
      return sheets.update(entity, id, data);
    },
    async remove(id) {
      return sheets.remove(entity, id);
    },
    async bulkUpsert(rows, key = ID_FIELD) {
      return sheets.bulkUpsert(entity, rows, key);
    },
  };
}
