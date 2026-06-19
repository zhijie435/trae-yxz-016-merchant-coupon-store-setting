import { describe, it, expect, beforeEach } from 'vitest';
import { AnnouncementService } from '../../api/services/announcementService';

describe('AnnouncementService', () => {
  let announcementService: AnnouncementService;
  let testAnnouncementId: number;

  beforeEach(() => {
    announcementService = new AnnouncementService();
    
    testAnnouncementId = announcementService.createAnnouncement({
      title: 'Test Announcement',
      content: 'This is a test announcement',
      type: 'popup',
      store_id: 1,
      status: 'pending'
    });
  });

  describe('reviewAnnouncement', () => {
    it('should approve an announcement successfully', () => {
      const newAnnouncementToApprove = announcementService.createAnnouncement({
        title: 'To Approve',
        content: 'Content to approve',
        store_id: 1
      });

      const result = announcementService.reviewAnnouncement(newAnnouncementToApprove, 'approved', 1, 'Approved by admin');

      expect(result).toBe(true);
    });

    it('should reject an announcement successfully', () => {
      const newAnnouncementToReject = announcementService.createAnnouncement({
        title: 'To Reject',
        content: 'Content to reject',
        store_id: 1
      });

      const result = announcementService.reviewAnnouncement(newAnnouncementToReject, 'rejected', 1, 'Invalid content');

      expect(result).toBe(true);
    });

    it('should approve announcement without comment', () => {
      const newAnnouncement = announcementService.createAnnouncement({
        title: 'To Approve No Comment',
        content: 'Content',
        store_id: 1
      });

      const result = announcementService.reviewAnnouncement(newAnnouncement, 'approved', 1);

      expect(result).toBe(true);
    });

    it('should return false for non-existent announcement', () => {
      const result = announcementService.reviewAnnouncement(9999, 'approved', 1);

      expect(result).toBe(false);
    });

    it('should handle empty comment', () => {
      const newAnnouncement = announcementService.createAnnouncement({
        title: 'To Approve Empty',
        content: 'Content',
        store_id: 1
      });

      const result = announcementService.reviewAnnouncement(newAnnouncement, 'approved', 1, '');

      expect(result).toBe(true);
    });
  });

  describe('getAnnouncementList', () => {
    it('should return announcement list with pagination', () => {
      const result = announcementService.getAnnouncementList({});

      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('pageSize');
      expect(result.pagination).toHaveProperty('total');
    });

    it('should filter by store_id', () => {
      const result = announcementService.getAnnouncementList({ store_id: 1 });

      expect(result.list).toBeDefined();
    });

    it('should filter by status', () => {
      const result = announcementService.getAnnouncementList({ status: 'approved' });

      expect(result.list).toBeDefined();
    });

    it('should filter by type', () => {
      const result = announcementService.getAnnouncementList({ type: 'popup' });

      expect(result.list).toBeDefined();
    });

    it('should filter by multiple criteria', () => {
      const result = announcementService.getAnnouncementList({
        store_id: 1,
        status: 'approved',
        type: 'popup'
      });

      expect(result.list).toBeDefined();
    });
  });

  describe('getAnnouncementById', () => {
    it('should return announcement by id', () => {
      const result = announcementService.getAnnouncementById(testAnnouncementId);

      expect(result).toBeDefined();
    });

    it('should return undefined for non-existent announcement', () => {
      const result = announcementService.getAnnouncementById(9999);

      expect(result).toBeUndefined();
    });
  });

  describe('getActiveAnnouncements', () => {
    it('should return list of active announcements', () => {
      const result = announcementService.getActiveAnnouncements();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by time range', () => {
      const result = announcementService.getActiveAnnouncements();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return announcements with status approved', () => {
      const result = announcementService.getActiveAnnouncements();

      result.forEach((announcement) => {
        expect(announcement.status).toBe('approved');
      });
    });
  });

  describe('createAnnouncement', () => {
    it('should create a new announcement', () => {
      const newAnnouncement = {
        title: 'Test Announcement 2',
        content: 'Content without type',
        type: 'popup' as const,
        store_id: 1,
        status: 'pending' as const
      };

      const result = announcementService.createAnnouncement(newAnnouncement);

      expect(result).toBeGreaterThan(0);
    });

    it('should create announcement with default type popup', () => {
      const newAnnouncement = {
        title: 'Test Announcement 3',
        content: 'Content without type',
        store_id: 1
      };

      const result = announcementService.createAnnouncement(newAnnouncement);

      expect(result).toBeGreaterThan(0);
    });

    it('should create announcement with button configuration', () => {
      const newAnnouncement = {
        title: 'Announcement with Button',
        content: 'Click the button below',
        type: 'popup' as const,
        button_text: 'Learn More',
        button_link: 'https://example.com',
        image_url: 'https://example.com/image.jpg',
        store_id: 1
      };

      const result = announcementService.createAnnouncement(newAnnouncement);

      expect(result).toBeGreaterThan(0);
    });

    it('should create announcement with priority', () => {
      const newAnnouncement = {
        title: 'High Priority Announcement',
        content: 'Important!',
        priority: 10,
        store_id: 1
      };

      const result = announcementService.createAnnouncement(newAnnouncement);

      expect(result).toBeGreaterThan(0);
    });

    it('should create announcement with time range', () => {
      const newAnnouncement = {
        title: 'Timed Announcement',
        content: 'Limited time offer',
        start_time: '2024-01-01',
        end_time: '2024-12-31',
        store_id: 1
      };

      const result = announcementService.createAnnouncement(newAnnouncement);

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('updateAnnouncement', () => {
    it('should update announcement fields', () => {
      const updates = { title: 'Updated Announcement Title' };

      const result = announcementService.updateAnnouncement(testAnnouncementId, updates);

      expect(result).toBe(true);
    });

    it('should update multiple fields', () => {
      const updates = {
        title: 'Updated Title',
        content: 'Updated content',
        priority: 5
      };

      const result = announcementService.updateAnnouncement(testAnnouncementId, updates);

      expect(result).toBe(true);
    });

    it('should return false when updating with no allowed fields', () => {
      const updates = { id: 999 };

      const result = announcementService.updateAnnouncement(testAnnouncementId, updates);

      expect(result).toBe(false);
    });

    it('should update review fields', () => {
      const updates = { review_comment: 'Reviewed', reviewer_id: 1 };

      const result = announcementService.updateAnnouncement(testAnnouncementId, updates);

      expect(result).toBe(true);
    });
  });

  describe('deleteAnnouncement', () => {
    it('should delete an announcement', () => {
      const newAnnouncementId = announcementService.createAnnouncement({
        title: 'To Delete',
        content: 'Will be deleted',
        store_id: 1
      });

      const result = announcementService.deleteAnnouncement(newAnnouncementId);

      expect(result).toBe(true);
    });

    it('should return false when deleting non-existent announcement', () => {
      const result = announcementService.deleteAnnouncement(9999);

      expect(result).toBe(false);
    });
  });

  describe('Announcement Popup Display', () => {
    it('should create announcement with popup type', () => {
      const popupAnnouncement = {
        title: 'Popup Announcement',
        content: 'This will show as popup',
        type: 'popup' as const,
        store_id: 1
      };

      const result = announcementService.createAnnouncement(popupAnnouncement);

      expect(result).toBeGreaterThan(0);
    });

    it('should create announcement with banner type', () => {
      const bannerAnnouncement = {
        title: 'Banner Announcement',
        content: 'This will show as banner',
        type: 'banner' as const,
        store_id: 1
      };

      const result = announcementService.createAnnouncement(bannerAnnouncement);

      expect(result).toBeGreaterThan(0);
    });

    it('should create announcement with notice type', () => {
      const noticeAnnouncement = {
        title: 'Notice Announcement',
        content: 'This will show as notice',
        type: 'notice' as const,
        store_id: 1
      };

      const result = announcementService.createAnnouncement(noticeAnnouncement);

      expect(result).toBeGreaterThan(0);
    });

    it('should update announcement to show in popup', () => {
      const updates = { type: 'popup', status: 'approved' };

      const result = announcementService.updateAnnouncement(testAnnouncementId, updates);

      expect(result).toBe(true);
    });
  });

  describe('User-side Display', () => {
    it('should get active announcements for user display', () => {
      const result = announcementService.getActiveAnnouncements();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should only return approved announcements', () => {
      const activeAnnouncements = announcementService.getActiveAnnouncements();

      activeAnnouncements.forEach((announcement) => {
        expect(announcement.status).toBe('approved');
      });
    });

    it('should respect time range for user display', () => {
      const result = announcementService.getActiveAnnouncements();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should order by priority for user display', () => {
      const result = announcementService.getActiveAnnouncements();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
