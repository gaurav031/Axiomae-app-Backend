const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    test: {
        type: mongoose.Schema.ObjectId,
        refPath: 'onModel',
        required: true,
    },
    onModel: {
        type: String,
        required: true,
        enum: ['Test', 'Quiz']
    },
    score: {
        type: Number,
        required: true,
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    answers: [
        {
            questionId: String,
            selectedOption: Number,
            isCorrect: Boolean,
        },
    ],
    attemptNumber: {
        type: Number,
        default: 1,
    },
    completedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Result', resultSchema);
