const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'course_update', 'payment', 'system'],
        default: 'general'
    },
    targetUsers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    isGlobal: {
        type: Boolean,
        default: true
    },
    readBy: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
