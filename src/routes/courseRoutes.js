const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const StudyMaterial = require('../models/StudyMaterial');
const Test = require('../models/Test');
const Result = require('../models/Result');
const Review = require('../models/Review');

const router = express.Router();

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('lessons');
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Get all tests
// @route   GET /api/courses/tests
// @access  Public (Preview)
router.get('/tests', async (req, res) => {
    try {
        const query = req.query.course ? { course: req.query.course } : {};
        const tests = await Test.find(query).select('-questions.correctOption');
        res.status(200).json({ success: true, data: tests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Get all tests for enrolled courses
// @route   GET /api/courses/my-quizzes
// @access  Private
router.get('/my-quizzes', protect, async (req, res) => {
    try {
        // Enrolled courses are in user.courses
        const user = await User.findById(req.user.id);
        const courseIds = user.courses || [];

        // Find all tests where course is in courseIds
        const tests = await Test.find({ course: { $in: courseIds } }).populate('course', 'title');
        res.status(200).json({ success: true, data: tests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Get single test with questions
// @route   GET /api/courses/tests/:id
// @access  Private
router.get('/tests/:id', protect, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        res.status(200).json({ success: true, data: test });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('lessons')
            .populate({
                path: 'reviews',
                populate: { path: 'user', select: 'name profilePic' }
            })
            .lean();

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Fetch study materials for this course
        const materials = await StudyMaterial.find({ course: req.params.id });
        course.materials = materials;

        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// @desc    Add review to course
// @route   POST /api/courses/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const user = await User.findById(req.user.id);

        // Check if user has purchased this course
        const isPurchased = user.courses.some(c => c.toString() === req.params.id);
        if (!isPurchased) {
            return res.status(403).json({ success: false, message: 'You must enroll in this course to leave a review.' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if user already reviewed
        const existingReview = await Review.findOne({ user: req.user.id, course: req.params.id });
        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment;
            await existingReview.save();
            return res.status(200).json({ success: true, data: existingReview, message: 'Review updated' });
        }

        // Create review
        const review = await Review.create({
            user: req.user.id,
            course: req.params.id,
            rating,
            comment
        });

        // Add to course
        course.reviews.push(review._id);
        await course.save();

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// @desc    Get single lesson
// @route   GET /api/courses/lessons/:id
// @access  Private
router.get('/lessons/:id', protect, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }
        res.status(200).json({ success: true, data: lesson });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Mark lesson as completed
// @route   POST /api/courses/lessons/:id/complete
// @access  Private
router.post('/lessons/:id/complete', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const isAlreadyCompleted = user.completedLessons.some(id => id && id.toString() === req.params.id);

        if (!isAlreadyCompleted) {
            user.completedLessons.push(req.params.id);
            await user.save();
        }
        res.status(200).json({ success: true, data: user.completedLessons });
    } catch (err) {
        console.error('Error in complete route:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Update lesson progress (watched percentage)
// @route   POST /api/courses/lessons/:id/progress
// @access  Private
router.post('/lessons/:id/progress', protect, async (req, res) => {
    try {
        const { watchedPercent } = req.body;
        const user = await User.findById(req.user.id);

        const progressIdx = user.lessonProgress.findIndex(item => item.lessonId && item.lessonId.toString() === req.params.id);

        if (progressIdx > -1) {
            // Only update if current percent is higher
            if (watchedPercent > user.lessonProgress[progressIdx].watchedPercent) {
                user.lessonProgress[progressIdx].watchedPercent = watchedPercent;
                user.lessonProgress[progressIdx].lastWatchedAt = Date.now();
            }
        } else {
            user.lessonProgress.push({
                lessonId: req.params.id,
                watchedPercent,
                lastWatchedAt: Date.now()
            });
        }

        // Auto-complete if percent >= 90
        const isAlreadyCompleted = user.completedLessons.some(id => id && id.toString() === req.params.id);
        if (watchedPercent >= 90 && !isAlreadyCompleted) {
            user.completedLessons.push(req.params.id);
        }

        user.markModified('lessonProgress');
        user.markModified('completedLessons');
        await user.save();
        res.status(200).json({ success: true, data: user.lessonProgress });
    } catch (err) {
        console.error('Error in progress route:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});


// ... existing routes ...

// @desc    Get all study materials
// @route   GET /api/courses/materials
// @access  Private
router.get('/materials', protect, async (req, res) => {
    try {
        const materials = await StudyMaterial.find();
        res.status(200).json({ success: true, data: materials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Submit test result
// @route   POST /api/courses/tests/:id/submit
// @access  Private
router.post('/tests/:id/submit', protect, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        const { answers } = req.body; // Array of selected options

        let score = 0;
        test.questions.forEach((q, idx) => {
            const selected = answers[idx];
            const answer = typeof selected === 'object' ? selected.selectedOption : selected;
            if (answer === q.correctOption) {
                score += (q.marks || 1);
            }
        });

        // Count previous attempts
        const attemptsCount = await Result.countDocuments({
            user: req.user.id,
            test: test._id
        });

        const result = await Result.create({
            user: req.user.id,
            test: test._id,
            onModel: 'Test',
            score,
            totalMarks: test.questions.reduce((acc, q) => acc + (q.marks || 1), 0),
            attemptNumber: attemptsCount + 1,
            answers: test.questions.map((q, idx) => ({
                questionId: q._id,
                selectedOption: typeof answers[idx] === 'object' ? answers[idx].selectedOption : answers[idx],
                isCorrect: (typeof answers[idx] === 'object' ? answers[idx].selectedOption : answers[idx]) === q.correctOption
            }))
        });

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
