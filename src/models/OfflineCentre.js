const mongoose = require('mongoose');

const offlineCentreSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: String,
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('OfflineCentre', offlineCentreSchema);
