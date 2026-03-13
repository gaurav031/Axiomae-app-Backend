const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
    },
    duration: Number, // in minutes
    questions: [
        {
            questionText: String,
            options: [String],
            correctOption: Number,
            marks: { type: Number, default: 1 },
        },
    ],
    isFree: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Test', testSchema);
