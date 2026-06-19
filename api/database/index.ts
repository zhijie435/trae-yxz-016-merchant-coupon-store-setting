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
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      description TEXT,
      review_comment VARCHAR(500) DEFAULT NULL,
      review_time DATETIME DEFAULT NULL,
      reviewer_id INTEGER DEFAULT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec('CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_coupons_end_time ON coupons(end_time)');

  const couponColumns = db.prepare('PRAGMA table_info(coupons)').all() as any[];
  if (!couponColumns.some(col => col.name === 'review_comment')) {
    try {
      db.exec('ALTER TABLE coupons ADD COLUMN review_comment VARCHAR(500) DEFAULT NULL');
      console.log('Added review_comment column to coupons table');
    } catch (error) {
      console.error('Error adding review_comment column:', error);
    }
  }

  if (!couponColumns.some(col => col.name === 'review_time')) {
    try {
      db.exec('ALTER TABLE coupons ADD COLUMN review_time DATETIME DEFAULT NULL');
      console.log('Added review_time column to coupons table');
    } catch (error) {
      console.error('Error adding review_time column:', error);
    }
  }

  if (!couponColumns.some(col => col.name === 'reviewer_id')) {
    try {
      db.exec('ALTER TABLE coupons ADD COLUMN reviewer_id INTEGER DEFAULT NULL');
      console.log('Added reviewer_id column to coupons table');
    } catch (error) {
      console.error('Error adding reviewer_id column:', error);
    }
  }

  const couponStatusDefault = db.prepare("PRAGMA table_info(coupons)").all() as any[];
  const statusColumn = couponStatusDefault.find(col => col.name === 'status');
  if (statusColumn && statusColumn.dflt_value === "'draft'") {
    try {
      db.exec('ALTER TABLE coupons ALTER COLUMN status VARCHAR(20) NOT NULL DEFAULT "pending"');
      console.log('Updated status default value to pending');
    } catch (error) {
      console.error('Error updating status default value:', error);
    }
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER DEFAULT 1,
      title VARCHAR(100) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      link_url VARCHAR(500) DEFAULT NULL,
      link_type VARCHAR(20) DEFAULT 'none',
      sort_order INTEGER DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      start_time DATETIME DEFAULT NULL,
      end_time DATETIME DEFAULT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec('CREATE INDEX IF NOT EXISTS idx_banners_store_id ON banners(store_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status)');

  db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER DEFAULT 1,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'popup',
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      priority INTEGER DEFAULT 0,
      start_time DATETIME DEFAULT NULL,
      end_time DATETIME DEFAULT NULL,
      review_comment VARCHAR(500) DEFAULT NULL,
      review_time DATETIME DEFAULT NULL,
      reviewer_id INTEGER DEFAULT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec('CREATE INDEX IF NOT EXISTS idx_announcements_store_id ON announcements(store_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_announcements_start_time ON announcements(start_time)');

  console.log('Database initialized successfully');
}

export default db;
