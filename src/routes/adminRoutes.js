const express = require('express');
const { protect, authorize, protectAdmin } = require('../middleware/auth');

const router = express.Router();

const {
    getOverviewStats,
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseDetails,
    getCourseEnrolledUsers,
    createLesson,
    updateLesson,
    deleteLesson,
    createMaterial,
    deleteMaterial,
    createTest,
    deleteTest,
    sendNotification,
    getAllUsers,
    getUserDetails,
    deleteUser,
    getAllPayments,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    getAllCategories,
    createCategory,
    deleteCategory,
    getAllTeachers,
    createTeacher,
    deleteTeacher,
    getAllQuizzes,
    createQuiz,
    deleteQuiz,
    getAllCoupons,
    createCoupon,
    deleteCoupon,
    getAllResults,
    getAllReviews,
    deleteReview,
    getAllStudentAchievements,
    createStudentAchievement,
    updateStudentAchievement,
    deleteStudentAchievement,
    getAllOfflineCentres,
    createOfflineCentre,
    updateOfflineCentre,
    deleteOfflineCentre
} = require('../controllers/adminController');
const upload = require('../middleware/upload');
const { uploadS3 } = require('../middleware/videoUpload');

router.get('/overview', protectAdmin, getOverviewStats);

// Upload Route
router.post('/upload', protectAdmin, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Multer/Cloudinary Error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        res.status(200).json({ success: true, url: req.file.path });
    });
});

// Video Upload Route (S3)
router.post('/upload-video', protectAdmin, (req, res, next) => {
    uploadS3.single('video')(req, res, (err) => {
        if (err) {
            console.error('Multer/S3 Error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!req.file) return res.status(400).json({ success: false, message: 'No video uploaded' });
        res.status(200).json({ success: true, url: req.file.location });
    });
});

// Banner Routes
router.get('/banners', protectAdmin, getAllBanners);
router.post('/banners', protectAdmin, createBanner);
router.put('/banners/:id', protectAdmin, updateBanner);
router.delete('/banners/:id', protectAdmin, deleteBanner);

// Category Routes
router.get('/categories', protectAdmin, getAllCategories);
router.post('/categories', protectAdmin, createCategory);
router.delete('/categories/:id', protectAdmin, deleteCategory);

// Teacher Routes
router.get('/teachers', protectAdmin, getAllTeachers);
router.post('/teachers', protectAdmin, createTeacher);
router.delete('/teachers/:id', protectAdmin, deleteTeacher);

// Course Routes
router.get('/courses', protectAdmin, getAllCourses);
router.get('/courses/:courseId/curriculum', protectAdmin, getCourseDetails);
router.get('/courses/:courseId/enrolled', protectAdmin, getCourseEnrolledUsers);
router.post('/courses', protectAdmin, createCourse);
router.put('/courses/:id', protectAdmin, updateCourse);
router.delete('/courses/:id', protectAdmin, deleteCourse);

// Curriculum Routes
router.post('/lessons', protectAdmin, createLesson);
router.put('/lessons/:id', protectAdmin, updateLesson);
router.delete('/lessons/:id', protectAdmin, deleteLesson);

router.post('/materials', protectAdmin, createMaterial);
router.delete('/materials/:id', protectAdmin, deleteMaterial);

router.post('/tests', protectAdmin, createTest);
router.delete('/tests/:id', protectAdmin, deleteTest);

// Notification Routes
router.post('/notifications', protectAdmin, sendNotification);

// Payment Routes
router.get('/payments', protectAdmin, getAllPayments);

// Quiz Routes
router.get('/quizzes', protectAdmin, getAllQuizzes);
router.post('/quizzes', protectAdmin, createQuiz);
router.delete('/quizzes/:id', protectAdmin, deleteQuiz);

// Coupon Routes
router.get('/coupons', protectAdmin, getAllCoupons);
router.post('/coupons', protectAdmin, createCoupon);
router.delete('/coupons/:id', protectAdmin, deleteCoupon);

// User Management
router.get('/users', protectAdmin, getAllUsers);
router.get('/users/:id', protectAdmin, getUserDetails);
router.delete('/users/:id', protectAdmin, deleteUser);

// Quiz Result Routes
router.get('/results', protectAdmin, getAllResults);

// Review Management
router.get('/reviews', protectAdmin, getAllReviews);
router.delete('/reviews/:id', protectAdmin, deleteReview);

// Student Achievements
router.get('/achievements', protectAdmin, getAllStudentAchievements);
router.post('/achievements', protectAdmin, createStudentAchievement);
router.put('/achievements/:id', protectAdmin, updateStudentAchievement);
router.delete('/achievements/:id', protectAdmin, deleteStudentAchievement);

// Offline Centres
router.get('/offline-centres', protectAdmin, getAllOfflineCentres);
router.post('/offline-centres', protectAdmin, createOfflineCentre);
router.put('/offline-centres/:id', protectAdmin, updateOfflineCentre);
router.delete('/offline-centres/:id', protectAdmin, deleteOfflineCentre);

module.exports = router;
