const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    videoUrl: String,
    duration: String,
    isFree: {
        type: Boolean,
        default: false,
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true,
    },
    notes: [
        {
            title: String,
            fileUrl: String,
        }
    ],
    resources: [
        {
            title: String,
            fileUrl: String,
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
