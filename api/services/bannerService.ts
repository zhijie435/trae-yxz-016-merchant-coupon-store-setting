import db from '../database/index.js';

export interface Banner {
  id?: number;
  store_id?: number;
  title: string;
  image_url: string;
  link_url?: string;
  link_type?: 'none' | 'url' | 'page' | 'product';
  sort_order?: number;
  status?: 'active' | 'inactive';
  start_time?: string;
  end_time?: string;
  create_time?: string;
  update_time?: string;
}

export interface BannerListParams {
  store_id?: number;
  status?: string;
}

export interface BannerListResult {
  list: Banner[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export class BannerService {
  getBannerList(params: BannerListParams): BannerListResult {
    const { store_id = 1, status = '' } = params;

    let whereClause = 'store_id = ?';
    const queryParams: any[] = [store_id];

    if (status) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM banners WHERE ${whereClause}`);
    const totalResult = countStmt.get(...queryParams) as { total: number };
    const total = totalResult.total;

    const dataStmt = db.prepare(
      `SELECT * FROM banners WHERE ${whereClause} ORDER BY sort_order ASC, create_time DESC`
    );
    const list = dataStmt.all(...queryParams) as Banner[];

    return {
      list,
      pagination: {
        page: 1,
        pageSize: total,
        total,
      },
    };
  }

  getBannerById(id: number): Banner | undefined {
    const stmt = db.prepare('SELECT * FROM banners WHERE id = ?');
    return stmt.get(id) as Banner | undefined;
  }

  createBanner(banner: Omit<Banner, 'id' | 'create_time' | 'update_time'>): number {
    const stmt = db.prepare(`
      INSERT INTO banners (
        store_id, title, image_url, link_url, link_type, sort_order, status, start_time, end_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      banner.store_id || 1,
      banner.title,
      banner.image_url,
      banner.link_url || null,
      banner.link_type || 'none',
      banner.sort_order || 0,
      banner.status || 'active',
      banner.start_time || null,
      banner.end_time || null
    );

    return result.lastInsertRowid as number;
  }

  updateBanner(id: number, updates: Partial<Banner>): boolean {
    const allowedFields = [
      'title', 'image_url', 'link_url', 'link_type', 'sort_order', 'status', 'start_time', 'end_time'
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

    const stmt = db.prepare(`UPDATE banners SET ${updateFields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  deleteBanner(id: number): boolean {
    const stmt = db.prepare('DELETE FROM banners WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteBanners(ids: number[]): number {
    if (ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`DELETE FROM banners WHERE id IN (${placeholders})`);
    const result = stmt.run(...ids);
    return result.changes;
  }

  updateSortOrders(updates: { id: number; sort_order: number }[]): boolean {
    const stmt = db.prepare('UPDATE banners SET sort_order = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?');

    const transaction = db.transaction(() => {
      for (const update of updates) {
        stmt.run(update.sort_order, update.id);
      }
    });

    try {
      transaction();
      return true;
    } catch (error) {
      console.error('Error updating sort orders:', error);
      return false;
    }
  }
}

export default new BannerService();
