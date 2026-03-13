const express = require('express');
const { createOrder, verifyPayment, validateCoupon, getCoupons } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All payment routes are protected

router.get('/coupons', getCoupons);
router.post('/order', createOrder);
router.post('/verify', verifyPayment);
router.post('/validate-coupon', validateCoupon);

module.exports = router;
