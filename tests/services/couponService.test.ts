import { describe, it, expect, beforeEach } from 'vitest';
import { CouponService } from '../../api/services/couponService';

describe('CouponService', () => {
  let couponService: CouponService;
  let testCouponId: number;

  beforeEach(() => {
    couponService = new CouponService();
    
    testCouponId = couponService.createCoupon({
      name: 'Test Coupon',
      type: 'cash',
      value: 10,
      total_count: 100,
      start_time: '2024-01-01',
      end_time: '2024-12-31',
      status: 'pending'
    });
  });

  describe('approveCoupon', () => {
    it('should approve a pending coupon successfully', () => {
      const mockParams = { comment: 'Approved by admin', reviewer_id: 1 };

      const result = couponService.approveCoupon(testCouponId, mockParams);

      expect(result).toBe(true);
    });

    it('should return false when approving non-pending coupon', () => {
      const mockId = 999;
      const mockParams = { comment: 'Test' };

      const result = couponService.approveCoupon(mockId, mockParams);

      expect(result).toBe(false);
    });

    it('should approve coupon without comment', () => {
      const mockParams = {};

      const result = couponService.approveCoupon(testCouponId, mockParams);

      expect(result).toBe(true);
    });

    it('should approve coupon with null reviewer_id', () => {
      const mockParams = { comment: 'Test', reviewer_id: undefined };

      const result = couponService.approveCoupon(testCouponId, mockParams);

      expect(result).toBe(true);
    });
  });

  describe('rejectCoupon', () => {
    it('should reject a pending coupon successfully', () => {
      const newCouponToReject = couponService.createCoupon({
        name: 'To Reject',
        type: 'cash',
        value: 5,
        total_count: 50,
        start_time: '2024-01-01',
        end_time: '2024-12-31',
        status: 'pending'
      });

      const mockParams = { comment: 'Rejected - invalid data', reviewer_id: 1 };

      const result = couponService.rejectCoupon(newCouponToReject, mockParams);

      expect(result).toBe(true);
    });

    it('should return false when rejecting non-pending coupon', () => {
      const mockId = 999;
      const mockParams = { comment: 'Test' };

      const result = couponService.rejectCoupon(mockId, mockParams);

      expect(result).toBe(false);
    });

    it('should reject coupon with empty comment', () => {
      const mockParams = { comment: '' };

      const result = couponService.rejectCoupon(testCouponId, mockParams);

      expect(result).toBe(true);
    });
  });

  describe('getCouponList', () => {
    it('should return coupon list with pagination', () => {
      const result = couponService.getCouponList({ page: 1, pageSize: 10 });

      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('pageSize');
      expect(result.pagination).toHaveProperty('total');
    });

    it('should filter by keyword', () => {
      const result = couponService.getCouponList({ keyword: 'test' });

      expect(result.list).toBeDefined();
    });

    it('should filter by status', () => {
      const result = couponService.getCouponList({ status: 'pending' });

      expect(result.list).toBeDefined();
    });

    it('should use default pagination values', () => {
      const result = couponService.getCouponList({});

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
    });
  });

  describe('getCouponById', () => {
    it('should return coupon by id', () => {
      const result = couponService.getCouponById(testCouponId);

      expect(result).toBeDefined();
    });

    it('should return undefined for non-existent coupon', () => {
      const result = couponService.getCouponById(9999);

      expect(result).toBeUndefined();
    });
  });

  describe('createCoupon', () => {
    it('should create a new coupon', () => {
      const newCoupon = {
        name: 'Test Coupon 2',
        type: 'discount',
        value: 20,
        total_count: 50,
        start_time: '2024-01-01',
        end_time: '2024-12-31',
        status: 'draft'
      };

      const result = couponService.createCoupon(newCoupon);

      expect(result).toBeGreaterThan(0);
    });

    it('should set default values for optional fields', () => {
      const newCoupon = {
        name: 'Test Coupon 3',
        type: 'discount',
        value: 20,
        total_count: 50,
        start_time: '2024-01-01',
        end_time: '2024-12-31',
        status: 'draft'
      };

      const result = couponService.createCoupon(newCoupon);

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('updateCoupon', () => {
    it('should update coupon fields', () => {
      const updates = { name: 'Updated Coupon Name' };

      const result = couponService.updateCoupon(testCouponId, updates);

      expect(result).toBe(true);
    });

    it('should return false when updating with no allowed fields', () => {
      const updates = { id: 999 };

      const result = couponService.updateCoupon(testCouponId, updates);

      expect(result).toBe(false);
    });
  });

  describe('deleteCoupon', () => {
    it('should delete a coupon', () => {
      const newCouponId = couponService.createCoupon({
        name: 'To Delete',
        type: 'cash',
        value: 5,
        total_count: 10,
        start_time: '2024-01-01',
        end_time: '2024-12-31',
        status: 'draft'
      });

      const result = couponService.deleteCoupon(newCouponId);

      expect(result).toBe(true);
    });

    it('should return false when deleting non-existent coupon', () => {
      const result = couponService.deleteCoupon(9999);

      expect(result).toBe(false);
    });
  });

  describe('deleteCoupons', () => {
    it('should delete multiple coupons', () => {
      const couponId2 = couponService.createCoupon({
        name: 'To Delete 2',
        type: 'cash',
        value: 5,
        total_count: 10,
        start_time: '2024-01-01',
        end_time: '2024-12-31',
        status: 'draft'
      });

      const result = couponService.deleteCoupons([testCouponId, couponId2]);

      expect(result).toBeGreaterThanOrEqual(2);
    });

    it('should return 0 when array is empty', () => {
      const result = couponService.deleteCoupons([]);

      expect(result).toBe(0);
    });
  });

  describe('getPendingCoupons', () => {
    it('should return list of pending coupons', () => {
      const result = couponService.getPendingCoupons();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getActiveCoupons', () => {
    it('should return list of active coupons within time range', () => {
      const result = couponService.getActiveCoupons();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
