const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    fileUrl: {
        type: String,
        required: true,
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
    },
    category: String,
    downloads: {
        type: Number,
        default: 0
    },
    isFree: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
