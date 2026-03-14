const express = require('express');
const { register, login, forgotPassword, resetPassword, getMe, updateDetails, adminLogin, sendRegistrationOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

// Rate limiter for OTP paths
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 OTP requests per hour (increased for testing)
    message: {
        success: false,
        message: 'Too many OTP requests from this IP, please try again after an hour'
    }
});

const router = express.Router();

const Contact = require('../models/Contact');

router.post('/sendotp', otpLimiter, validate(schemas.sendOTP), sendRegistrationOTP);
router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/admin/login', validate(schemas.login), adminLogin);
router.post('/forgotpassword', otpLimiter, validate(schemas.forgotPassword), forgotPassword);
router.put('/resetpassword', validate(schemas.resetPassword), resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validate(schemas.updateDetails), updateDetails);
const { uploadGeneralS3 } = require('../middleware/s3Upload');
router.post('/upload', protect, (req, res, next) => {
    uploadGeneralS3.single('file')(req, res, (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        res.status(200).json({ success: true, url: req.file.location });
    });
});

router.post('/contact', async (req, res) => {
    try {
        const contact = await Contact.create(req.body);
        res.status(201).json({ success: true, data: contact });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
