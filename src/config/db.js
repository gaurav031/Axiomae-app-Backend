const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const logger = require('../utils/logger');
    logger.info({ host: conn.connection.host }, 'MongoDB Connected successfully');
  } catch (error) {
    const logger = require('../utils/logger');
    logger.error({ err: error }, 'MongoDB connection failed');
    process.exit(1);
  }
};

module.exports = connectDB;
