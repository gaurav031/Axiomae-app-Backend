const express = require('express');
const Banner = require('../models/Banner');
const Announcement = require('../models/Announcement');
const Category = require('../models/Category');
const Course = require('../models/Course');
const LiveClass = require('../models/LiveClass');
const Teacher = require('../models/Teacher');
const StudentAchievement = require('../models/StudentAchievement');
const OfflineCentre = require('../models/OfflineCentre');

const router = express.Router();

// @desc    Get data for home screen
// @route   GET /api/home
// @access  Public
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find();
        const announcements = await Announcement.find().sort('-createdAt').limit(5);
        const categories = await Category.find();
        const featuredCourses = await Course.find({ isPremium: true }).limit(5);
        const ongoingLiveClasses = await LiveClass.find({
            status: 'ongoing'
        });
        const teachers = await Teacher.find().limit(10);
        const studentAchievements = await StudentAchievement.find({ active: true }).sort('-createdAt');
        const offlineCentres = await OfflineCentre.find({ active: true }).sort('-createdAt');

        res.status(200).json({
            success: true,
            data: {
                banners,
                announcements,
                categories,
                featuredCourses,
                ongoingLiveClasses,
                teachers,
                studentAchievements,
                offlineCentres
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
