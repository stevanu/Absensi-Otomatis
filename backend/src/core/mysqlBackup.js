/**
 * MySQL backup store.
 *
 * Sheets is the source of truth; MySQL is a mirror used for backup / analytics.
 * Tables are created on the fly from the row shapes (CREATE TABLE IF NOT EXISTS),
 * then rows are upserted by their `id` every 12h by the sync job.
 */

import mysql from 'mysql2/promise';
import { config } from '../config/index.js';

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4',
    });
  }
  return pool;
}

export async function ensureDatabase() {
  const admin = mysql.createPool({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    charset: 'utf8mb4',
  });
  await admin.query(`CREATE DATABASE IF NOT EXISTS \`${config.mysql.database}\` CHARACTER SET utf8mb4`);
  await admin.end();
}

function sqlType(value) {
  if (value === null || value === undefined) return 'TEXT';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'BIGINT' : 'DOUBLE';
  }
  if (typeof value === 'boolean') return 'TINYINT(1)';
  return 'TEXT';
}

function escapeId(name) {
  return '`' + String(name).replace(/[^a-zA-Z0-9_]/g, '_') + '`';
}

/**
 * Create a table for `entity` based on the union of keys across `rows`,
 * guaranteeing an `id` primary key.
 */
export async function ensureTable(entity, rows) {
  const conn = getPool();
  const tableName = escapeId(entity);
  const cols = new Set(['id']);
  for (const row of rows) {
    for (const k of Object.keys(row || {})) cols.add(k);
  }
  const colDefs = [...cols].map((c) => `${escapeId(c)} ${sqlType(rows[0]?.[c])}`).join(', ');
  await conn.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (${colDefs}, PRIMARY KEY (${escapeId('id')})) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
  return tableName;
}

/**
 * Upsert rows into the entity table. De-duplicates by `id`.
 * @returns {{inserted:number, updated:number}}
 */
export async function upsertRows(entity, rows) {
  if (!rows || rows.length === 0) return { inserted: 0, updated: 0 };
  const conn = getPool();
  const tableName = await ensureTable(entity, rows);
  let inserted = 0;
  let updated = 0;
  for (const row of rows) {
    const safe = { ...row };
    const keys = Object.keys(safe);
    const cols = keys.map(escapeId).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const updates = keys.filter((k) => k !== 'id').map((k) => `${escapeId(k)}=VALUES(${escapeId(k)})`).join(', ');
    const sql =
      updates.length > 0
        ? `INSERT INTO ${tableName} (${cols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`
        : `INSERT IGNORE INTO ${tableName} (${cols}) VALUES (${placeholders})`;
    const values = keys.map((k) => (safe[k] === '' ? null : safe[k]));
    const [res] = await conn.query(sql, values);
    if (res && res.affectedRows === 1) inserted++;
    else if (res && res.affectedRows === 2) updated++;
  }
  return { inserted, updated };
}

export async function countRows(entity) {
  const conn = getPool();
  const [rows] = await conn.query(`SELECT COUNT(*) AS n FROM ${escapeId(entity)}`);
  return rows[0]?.n || 0;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
