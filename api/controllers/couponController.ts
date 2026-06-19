import type { Request, Response } from 'express';
import type { CouponListParams } from '../services/couponService.js';
import couponService from '../services/couponService.js';

class CouponController {
  async getCouponList(req: Request, res: Response): Promise<void> {
    try {
      const params: CouponListParams = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        keyword: req.query.keyword as string,
        status: req.query.status as string,
      };

      const result = couponService.getCouponList(params);

      res.json({
        code: 200,
        message: 'success',
        data: result,
      });
    } catch (error) {
      console.error('Error getting coupon list:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null,
      });
    }
  }

  async getCouponById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          code: 400,
          message: 'Invalid coupon ID',
          data: null,
        });
        return;
      }

      const coupon = couponService.getCouponById(id);

      if (!coupon) {
        res.status(404).json({
          code: 404,
          message: 'Coupon not found',
          data: null,
        });
        return;
      }

      res.json({
        code: 200,
        message: 'success',
        data: coupon,
      });
    } catch (error) {
      console.error('Error getting coupon:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null,
      });
    }
  }

  async createCoupon(req: Request, res: Response): Promise<void> {
    try {
      const couponData = req.body;

      if (!couponData.name || !couponData.value || !couponData.start_time || !couponData.end_time) {
        res.status(400).json({
          code: 400,
          message: 'Missing required fields',
          data: null,
        });
        return;
      }

      const id = couponService.createCoupon({
        name: couponData.name,
        type: couponData.type || 'cash',
        value: couponData.value,
        min_amount: couponData.min_amount,
        max_discount: couponData.max_discount,
        total_count: couponData.total_count || 0,
        remain_count: couponData.remain_count || couponData.total_count || 0,
        per_user_limit: couponData.per_user_limit,
        start_time: couponData.start_time,
        end_time: couponData.end_time,
        status: couponData.status || 'draft',
        description: couponData.description,
      });

      res.json({
        code: 200,
        message: 'Coupon created successfully',
        data: { id },
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null,
      });
    }
  }

  async updateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          code: 400,
          message: 'Invalid coupon ID',
          data: null,
        });
        return;
      }

      const updates = req.body;
      const success = couponService.updateCoupon(id, updates);

      if (!success) {
        res.status(404).json({
          code: 404,
          message: 'Coupon not found or no changes made',
          data: null,
        });
        return;
      }

      res.json({
        code: 200,
        message: 'Coupon updated successfully',
        data: null,
      });
    } catch (error) {
      console.error('Error updating coupon:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null,
      });
    }
  }

  async deleteCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          code: 400,
          message: 'Invalid coupon ID',
          data: null,
        });
        return;
      }

      const success = couponService.deleteCoupon(id);

      if (!success) {
        res.status(404).json({
          code: 404,
          message: 'Coupon not found',
          data: null,
        });
        return;
      }

      res.json({
        code: 200,
        message: 'Coupon deleted successfully',
        data: null,
      });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null,
      });
    }
  }

  async deleteCoupons(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          code: 400,
          message: 'Invalid ids array',
          data: null,
        });
        return;
      }

      const deletedCount = couponService.deleteCoupons(ids);

      res.json({
        code: 200,
        message: `${deletedCount} coupon(s) deleted successfully`,
        data: null,
      });
    } catch (error) {
      console.error('Error deleting coupons:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null,
      });
    }
  }

  async approveCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          code: 400,
          message: 'Invalid coupon ID',
          data: null,
        });
        return;
      }

      const { comment, reviewer_id } = req.body;
      const success = couponService.approveCoupon(id, { comment, reviewer_id });

      if (!success) {
        res.status(404).json({
          code: 404,
          message: 'Coupon not found or not in pending status',
          data: null,
        });
        return;
      }

      res.json({
        code: 200,
        message: 'Coupon approved successfully',
        data: null,
      });
    } catch (error) {
      console.error('Error approving coupon:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null,
      });
    }
  }

  async rejectCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          code: 400,
          message: 'Invalid coupon ID',
          data: null,
        });
        return;
      }

      const { comment, reviewer_id } = req.body;
      const success = couponService.rejectCoupon(id, { comment, reviewer_id });

      if (!success) {
        res.status(404).json({
          code: 404,
          message: 'Coupon not found or not in pending status',
          data: null,
        });
        return;
      }

      res.json({
        code: 200,
        message: 'Coupon rejected',
        data: null,
      });
    } catch (error) {
      console.error('Error rejecting coupon:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null,
      });
    }
  }

  async getPendingCoupons(req: Request, res: Response): Promise<void> {
    try {
      const coupons = couponService.getPendingCoupons();

      res.json({
        code: 200,
        message: 'success',
        data: coupons,
      });
    } catch (error) {
      console.error('Error getting pending coupons:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null,
      });
    }
  }
}

export default new CouponController();
