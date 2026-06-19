import { Router } from 'express';
import couponController from '../controllers/couponController.js';

const router = Router();

router.get('/', (req, res) => couponController.getCouponList(req, res));
router.get('/:id', (req, res) => couponController.getCouponById(req, res));
router.post('/', (req, res) => couponController.createCoupon(req, res));
router.put('/:id', (req, res) => couponController.updateCoupon(req, res));
router.delete('/:id', (req, res) => couponController.deleteCoupon(req, res));
router.delete('/', (req, res) => couponController.deleteCoupons(req, res));
router.post('/:id/approve', (req, res) => couponController.approveCoupon(req, res));
router.post('/:id/reject', (req, res) => couponController.rejectCoupon(req, res));
router.get('/status/pending', (req, res) => couponController.getPendingCoupons(req, res));

export default router;
