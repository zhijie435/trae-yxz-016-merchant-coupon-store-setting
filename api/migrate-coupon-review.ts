import db from './database/index.js';

console.log('Running database migration for coupon review fields...');

try {
  db.exec('ALTER TABLE coupons ADD COLUMN review_comment VARCHAR(500) DEFAULT NULL');
  console.log('Added review_comment column');
} catch (error: any) {
  if (error.message.includes('duplicate column name')) {
    console.log('review_comment column already exists');
  } else {
    console.error('Error adding review_comment column:', error);
  }
}

try {
  db.exec('ALTER TABLE coupons ADD COLUMN review_time DATETIME DEFAULT NULL');
  console.log('Added review_time column');
} catch (error: any) {
  if (error.message.includes('duplicate column name')) {
    console.log('review_time column already exists');
  } else {
    console.error('Error adding review_time column:', error);
  }
}

try {
  db.exec('ALTER TABLE coupons ADD COLUMN reviewer_id INTEGER DEFAULT NULL');
  console.log('Added reviewer_id column');
} catch (error: any) {
  if (error.message.includes('duplicate column name')) {
    console.log('reviewer_id column already exists');
  } else {
    console.error('Error adding reviewer_id column:', error);
  }
}

const couponColumns = db.prepare('PRAGMA table_info(coupons)').all() as any[];
const hasRejectedStatus = couponColumns.some(col => col.name === 'review_comment');

if (hasRejectedStatus) {
  console.log('Migration completed successfully');
  console.log('Coupon review fields have been added');
}

export {};
