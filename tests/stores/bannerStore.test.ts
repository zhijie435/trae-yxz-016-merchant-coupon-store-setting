import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBannerStore } from '../../src/stores/banner';
import { bannerApi } from '../../src/api/banner';

vi.mock('../../src/api/banner', () => ({
  bannerApi: {
    getBannerList: vi.fn(),
    getBannerById: vi.fn(),
    getActiveBanners: vi.fn(),
    createBanner: vi.fn(),
    updateBanner: vi.fn(),
    deleteBanner: vi.fn(),
    updateSortOrders: vi.fn(),
    approveBanner: vi.fn(),
    rejectBanner: vi.fn()
  }
}));

describe('BannerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchBanners', () => {
    it('should fetch banner list successfully', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: [
            { id: 1, title: 'Banner 1', status: 'active' },
            { id: 2, title: 'Banner 2', status: 'pending' }
          ],
          pagination: { page: 1, pageSize: 10, total: 2 }
        }
      };

      vi.mocked(bannerApi.getBannerList).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      await store.fetchBanners();

      expect(store.banners).toHaveLength(2);
      expect(store.loading).toBe(false);
    });

    it('should handle API error', async () => {
      vi.mocked(bannerApi.getBannerList).mockRejectedValueOnce(new Error('Network error'));

      const store = useBannerStore();
      await store.fetchBanners();

      expect(store.banners).toHaveLength(0);
      expect(store.loading).toBe(false);
    });

    it('should fetch with custom params', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: [{ id: 1, title: 'Test', status: 'active' }],
          pagination: { page: 1, pageSize: 10, total: 1 }
        }
      };

      vi.mocked(bannerApi.getBannerList).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      await store.fetchBanners({ store_id: 1, status: 'active' });

      expect(bannerApi.getBannerList).toHaveBeenCalledWith({ store_id: 1, status: 'active' });
    });
  });

  describe('fetchActiveBanners', () => {
    it('should fetch active banners', async () => {
      const mockResponse = {
        code: 200,
        data: [
          { id: 1, title: 'Active Banner', status: 'active' }
        ]
      };

      vi.mocked(bannerApi.getActiveBanners).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      await store.fetchActiveBanners();

      expect(store.banners).toHaveLength(1);
    });
  });

  describe('fetchBannerById', () => {
    it('should fetch banner by ID', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1, title: 'Test Banner' }
      };

      vi.mocked(bannerApi.getBannerById).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.fetchBannerById(1);

      expect(result).toEqual({ id: 1, title: 'Test Banner' });
      expect(store.currentBanner).toEqual({ id: 1, title: 'Test Banner' });
    });

    it('should return null on error', async () => {
      vi.mocked(bannerApi.getBannerById).mockRejectedValueOnce(new Error('Error'));

      const store = useBannerStore();
      const result = await store.fetchBannerById(999);

      expect(result).toBeNull();
    });
  });

  describe('createBanner', () => {
    it('should create banner successfully', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1 }
      };

      vi.mocked(bannerApi.createBanner).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.createBanner({ title: 'New Banner' });

      expect(result).toBe(1);
      expect(store.loading).toBe(false);
    });

    it('should return null on error', async () => {
      vi.mocked(bannerApi.createBanner).mockRejectedValueOnce(new Error('Error'));

      const store = useBannerStore();
      const result = await store.createBanner({ title: 'New Banner' });

      expect(result).toBeNull();
    });
  });

  describe('updateBanner', () => {
    it('should update banner successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(bannerApi.updateBanner).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.updateBanner(1, { title: 'Updated Banner' });

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(bannerApi.updateBanner).mockRejectedValueOnce(new Error('Error'));

      const store = useBannerStore();
      const result = await store.updateBanner(1, { title: 'Updated Banner' });

      expect(result).toBe(false);
    });
  });

  describe('deleteBanner', () => {
    it('should delete banner successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(bannerApi.deleteBanner).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.deleteBanner(1);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(bannerApi.deleteBanner).mockRejectedValueOnce(new Error('Error'));

      const store = useBannerStore();
      const result = await store.deleteBanner(999);

      expect(result).toBe(false);
    });
  });

  describe('updateSortOrders', () => {
    it('should update sort orders successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(bannerApi.updateSortOrders).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.updateSortOrders([
        { id: 1, sort_order: 1 },
        { id: 2, sort_order: 2 }
      ]);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(bannerApi.updateSortOrders).mockRejectedValueOnce(new Error('Error'));

      const store = useBannerStore();
      const result = await store.updateSortOrders([{ id: 1, sort_order: 1 }]);

      expect(result).toBe(false);
    });
  });

  describe('approveBanner', () => {
    it('should approve banner successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(bannerApi.approveBanner).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.approveBanner(1, 'Approved');

      expect(result).toBe(true);
      expect(bannerApi.approveBanner).toHaveBeenCalledWith(1, { comment: 'Approved' });
    });

    it('should approve without comment', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(bannerApi.approveBanner).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.approveBanner(1);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(bannerApi.approveBanner).mockRejectedValueOnce(new Error('Error'));

      const store = useBannerStore();
      const result = await store.approveBanner(999);

      expect(result).toBe(false);
    });
  });

  describe('rejectBanner', () => {
    it('should reject banner successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(bannerApi.rejectBanner).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.rejectBanner(1, 'Invalid content');

      expect(result).toBe(true);
      expect(bannerApi.rejectBanner).toHaveBeenCalledWith(1, { comment: 'Invalid content' });
    });

    it('should reject without comment', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(bannerApi.rejectBanner).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.rejectBanner(1);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(bannerApi.rejectBanner).mockRejectedValueOnce(new Error('Error'));

      const store = useBannerStore();
      const result = await store.rejectBanner(999);

      expect(result).toBe(false);
    });
  });

  describe('Banner Up/Down Operations', () => {
    it('should shelf banner (update to active)', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(bannerApi.updateBanner).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.updateBanner(1, { status: 'active' });

      expect(result).toBe(true);
      expect(bannerApi.updateBanner).toHaveBeenCalledWith(1, { status: 'active' });
    });

    it('should unshelve banner (update to inactive)', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(bannerApi.updateBanner).mockResolvedValueOnce(mockResponse);

      const store = useBannerStore();
      const result = await store.updateBanner(1, { status: 'inactive' });

      expect(result).toBe(true);
      expect(bannerApi.updateBanner).toHaveBeenCalledWith(1, { status: 'inactive' });
    });
  });

  describe('State Management', () => {
    it('should manage loading state', async () => {
      const mockResponse = {
        code: 200,
        data: { list: [], pagination: { page: 1, pageSize: 10, total: 0 } }
      };

      vi.mocked(bannerApi.getBannerList).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      const store = useBannerStore();
      const fetchPromise = store.fetchBanners();

      expect(store.loading).toBe(true);

      await fetchPromise;

      expect(store.loading).toBe(false);
    });

    it('should initialize with default values', () => {
      const store = useBannerStore();

      expect(store.banners).toEqual([]);
      expect(store.currentBanner).toBeNull();
      expect(store.loading).toBe(false);
    });
  });
});
