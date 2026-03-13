const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    thumbnail: String,
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    oldPrice: {
        type: Number,
        default: 0,
    },
    targetExam: {
        type: String,
        default: 'JEE 2027',
    },
    syllabusEndDate: {
        type: String,
        default: "26th Dec'26",
    },
    batchDetails: [
        {
            icon: String,
            label: String,
            value: String,
        }
    ],
    faqs: [
        {
            question: String,
            answer: String,
        }
    ],
    isPremium: {
        type: Boolean,
        default: true,
    },
    instructor: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    standard: {
        type: String,
        default: 'All', // e.g., Grade 10, Class 12, Competitive
    },
    level: {
        type: String,
        default: 'Beginner', // Beginner, Intermediate, Advanced
    },
    lessons: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Lesson',
        },
    ],
    materials: [
        {
            title: String,
            fileUrl: String,
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Review'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Course', courseSchema);
