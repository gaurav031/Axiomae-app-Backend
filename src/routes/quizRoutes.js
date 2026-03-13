const express = require('express');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all active quizzes
router.get('/', async (req, res) => {
    try {
        const query = req.query.course
            ? { course: req.query.course }
            : { $or: [{ course: null }, { course: { $exists: false } }] };
        const quizzes = await Quiz.find(query).sort('-createdAt');
        res.status(200).json({ success: true, data: quizzes });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Get user's recent results (Must be before :id)
router.get('/my/recent', protect, async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.id })
            .sort('-completedAt')
            .limit(5)
            .populate({
                path: 'test',
                select: 'title category'
            });
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Get quiz details (with questions)
router.get('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        res.status(200).json({ success: true, data: quiz });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Submit quiz results
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const { score, totalMarks, answers } = req.body;

        // Count previous attempts
        const attempts = await Result.countDocuments({
            user: req.user.id,
            test: req.params.id
        });

        const result = await Result.create({
            user: req.user.id,
            test: req.params.id,
            onModel: 'Quiz',
            score,
            totalMarks,
            answers,
            attemptNumber: attempts + 1
        });
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
