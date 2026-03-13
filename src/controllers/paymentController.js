const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Course = require('../models/Course');
const Coupon = require('../models/Coupon');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { courseId, couponCode } = req.body;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        let finalPrice = course.price;
        let discountApplied = 0;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
            if (coupon && new Date() < coupon.expiryDate && coupon.usedCount < coupon.usageLimit) {
                if (coupon.discountType === 'percentage') {
                    discountApplied = (course.price * coupon.discountAmount) / 100;
                } else {
                    discountApplied = coupon.discountAmount;
                }
                finalPrice = Math.max(0, course.price - discountApplied);
            }
        }

        if (finalPrice <= 0) {
            // Free course after discount
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { courses: courseId }
            });

            return res.status(200).json({
                success: true,
                free: true,
                message: 'Course Unlocked with 100% discount!'
            });
        }

        const options = {
            amount: Math.round(finalPrice * 100), // amount in the smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

            // Save initial payment record
        await Payment.create({
            user: req.user._id,
            course: courseId,
            razorpayOrderId: order.id,
            amount: finalPrice,
            couponCode: couponCode ? couponCode.toUpperCase() : undefined,
            status: 'pending',
        });

        res.status(200).json({
            success: true,
            key_id: process.env.RAZORPAY_KEY_ID, // Send public key to frontend
            order,
            discount: discountApplied,
            finalPrice
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment successful
            const payment = await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: 'completed',
                },
                { new: true }
            );

            // Handle coupon usage after successful payment
            if (payment.couponCode) {
                const coupon = await Coupon.findOne({ code: payment.couponCode });
                if (coupon) {
                    coupon.usedCount += 1;
                    await coupon.save();
                }
            }

            // Add course to user's purchased courses
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { courses: payment.course },
            });

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Validate Coupon
// @route   POST /api/payments/validate-coupon
// @access  Private
exports.validateCoupon = async (req, res) => {
    try {
        const { code, amount } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }

        if (new Date() > coupon.expiryDate) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        if (amount < coupon.minPurchase) {
            return res.status(400).json({ success: false, message: `Minimum purchase of ₹${coupon.minPurchase} required` });
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (amount * coupon.discountAmount) / 100;
        } else {
            discount = coupon.discountAmount;
        }

        res.status(200).json({
            success: true,
            data: {
                code: code.toUpperCase(),
                discount,
                finalPrice: Math.max(0, amount - discount),
                discountType: coupon.discountType,
                discountAmount: coupon.discountAmount
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get All Active Coupons
// @route   GET /api/payments/coupons
// @access  Private
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({
            active: true,
            expiryDate: { $gt: new Date() }
        });

        // Filter out coupons that reached usage limit
        const availableCoupons = coupons.filter(c => c.usedCount < c.usageLimit);

        res.status(200).json({
            success: true,
            data: availableCoupons
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
