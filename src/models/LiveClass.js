const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
    },
    instructor: String,
    startTime: {
        type: Date,
        required: true,
    },
    meetingId: String,
    rtmpStreamKey: {
        type: String
    },
    hlsStreamUrl: String,
    recordingUrl: String,
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed'],
        default: 'scheduled',
    },
});

module.exports = mongoose.model('LiveClass', liveClassSchema);
