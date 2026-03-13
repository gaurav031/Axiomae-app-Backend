const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    bio: String,
    rating: {
        type: Number,
        default: 4.5
    },
    studentsCount: {
        type: Number,
        default: 0
    },
    coursesCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Teacher', teacherSchema);
