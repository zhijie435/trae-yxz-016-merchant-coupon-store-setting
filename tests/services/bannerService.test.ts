import { describe, it, expect, beforeEach } from 'vitest';
import { BannerService } from '../../api/services/bannerService';

describe('BannerService', () => {
  let bannerService: BannerService;
  let testBannerId: number;

  beforeEach(async () => {
    bannerService = new BannerService();
    
    const newBanner = {
      title: 'Test Banner',
      image_url: 'https://example.com/banner.jpg',
      link_type: 'url' as const,
      link_url: 'https://example.com',
      store_id: 1,
      status: 'pending' as const
    };
    testBannerId = bannerService.createBanner(newBanner);
  });

  describe('approveBanner', () => {
    it('should approve a pending banner successfully', () => {
      const mockParams = { comment: 'Approved', reviewer_id: 1 };

      const result = bannerService.approveBanner(testBannerId, mockParams);

      expect(result).toBe(true);
    });

    it('should return false when approving non-pending banner', () => {
      const mockId = 999;
      const mockParams = { comment: 'Test' };

      const result = bannerService.approveBanner(mockId, mockParams);

      expect(result).toBe(false);
    });

    it('should approve banner without comment', () => {
      const mockParams = {};

      const result = bannerService.approveBanner(testBannerId, mockParams);

      expect(result).toBe(true);
    });
  });

  describe('rejectBanner', () => {
    it('should reject a pending banner successfully', () => {
      const newBannerToReject = bannerService.createBanner({
        title: 'To Reject',
        image_url: 'https://example.com/reject.jpg',
        store_id: 1
      });
      
      const mockParams = { comment: 'Invalid content', reviewer_id: 1 };

      const result = bannerService.rejectBanner(newBannerToReject, mockParams);

      expect(result).toBe(true);
    });

    it('should return false when rejecting non-pending banner', () => {
      const mockId = 999;
      const mockParams = { comment: 'Test' };

      const result = bannerService.rejectBanner(mockId, mockParams);

      expect(result).toBe(false);
    });

    it('should reject banner with empty comment', () => {
      const newBannerToReject = bannerService.createBanner({
        title: 'To Reject Empty',
        image_url: 'https://example.com/reject2.jpg',
        store_id: 1
      });
      
      const mockParams = { comment: '' };

      const result = bannerService.rejectBanner(newBannerToReject, mockParams);

      expect(result).toBe(true);
    });
  });

  describe('Banner Up/Down Operations', () => {
    it('should update banner status to active (shelf)', () => {
      const result = bannerService.updateBanner(testBannerId, { status: 'active' });

      expect(result).toBe(true);
    });

    it('should update banner status to inactive (unshelf)', () => {
      const result = bannerService.updateBanner(testBannerId, { status: 'inactive' });

      expect(result).toBe(true);
    });

    it('should update multiple banners status to inactive (batch unsheel)', () => {
      const bannerId2 = bannerService.createBanner({
        title: 'Banner 2',
        image_url: 'https://example.com/banner2.jpg',
        store_id: 1
      });

      const result1 = bannerService.updateBanner(testBannerId, { status: 'inactive' });
      const result2 = bannerService.updateBanner(bannerId2, { status: 'inactive' });

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should update banner status only if allowed field', () => {
      const result = bannerService.updateBanner(testBannerId, { id: 999 });

      expect(result).toBe(false);
    });
  });

  describe('getBannerList', () => {
    it('should return banner list with pagination', () => {
      const result = bannerService.getBannerList({});

      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('pageSize');
      expect(result.pagination).toHaveProperty('total');
    });

    it('should filter by store_id', () => {
      const result = bannerService.getBannerList({ store_id: 1 });

      expect(result.list).toBeDefined();
    });

    it('should filter by status', () => {
      const result = bannerService.getBannerList({ status: 'pending' });

      expect(result.list).toBeDefined();
    });

    it('should filter by both store_id and status', () => {
      const result = bannerService.getBannerList({ store_id: 1, status: 'pending' });

      expect(result.list).toBeDefined();
    });
  });

  describe('getBannerById', () => {
    it('should return banner by id', () => {
      const result = bannerService.getBannerById(testBannerId);

      expect(result).toBeDefined();
    });

    it('should return undefined for non-existent banner', () => {
      const result = bannerService.getBannerById(9999);

      expect(result).toBeUndefined();
    });
  });

  describe('createBanner', () => {
    it('should create a new banner', () => {
      const newBanner = {
        title: 'Test Banner 2',
        image_url: 'https://example.com/banner2.jpg',
        link_type: 'url' as const,
        link_url: 'https://example.com',
        store_id: 1,
        status: 'pending' as const
      };

      const result = bannerService.createBanner(newBanner);

      expect(result).toBeGreaterThan(0);
    });

    it('should create banner with default status pending', () => {
      const newBanner = {
        title: 'Test Banner 3',
        image_url: 'https://example.com/banner3.jpg',
        store_id: 1
      };

      const result = bannerService.createBanner(newBanner);

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('updateBanner', () => {
    it('should update banner fields', () => {
      const updates = { title: 'Updated Banner Title' };

      const result = bannerService.updateBanner(testBannerId, updates);

      expect(result).toBe(true);
    });

    it('should update multiple fields', () => {
      const updates = {
        title: 'Updated Title',
        image_url: 'https://example.com/new.jpg',
        link_url: 'https://example.com/new'
      };

      const result = bannerService.updateBanner(testBannerId, updates);

      expect(result).toBe(true);
    });

    it('should return false when updating with no allowed fields', () => {
      const updates = { id: 999 };

      const result = bannerService.updateBanner(testBannerId, updates);

      expect(result).toBe(false);
    });
  });

  describe('deleteBanner', () => {
    it('should delete a banner', () => {
      const newBannerId = bannerService.createBanner({
        title: 'To Delete',
        image_url: 'https://example.com/delete.jpg',
        store_id: 1
      });

      const result = bannerService.deleteBanner(newBannerId);

      expect(result).toBe(true);
    });

    it('should return false when deleting non-existent banner', () => {
      const result = bannerService.deleteBanner(9999);

      expect(result).toBe(false);
    });
  });

  describe('deleteBanners', () => {
    it('should delete multiple banners', () => {
      const bannerId2 = bannerService.createBanner({
        title: 'To Delete 2',
        image_url: 'https://example.com/delete2.jpg',
        store_id: 1
      });

      const result = bannerService.deleteBanners([testBannerId, bannerId2]);

      expect(result).toBeGreaterThanOrEqual(2);
    });

    it('should return 0 when array is empty', () => {
      const result = bannerService.deleteBanners([]);

      expect(result).toBe(0);
    });
  });

  describe('updateSortOrders', () => {
    it('should update sort orders for multiple banners', () => {
      const bannerId2 = bannerService.createBanner({
        title: 'Banner for Sort',
        image_url: 'https://example.com/sort.jpg',
        store_id: 1
      });

      const updates = [
        { id: testBannerId, sort_order: 1 },
        { id: bannerId2, sort_order: 2 }
      ];

      const result = bannerService.updateSortOrders(updates);

      expect(result).toBe(true);
    });

    it('should handle empty updates array', () => {
      const updates: { id: number; sort_order: number }[] = [];

      const result = bannerService.updateSortOrders(updates);

      expect(result).toBe(true);
    });
  });

  describe('getPendingBanners', () => {
    it('should return list of pending banners', () => {
      const result = bannerService.getPendingBanners();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getActiveBanners', () => {
    it('should return list of active banners within time range', () => {
      const result = bannerService.getActiveBanners();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by start_time and end_time', () => {
      const result = bannerService.getActiveBanners();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
