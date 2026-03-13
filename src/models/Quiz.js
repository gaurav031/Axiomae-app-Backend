const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    category: String,
    duration: Number, // in minutes
    questions: [
        {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctOption: { type: Number, required: true }, // Index 0-3
            marks: { type: Number, default: 1 },
        },
    ],
    active: {
        type: Boolean,
        default: true
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Quiz', quizSchema);
