import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCouponStore } from '../../src/stores/coupon';
import { couponApi } from '../../src/api/coupon';

vi.mock('../../src/api/coupon', () => ({
  couponApi: {
    getCouponList: vi.fn(),
    getCouponById: vi.fn(),
    getActiveCoupons: vi.fn(),
    createCoupon: vi.fn(),
    updateCoupon: vi.fn(),
    deleteCoupon: vi.fn(),
    deleteCoupons: vi.fn(),
    approveCoupon: vi.fn(),
    rejectCoupon: vi.fn()
  }
}));

describe('CouponStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchCoupons', () => {
    it('should fetch coupon list successfully', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: [
            { id: 1, name: 'Coupon 1', status: 'active' },
            { id: 2, name: 'Coupon 2', status: 'pending' }
          ],
          pagination: { page: 1, pageSize: 10, total: 2 }
        }
      };

      vi.mocked(couponApi.getCouponList).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      await store.fetchCoupons();

      expect(store.coupons).toHaveLength(2);
      expect(store.pagination.total).toBe(2);
      expect(store.loading).toBe(false);
    });

    it('should handle API error', async () => {
      vi.mocked(couponApi.getCouponList).mockRejectedValueOnce(new Error('Network error'));

      const store = useCouponStore();
      await store.fetchCoupons();

      expect(store.coupons).toHaveLength(0);
      expect(store.loading).toBe(false);
    });

    it('should fetch with custom params', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: [{ id: 1, name: 'Test', status: 'pending' }],
          pagination: { page: 1, pageSize: 5, total: 1 }
        }
      };

      vi.mocked(couponApi.getCouponList).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      await store.fetchCoupons({ page: 1, pageSize: 5, status: 'pending' });

      expect(couponApi.getCouponList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 5,
        status: 'pending'
      });
    });
  });

  describe('fetchActiveCoupons', () => {
    it('should fetch active coupons', async () => {
      const mockResponse = {
        code: 200,
        data: [
          { id: 1, name: 'Active Coupon', status: 'active' }
        ]
      };

      vi.mocked(couponApi.getActiveCoupons).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      await store.fetchActiveCoupons();

      expect(store.coupons).toHaveLength(1);
      expect(store.pagination.total).toBe(1);
    });
  });

  describe('fetchCouponById', () => {
    it('should fetch coupon by ID', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1, name: 'Test Coupon' }
      };

      vi.mocked(couponApi.getCouponById).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      const result = await store.fetchCouponById(1);

      expect(result).toEqual({ id: 1, name: 'Test Coupon' });
      expect(store.currentCoupon).toEqual({ id: 1, name: 'Test Coupon' });
    });

    it('should return null on error', async () => {
      vi.mocked(couponApi.getCouponById).mockRejectedValueOnce(new Error('Error'));

      const store = useCouponStore();
      const result = await store.fetchCouponById(999);

      expect(result).toBeNull();
    });
  });

  describe('createCoupon', () => {
    it('should create coupon successfully', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1 }
      };

      vi.mocked(couponApi.createCoupon).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      const result = await store.createCoupon({ name: 'New Coupon' });

      expect(result).toBe(1);
      expect(store.loading).toBe(false);
    });

    it('should return null on error', async () => {
      vi.mocked(couponApi.createCoupon).mockRejectedValueOnce(new Error('Error'));

      const store = useCouponStore();
      const result = await store.createCoupon({ name: 'New Coupon' });

      expect(result).toBeNull();
    });
  });

  describe('updateCoupon', () => {
    it('should update coupon successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(couponApi.updateCoupon).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      const result = await store.updateCoupon(1, { name: 'Updated Coupon' });

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(couponApi.updateCoupon).mockRejectedValueOnce(new Error('Error'));

      const store = useCouponStore();
      const result = await store.updateCoupon(1, { name: 'Updated Coupon' });

      expect(result).toBe(false);
    });
  });

  describe('deleteCoupon', () => {
    it('should delete coupon successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(couponApi.deleteCoupon).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      const result = await store.deleteCoupon(1);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(couponApi.deleteCoupon).mockRejectedValueOnce(new Error('Error'));

      const store = useCouponStore();
      const result = await store.deleteCoupon(999);

      expect(result).toBe(false);
    });
  });

  describe('deleteCoupons', () => {
    it('should delete multiple coupons', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(couponApi.deleteCoupons).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      const result = await store.deleteCoupons([1, 2, 3]);

      expect(result).toBe(true);
    });
  });

  describe('approveCoupon', () => {
    it('should approve coupon successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(couponApi.approveCoupon).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      const result = await store.approveCoupon(1, 'Approved');

      expect(result).toBe(true);
      expect(couponApi.approveCoupon).toHaveBeenCalledWith(1, { comment: 'Approved' });
    });

    it('should approve without comment', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(couponApi.approveCoupon).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      const result = await store.approveCoupon(1);

      expect(result).toBe(true);
      expect(couponApi.approveCoupon).toHaveBeenCalledWith(1, { comment: undefined });
    });

    it('should return false on error', async () => {
      vi.mocked(couponApi.approveCoupon).mockRejectedValueOnce(new Error('Error'));

      const store = useCouponStore();
      const result = await store.approveCoupon(999);

      expect(result).toBe(false);
    });
  });

  describe('rejectCoupon', () => {
    it('should reject coupon successfully', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(couponApi.rejectCoupon).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      const result = await store.rejectCoupon(1, 'Invalid data');

      expect(result).toBe(true);
      expect(couponApi.rejectCoupon).toHaveBeenCalledWith(1, { comment: 'Invalid data' });
    });

    it('should reject without comment', async () => {
      const mockResponse = {
        code: 200,
        data: true
      };

      vi.mocked(couponApi.rejectCoupon).mockResolvedValueOnce(mockResponse);

      const store = useCouponStore();
      const result = await store.rejectCoupon(1);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(couponApi.rejectCoupon).mockRejectedValueOnce(new Error('Error'));

      const store = useCouponStore();
      const result = await store.rejectCoupon(999);

      expect(result).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should manage loading state', async () => {
      const mockResponse = {
        code: 200,
        data: { list: [], pagination: { page: 1, pageSize: 10, total: 0 } }
      };

      vi.mocked(couponApi.getCouponList).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      const store = useCouponStore();
      const fetchPromise = store.fetchCoupons();

      expect(store.loading).toBe(true);

      await fetchPromise;

      expect(store.loading).toBe(false);
    });

    it('should initialize with default values', () => {
      const store = useCouponStore();

      expect(store.coupons).toEqual([]);
      expect(store.currentCoupon).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 0
      });
    });
  });
});
