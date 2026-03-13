const express = require('express');
const {
    getLiveClasses,
    getLiveClass,
    createLiveClass,
    updateLiveClass,
    deleteLiveClass
} = require('../controllers/liveClassController');

const router = express.Router();

router
    .route('/')
    .get(getLiveClasses)
    .post(createLiveClass);

router
    .route('/:id')
    .get(getLiveClass)
    .put(updateLiveClass)
    .delete(deleteLiveClass);

module.exports = router;
