import dotenv from 'dotenv';
dotenv.config();

/**
 * Centralised configuration. Reads from process.env with safe defaults.
 * No dummy data is ever seeded here — values are only used to connect to
 * real stores (Google Sheets, MySQL) and real devices on the LAN.
 */

export const config = {
  port: Number(process.env.PORT || 4000),

  // Primary datastore: Google Sheets via Apps Script proxy.
  gas: {
    url: process.env.GAS_URL || '',
    token: process.env.GAS_TOKEN || '',
    get enabled() {
      return Boolean(this.url && this.token);
    },
  },

  // Backup datastore: MySQL.
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fingerspot_backup',
  },

  device: {
    simulate: String(process.env.DEVICE_SIMULATE || 'false') === 'true',
    discoveryPorts: (process.env.DEVICE_DISCOVERY_PORTS || '5005,4370,80,8080')
      .split(',')
      .map((p) => Number(p.trim()))
      .filter(Boolean),
    discoveryTimeout: Number(process.env.DEVICE_DISCOVERY_TIMEOUT || 600),
  },

  ai: {
    enabled: String(process.env.AI_ENABLED || 'true') === 'true',
    baseUrl: process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'openai/gpt-oss-20b',
    contextRows: Number(process.env.AI_CONTEXT_ROWS || 200),
  },
};

/**
 * Entities backed by the Sheets datastore. The generic CRUD router mounts
 * REST endpoints for each of these. `idField` is the unique key.
 */
export const ENTITIES = [
  'companies',
  'departments',
  'offices',
  'positions',
  'employees',
  'shifts',
  'schedules',
  'rules',
  'leaves',
  'leave_requests',
  'overtime_categories',
  'overtime_requests',
  'holidays',
  'devices',
  'users',
  'attendance_log',
];

export const ID_FIELD = 'id';
