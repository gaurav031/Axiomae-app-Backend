const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    profilePic: {
        type: String,
        default: 'https://placehold.jp/150x150.png',
    },
    exam: String,
    class: String,
    stream: String,
    city: String,
    state: String,
    courses: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Course',
        },
    ],
    completedLessons: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Lesson',
        },
    ],
    lessonProgress: [
        {
            lessonId: { type: mongoose.Schema.ObjectId, ref: 'Lesson' },
            watchedPercent: { type: Number, default: 0 },
            lastWatchedAt: { type: Date, default: Date.now }
        }
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationOTP: String,
    verificationOTPExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
