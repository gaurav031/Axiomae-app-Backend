const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Lesson = require('../models/Lesson');
const StudyMaterial = require('../models/StudyMaterial');
const Test = require('../models/Test');
const Notification = require('../models/Notification');
const Banner = require('../models/Banner');
const Category = require('../models/Category');
const Teacher = require('../models/Teacher');
const Quiz = require('../models/Quiz');
const Coupon = require('../models/Coupon');
const Result = require('../models/Result');
const Review = require('../models/Review');
const StudentAchievement = require('../models/StudentAchievement');
const OfflineCentre = require('../models/OfflineCentre');
// @desc    Get dashboard metrics
// @route   GET /api/admin/overview
// @access  Private/Admin
exports.getOverviewStats = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const courseCount = await Course.countDocuments();

        // Sum total revenue from payments
        const payments = await Payment.find({ paymentStatus: 'Completed' });
        const totalRevenue = payments.reduce((acc, pay) => acc + (pay.amount || 0), 0);

        // Recent registrations (limit 5)
        const recentUsers = await User.find({ role: 'student' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt');

        res.status(200).json({
            success: true,
            data: {
                studentCount,
                courseCount,
                totalRevenue,
                recentUsers
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- Course Management ---
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: courses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'course' });
        res.status(201).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'course' });
        res.status(200).json({ success: true, message: 'Course deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'course' });
        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getCourseEnrolledUsers = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const users = await User.find({
            courses: new mongoose.Types.ObjectId(courseId)
        }).select('name email phone createdAt');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- Lesson Management ---
exports.getCourseDetails = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId).populate('lessons');
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const materials = await StudyMaterial.find({ course: courseId });
        const tests = await Test.find({ course: courseId });
        const reviews = await Review.find({ course: courseId }).populate('user', 'name profilePic');

        res.status(200).json({ success: true, data: { course, lessons: course.lessons, materials, tests, reviews } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createLesson = async (req, res) => {
    try {
        const lesson = await Lesson.create(req.body);

        // Push lesson to course's lessons array
        await Course.findByIdAndUpdate(req.body.course, {
            $push: { lessons: lesson._id }
        });

        res.status(201).json({ success: true, data: lesson });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
        res.status(200).json({ success: true, data: lesson });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
        await Course.findByIdAndUpdate(lesson.course, {
            $pull: { lessons: lesson._id }
        });
        await lesson.deleteOne();
        res.status(200).json({ success: true, message: 'Lesson deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Study Material Management ---
exports.createMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.create(req.body);
        res.status(201).json({ success: true, data: material });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteMaterial = async (req, res) => {
    try {
        await StudyMaterial.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Material deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Test Management ---
exports.createTest = async (req, res) => {
    try {
        const test = await Test.create(req.body);
        res.status(201).json({ success: true, data: test });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteTest = async (req, res) => {
    try {
        await Test.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Test deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Notifications ---
exports.sendNotification = async (req, res) => {
    try {
        const { title, message, type, isGlobal } = req.body;
        const notification = await Notification.create({
            title,
            message,
            type: type || 'general',
            isGlobal: isGlobal !== undefined ? isGlobal : true
        });

        // Broadcast over Socket.io
        const io = req.app.get('socketio');
        if (io) {
            io.emit('newNotification', notification);
        }

        res.status(201).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- User Management ---
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'student' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'courses',
                populate: { path: 'lessons' }
            })
            .populate('completedLessons')
            .populate({
                path: 'lessonProgress.lessonId',
                select: 'title duration'
            });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch test results for this user
        const results = await Result.find({ user: user._id })
            .populate('test') // Populating without selection to be safe with refPath
            .sort('-completedAt');

        // Fetch payment history
        const payments = await Payment.find({ user: user._id })
            .populate('course', 'title price')
            .sort('-createdAt');

        // Fetch reviews given by this user
        const reviews = await Review.find({ user: user._id })
            .populate('course', 'title')
            .sort('-createdAt');

        // Calculate course-wise progress
        const coursesWithProgress = user.courses.map(course => {
            const courseLessons = course.lessons || [];
            const completedInCourse = user.completedLessons.filter(l => {
                const lessonId = (l._id || l).toString();
                return courseLessons.some(cl => (cl._id || cl).toString() === lessonId);
            }).length;

            const completionRate = courseLessons.length > 0
                ? Math.round((completedInCourse / courseLessons.length) * 100)
                : 0;

            return {
                ...course.toObject(),
                completionRate,
                completedCount: completedInCourse,
                totalLessons: courseLessons.length
            };
        });

        res.status(200).json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    courses: coursesWithProgress
                },
                results,
                payments,
                reviews,
                stats: {
                    totalVideosWatched: user.completedLessons.length,
                    inProgressCount: user.lessonProgress.length,
                    activeCourses: coursesWithProgress.filter(c => c.completionRate > 0).length
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Error fetching user details' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Payments ---
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('user', 'name email').populate('course', 'title').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- Banner Management ---
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: banners });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'banner' });
        res.status(201).json({ success: true, data: banner });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'banner' });
        res.status(200).json({ success: true, message: 'Banner deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'banner' });
        res.status(200).json({ success: true, data: banner });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Category Management ---
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'category' });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'category' });
        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Teacher Management ---
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: teachers });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.create(req.body);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'teacher' });
        res.status(201).json({ success: true, data: teacher });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        await Teacher.findByIdAndDelete(req.params.id);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'teacher' });
        res.status(200).json({ success: true, message: 'Teacher deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Quiz Management ---
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: quizzes });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.create(req.body);
        res.status(201).json({ success: true, data: quiz });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Quiz deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Coupon Management ---
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: coupons });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: coupon });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Coupon deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getAllResults = async (req, res) => {
    try {
        const results = await Result.find()
            .populate('user', 'name email phone')
            .populate('test', 'title category')
            .sort('-completedAt');
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Review Management ---
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email phone')
            .populate('course', 'title')
            .sort('-createdAt');
        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Student Achievement Management ---
exports.getAllStudentAchievements = async (req, res) => {
    try {
        const achievements = await StudentAchievement.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: achievements });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createStudentAchievement = async (req, res) => {
    try {
        const achievement = await StudentAchievement.create(req.body);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'studentAchievement' });
        res.status(201).json({ success: true, data: achievement });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateStudentAchievement = async (req, res) => {
    try {
        const achievement = await StudentAchievement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'studentAchievement' });
        res.status(200).json({ success: true, data: achievement });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteStudentAchievement = async (req, res) => {
    try {
        await StudentAchievement.findByIdAndDelete(req.params.id);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'studentAchievement' });
        res.status(200).json({ success: true, message: 'Achievement deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Offline Centre Management ---
exports.getAllOfflineCentres = async (req, res) => {
    try {
        const centres = await OfflineCentre.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: centres });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createOfflineCentre = async (req, res) => {
    try {
        const centre = await OfflineCentre.create(req.body);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'offlineCentre' });
        res.status(201).json({ success: true, data: centre });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateOfflineCentre = async (req, res) => {
    try {
        const centre = await OfflineCentre.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!centre) return res.status(404).json({ success: false, message: 'Centre not found' });
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'offlineCentre' });
        res.status(200).json({ success: true, data: centre });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteOfflineCentre = async (req, res) => {
    try {
        await OfflineCentre.findByIdAndDelete(req.params.id);
        const io = req.app.get('socketio');
        if (io) io.emit('homeDataUpdate', { type: 'offlineCentre' });
        res.status(200).json({ success: true, message: 'Centre deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
