const LiveClass = require('../models/LiveClass');

// @desc    Get all live classes
// @route   GET /api/live-classes
// @access  Public/Admin
exports.getLiveClasses = async (req, res) => {
    try {
        const liveClasses = await LiveClass.find().populate('course', 'title');
        res.status(200).json({ success: true, count: liveClasses.length, data: liveClasses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single live class
// @route   GET /api/live-classes/:id
// @access  Public
exports.getLiveClass = async (req, res) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id).populate('course', 'title');
        if (!liveClass) {
            return res.status(404).json({ success: false, message: 'Live class not found' });
        }
        res.status(200).json({ success: true, data: liveClass });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create new live class
// @route   POST /api/live-classes
// @access  Admin
exports.createLiveClass = async (req, res) => {
    try {
        console.log('[BACKEND] createLiveClass started with payload:', req.body);

        // Use the provided RTMP stream key or generate a new secure one
        const finalStreamKey = req.body.rtmpStreamKey || `sk_live_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36).slice(-5)}`;
        req.body.rtmpStreamKey = finalStreamKey;

        // Use real AWS Environment variables for streaming
        const serverIp = process.env.MEDIA_SERVER_IP || '100.48.49.48';

        if (!req.body.hlsStreamUrl) {
            // Format: http://IP:8080/live/streamKey.m3u8
            req.body.hlsStreamUrl = `http://${serverIp}:8080/live/${finalStreamKey}.m3u8`;
        }

        console.log(`[BACKEND] createLiveClass - Assigned RTMP Key: ${req.body.rtmpStreamKey}`);
        console.log(`[BACKEND] createLiveClass - Assigned HLS URL:  ${req.body.hlsStreamUrl}`);

        const liveClass = await LiveClass.create(req.body);
        console.log('[BACKEND] createLiveClass - Saved to DB successfully:', liveClass._id);
        
        res.status(201).json({ success: true, data: liveClass });
    } catch (err) {
        console.error('[BACKEND] Error in createLiveClass:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update live class
// @route   PUT /api/live-classes/:id
// @access  Admin
exports.updateLiveClass = async (req, res) => {
    try {
        let liveClass = await LiveClass.findById(req.params.id);
        if (!liveClass) {
            return res.status(404).json({ success: false, message: 'Live class not found' });
        }

        liveClass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: liveClass });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete live class
// @route   DELETE /api/live-classes/:id
// @access  Admin
exports.deleteLiveClass = async (req, res) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id);
        if (!liveClass) {
            return res.status(404).json({ success: false, message: 'Live class not found' });
        }

        await liveClass.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
