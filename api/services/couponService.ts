import db from '../database/index.js';

export interface Coupon {
  id?: number;
  name: string;
  type: 'cash' | 'discount';
  value: number;
  min_amount?: number;
  max_discount?: number;
  total_count: number;
  remain_count: number;
  per_user_limit?: number;
  start_time: string;
  end_time: string;
  status: 'draft' | 'pending' | 'active' | 'expired';
  description?: string;
  create_time?: string;
  update_time?: string;
}

export interface CouponListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

export interface CouponListResult {
  list: Coupon[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export class CouponService {
  getCouponList(params: CouponListParams): CouponListResult {
    const { page = 1, pageSize = 10, keyword = '', status = '' } = params;
    const offset = (page - 1) * pageSize;

    let whereClause = '1=1';
    const queryParams: any[] = [];

    if (keyword) {
      whereClause += ' AND name LIKE ?';
      queryParams.push(`%${keyword}%`);
    }

    if (status) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM coupons WHERE ${whereClause}`);
    const totalResult = countStmt.get(...queryParams) as { total: number };
    const total = totalResult.total;

    const dataStmt = db.prepare(
      `SELECT * FROM coupons WHERE ${whereClause} ORDER BY create_time DESC LIMIT ? OFFSET ?`
    );
    const list = dataStmt.all(...queryParams, pageSize, offset) as Coupon[];

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
      },
    };
  }

  getCouponById(id: number): Coupon | undefined {
    const stmt = db.prepare('SELECT * FROM coupons WHERE id = ?');
    return stmt.get(id) as Coupon | undefined;
  }

  createCoupon(coupon: Omit<Coupon, 'id' | 'create_time' | 'update_time'>): number {
    const stmt = db.prepare(`
      INSERT INTO coupons (
        name, type, value, min_amount, max_discount, total_count, remain_count,
        per_user_limit, start_time, end_time, status, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      coupon.name,
      coupon.type,
      coupon.value,
      coupon.min_amount || 0,
      coupon.max_discount || null,
      coupon.total_count,
      coupon.remain_count || coupon.total_count,
      coupon.per_user_limit || 1,
      coupon.start_time,
      coupon.end_time,
      coupon.status || 'draft',
      coupon.description || ''
    );

    return result.lastInsertRowid as number;
  }

  updateCoupon(id: number, updates: Partial<Coupon>): boolean {
    const allowedFields = [
      'name', 'type', 'value', 'min_amount', 'max_discount', 'total_count',
      'remain_count', 'per_user_limit', 'start_time', 'end_time', 'status', 'description'
    ];

    const updateFields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && key !== 'id') {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return false;
    }

    updateFields.push('update_time = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE coupons SET ${updateFields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  deleteCoupon(id: number): boolean {
    const stmt = db.prepare('DELETE FROM coupons WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteCoupons(ids: number[]): number {
    if (ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`DELETE FROM coupons WHERE id IN (${placeholders})`);
    const result = stmt.run(...ids);
    return result.changes;
  }
}

export default new CouponService();
