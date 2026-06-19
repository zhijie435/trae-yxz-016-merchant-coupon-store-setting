import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnnouncementStore } from '../../src/stores/announcement';
import { announcementApi } from '../../src/api/announcement';

vi.mock('../../src/api/announcement', () => ({
  announcementApi: {
    getAnnouncementList: vi.fn(),
    getAnnouncementById: vi.fn(),
    createAnnouncement: vi.fn(),
    updateAnnouncement: vi.fn(),
    reviewAnnouncement: vi.fn(),
    deleteAnnouncement: vi.fn()
  }
}));

describe('AnnouncementStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchAnnouncements', () => {
    it('should fetch announcement list successfully', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: [
            { id: 1, title: 'Announcement 1', status: 'approved' },
            { id: 2, title: 'Announcement 2', status: 'pending' }
          ],
          pagination: { page: 1, pageSize: 10, total: 2 }
        }
      };

      vi.mocked(announcementApi.getAnnouncementList).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      await store.fetchAnnouncements();

      expect(store.announcements).toHaveLength(2);
      expect(store.loading).toBe(false);
    });

    it('should handle API error', async () => {
      vi.mocked(announcementApi.getAnnouncementList).mockRejectedValueOnce(new Error('Network error'));

      const store = useAnnouncementStore();
      await store.fetchAnnouncements();

      expect(store.announcements).toHaveLength(0);
      expect(store.loading).toBe(false);
    });

    it('should fetch with custom params', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: [{ id: 1, title: 'Test', status: 'approved' }],
          pagination: { page: 1, pageSize: 10, total: 1 }
        }
      };

      vi.mocked(announcementApi.getAnnouncementList).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      await store.fetchAnnouncements({ store_id: 1, status: 'approved', type: 'popup' });

      expect(announcementApi.getAnnouncementList).toHaveBeenCalledWith({
        store_id: 1,
        status: 'approved',
        type: 'popup'
      });
    });
  });

  describe('fetchAnnouncementById', () => {
    it('should fetch announcement by ID', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1, title: 'Test Announcement' }
      };

      vi.mocked(announcementApi.getAnnouncementById).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.fetchAnnouncementById(1);

      expect(result).toEqual({ id: 1, title: 'Test Announcement' });
      expect(store.currentAnnouncement).toEqual({ id: 1, title: 'Test Announcement' });
    });

    it('should return null on error', async () => {
      vi.mocked(announcementApi.getAnnouncementById).mockRejectedValueOnce(new Error('Error'));

      const store = useAnnouncementStore();
      const result = await store.fetchAnnouncementById(999);

      expect(result).toBeNull();
    });
  });

  describe('createAnnouncement', () => {
    it('should create announcement successfully', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1 }
      };

      vi.mocked(announcementApi.createAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.createAnnouncement({ title: 'New Announcement' });

      expect(result).toBe(1);
      expect(store.loading).toBe(false);
    });

    it('should return null on error', async () => {
      vi.mocked(announcementApi.createAnnouncement).mockRejectedValueOnce(new Error('Error'));

      const store = useAnnouncementStore();
      const result = await store.createAnnouncement({ title: 'New Announcement' });

      expect(result).toBeNull();
    });

    it('should create popup announcement', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1 }
      };

      vi.mocked(announcementApi.createAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.createAnnouncement({
        title: 'Popup Announcement',
        type: 'popup'
      });

      expect(result).toBe(1);
    });

    it('should create announcement with button', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1 }
      };

      vi.mocked(announcementApi.createAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.createAnnouncement({
        title: 'Announcement with Button',
        button_text: 'Learn More',
        button_link: 'https://example.com'
      });

      expect(result).toBe(1);
    });
  });

  describe('updateAnnouncement', () => {
    it('should update announcement successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(announcementApi.updateAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.updateAnnouncement(1, { title: 'Updated Announcement' });

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(announcementApi.updateAnnouncement).mockRejectedValueOnce(new Error('Error'));

      const store = useAnnouncementStore();
      const result = await store.updateAnnouncement(1, { title: 'Updated Announcement' });

      expect(result).toBe(false);
    });
  });

  describe('reviewAnnouncement', () => {
    it('should approve announcement successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(announcementApi.reviewAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.reviewAnnouncement(1, 'approved', 'Approved by admin');

      expect(result).toBe(true);
      expect(announcementApi.reviewAnnouncement).toHaveBeenCalledWith(1, {
        status: 'approved',
        comment: 'Approved by admin'
      });
    });

    it('should reject announcement successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(announcementApi.reviewAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.reviewAnnouncement(1, 'rejected', 'Invalid content');

      expect(result).toBe(true);
      expect(announcementApi.reviewAnnouncement).toHaveBeenCalledWith(1, {
        status: 'rejected',
        comment: 'Invalid content'
      });
    });

    it('should review without comment', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(announcementApi.reviewAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.reviewAnnouncement(1, 'approved');

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(announcementApi.reviewAnnouncement).mockRejectedValueOnce(new Error('Error'));

      const store = useAnnouncementStore();
      const result = await store.reviewAnnouncement(999, 'approved');

      expect(result).toBe(false);
    });
  });

  describe('deleteAnnouncement', () => {
    it('should delete announcement successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(announcementApi.deleteAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.deleteAnnouncement(1);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(announcementApi.deleteAnnouncement).mockRejectedValueOnce(new Error('Error'));

      const store = useAnnouncementStore();
      const result = await store.deleteAnnouncement(999);

      expect(result).toBe(false);
    });
  });

  describe('Announcement Popup Display', () => {
    it('should create popup type announcement', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1 }
      };

      vi.mocked(announcementApi.createAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.createAnnouncement({
        title: 'Popup',
        content: 'Popup content',
        type: 'popup'
      });

      expect(result).toBe(1);
    });

    it('should create banner type announcement', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1 }
      };

      vi.mocked(announcementApi.createAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.createAnnouncement({
        title: 'Banner',
        content: 'Banner content',
        type: 'banner'
      });

      expect(result).toBe(1);
    });

    it('should update announcement for popup display', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(announcementApi.updateAnnouncement).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      const result = await store.updateAnnouncement(1, {
        type: 'popup',
        status: 'approved'
      });

      expect(result).toBe(true);
    });
  });

  describe('User-side Display', () => {
    it('should fetch approved announcements for user display', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: [
            { id: 1, title: 'Approved', status: 'approved' },
            { id: 2, title: 'Pending', status: 'pending' }
          ],
          pagination: { page: 1, pageSize: 10, total: 2 }
        }
      };

      vi.mocked(announcementApi.getAnnouncementList).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      await store.fetchAnnouncements({ status: 'approved' });

      expect(store.announcements).toHaveLength(2);
      expect(store.announcements[0].status).toBe('approved');
    });

    it('should filter popup type for user display', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: [
            { id: 1, title: 'Popup', type: 'popup', status: 'approved' },
            { id: 2, title: 'Banner', type: 'banner', status: 'approved' }
          ],
          pagination: { page: 1, pageSize: 10, total: 2 }
        }
      };

      vi.mocked(announcementApi.getAnnouncementList).mockResolvedValueOnce(mockResponse);

      const store = useAnnouncementStore();
      await store.fetchAnnouncements({ type: 'popup' });

      expect(store.announcements).toHaveLength(2);
      expect(store.announcements[0].type).toBe('popup');
    });
  });

  describe('State Management', () => {
    it('should manage loading state', async () => {
      const mockResponse = {
        code: 200,
        data: { list: [], pagination: { page: 1, pageSize: 10, total: 0 } }
      };

      vi.mocked(announcementApi.getAnnouncementList).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      const store = useAnnouncementStore();
      const fetchPromise = store.fetchAnnouncements();

      expect(store.loading).toBe(true);

      await fetchPromise;

      expect(store.loading).toBe(false);
    });

    it('should initialize with default values', () => {
      const store = useAnnouncementStore();

      expect(store.announcements).toEqual([]);
      expect(store.currentAnnouncement).toBeNull();
      expect(store.loading).toBe(false);
    });
  });
});
