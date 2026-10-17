const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_scholarship_matcher';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error('[Database Helper] Please ensure MongoDB service is running (Windows: net start MongoDB or mongod).');
    process.exit(1);
  }
};

// Runtime Connection Event Listeners
mongoose.connection.on('disconnected', () => {
  console.warn('[Database Warning] MongoDB connection lost. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database Info] MongoDB connection restored.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Runtime Error] ${err.message}`);
});

module.exports = connectDB;
