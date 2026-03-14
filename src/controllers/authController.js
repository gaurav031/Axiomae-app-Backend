const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

// @desc    Send Registration OTP
// @route   POST /api/auth/sendotp
// @access  Public
exports.sendRegistrationOTP = async (req, res) => {
    try {
        const { email } = req.body;
        logger.info({ email }, 'OTP request received');

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        if (!user) {
            user = await User.create({
                email,
                name: 'Pending User',
                password: Math.random().toString(36).slice(-10),
                phone: '0000000000',
                verificationOTP: otp,
                verificationOTPExpire: Date.now() + 10 * 60 * 1000,
                isVerified: false
            });
        } else {
            user.verificationOTP = otp;
            user.verificationOTPExpire = Date.now() + 10 * 60 * 1000;
            await user.save();
        }

        try {
            logger.info({ email: user.email, otp }, 'Attempting to send verification email');
            await sendEmail({
                email: user.email,
                subject: 'Email Verification OTP',
                message: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`
            });

            logger.info({ email: user.email }, 'Verification OTP email sent successfully');
            res.status(200).json({ success: true, message: 'OTP sent to email' });
        } catch (err) {
            logger.error({ 
                err, 
                email: user.email,
                stack: err.stack 
            }, 'Failed to send verification email');
            user.verificationOTP = undefined;
            user.verificationOTPExpire = undefined;
            await user.save();
            return res.status(500).json({ 
                success: false, 
                message: 'Email could not be sent. Please check SMTP settings.', 
                error: err.message,
                code: err.code
            });
        }
    } catch (err) {
        logger.error({ err, stack: err.stack, body: req.body }, 'Error in sendRegistrationOTP main catch block');
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, otp } = req.body;

        const user = await User.findOne({
            email,
            verificationOTP: otp,
            verificationOTPExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.name = name;
        user.password = password;
        user.phone = phone;
        user.isVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpire = undefined;

        await user.save();

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email first' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('courses');
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Validate precisely with environment variables
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Give out a super token
            const token = jwt.sign({ id: 'super-admin-id', role: 'admin' }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            });

            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: 'super-admin-id',
                    name: 'Super Admin',
                    email: process.env.ADMIN_EMAIL,
                    role: 'admin'
                }
            });
        }

        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            profilePic: req.body.profilePic,
            exam: req.body.exam,
            class: req.body.class,
            stream: req.body.stream,
            city: req.body.city,
            state: req.body.state,
        };

        // Filter out undefined fields
        Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        }).populate('courses');

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and expiry to user model
        user.resetPasswordToken = otp;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save();

        try {
            logger.info({ email: user.email, otp }, 'Attempting to send password reset email');
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
            });

            logger.info({ email: user.email }, 'Password reset email sent successfully');
            res.status(200).json({
                success: true,
                message: 'OTP sent to email'
            });
        } catch (err) {
            logger.error({ 
                err, 
                email: user.email,
                stack: err.stack 
            }, 'Failed to send password reset email');
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ 
                success: false, 
                message: 'Email could not be sent. Please check SMTP settings.', 
                error: err.message,
                code: err.code
            });
        }
    } catch (err) {
        logger.error({ err, stack: err.stack, body: req.body }, 'Error in forgotPassword main catch block');
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reset Password with OTP
// @route   PUT /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordToken: otp,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
        },
    });
};
