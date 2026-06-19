import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'cash',
      value DECIMAL(10, 2) NOT NULL,
      min_amount DECIMAL(10, 2) DEFAULT 0,
      max_discount DECIMAL(10, 2) DEFAULT NULL,
      total_count INTEGER NOT NULL DEFAULT 0,
      remain_count INTEGER NOT NULL DEFAULT 0,
      per_user_limit INTEGER DEFAULT 1,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      description TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec('CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_coupons_end_time ON coupons(end_time)');

  console.log('Database initialized successfully');
}

export default db;
