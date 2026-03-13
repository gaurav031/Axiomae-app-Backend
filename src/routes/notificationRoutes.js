const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// @desc    Get all notifications with read status
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { isGlobal: true },
                { targetUsers: req.user.id }
            ]
        }).sort({ createdAt: -1 }).limit(50);

        // Map notifications to include isRead status for current user
        const data = notifications.map(notif => {
            const isRead = notif.readBy.includes(req.user.id);
            return {
                ...notif._doc,
                isRead
            };
        });

        res.status(200).json({ success: true, count: data.length, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            $or: [
                { isGlobal: true },
                { targetUsers: req.user.id }
            ],
            readBy: { $ne: req.user.id }
        });

        res.status(200).json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {
            $addToSet: { readBy: req.user.id }
        });

        res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
