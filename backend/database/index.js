import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { schema } from './schema.js';

const current = dirname(fileURLToPath(import.meta.url));
const dbPath = join(current, 'agenda-escolar.db');
mkdirSync(dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.exec(schema);
export default db;

