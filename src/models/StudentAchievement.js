const mongoose = require('mongoose');

const studentAchievementSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    description: String,
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudentAchievement', studentAchievementSchema);
