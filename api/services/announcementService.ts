import db from '../database/index.js';

export interface Announcement {
  id?: number;
  store_id?: number;
  title: string;
  content: string;
  type?: 'popup' | 'banner' | 'notice';
  status?: 'pending' | 'approved' | 'rejected';
  priority?: number;
  start_time?: string;
  end_time?: string;
  review_comment?: string;
  review_time?: string;
  reviewer_id?: number;
  create_time?: string;
  update_time?: string;
}

export interface AnnouncementListParams {
  store_id?: number;
  status?: string;
  type?: string;
}

export interface AnnouncementListResult {
  list: Announcement[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export class AnnouncementService {
  getAnnouncementList(params: AnnouncementListParams): AnnouncementListResult {
    const { store_id = 1, status = '', type = '' } = params;

    let whereClause = 'store_id = ?';
    const queryParams: any[] = [store_id];

    if (status) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    if (type) {
      whereClause += ' AND type = ?';
      queryParams.push(type);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM announcements WHERE ${whereClause}`);
    const totalResult = countStmt.get(...queryParams) as { total: number };
    const total = totalResult.total;

    const dataStmt = db.prepare(
      `SELECT * FROM announcements WHERE ${whereClause} ORDER BY create_time DESC`
    );
    const list = dataStmt.all(...queryParams) as Announcement[];

    return {
      list,
      pagination: {
        page: 1,
        pageSize: total,
        total,
      },
    };
  }

  getAnnouncementById(id: number): Announcement | undefined {
    const stmt = db.prepare('SELECT * FROM announcements WHERE id = ?');
    return stmt.get(id) as Announcement | undefined;
  }

  getActiveAnnouncements(): Announcement[] {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      SELECT * FROM announcements
      WHERE status = 'approved'
        AND (start_time IS NULL OR start_time <= ?)
        AND (end_time IS NULL OR end_time >= ?)
      ORDER BY priority DESC, create_time DESC
    `);
    return stmt.all(now, now) as Announcement[];
  }

  createAnnouncement(announcement: Omit<Announcement, 'id' | 'create_time' | 'update_time'>): number {
    const stmt = db.prepare(`
      INSERT INTO announcements (
        store_id, title, content, type, status, priority, start_time, end_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      announcement.store_id || 1,
      announcement.title,
      announcement.content,
      announcement.type || 'popup',
      announcement.status || 'pending',
      announcement.priority || 0,
      announcement.start_time || null,
      announcement.end_time || null
    );

    return result.lastInsertRowid as number;
  }

  updateAnnouncement(id: number, updates: Partial<Announcement>): boolean {
    const allowedFields = [
      'title', 'content', 'type', 'status', 'priority', 'start_time', 'end_time',
      'review_comment', 'review_time', 'reviewer_id'
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

    const stmt = db.prepare(`UPDATE announcements SET ${updateFields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  reviewAnnouncement(id: number, status: 'approved' | 'rejected', reviewer_id: number, comment?: string): boolean {
    const stmt = db.prepare(`
      UPDATE announcements
      SET status = ?, reviewer_id = ?, review_comment = ?, review_time = CURRENT_TIMESTAMP, update_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(status, reviewer_id, comment || null, id);
    return result.changes > 0;
  }

  deleteAnnouncement(id: number): boolean {
    const stmt = db.prepare('DELETE FROM announcements WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export default new AnnouncementService();
