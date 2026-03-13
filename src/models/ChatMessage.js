const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    liveClassId: {
        type: mongoose.Schema.ObjectId,
        ref: 'LiveClass',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
