const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables at the very beginning
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { sendResponse } = require('./utils/responseHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const eligibilityRoutes = require('./routes/eligibilityRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const helmet = require('helmet');

// Connect Database
connectDB();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Endpoint (STEP 6 requirement)
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const statusCode = isDbConnected ? 200 : 503;
  return sendResponse(
    res,
    statusCode,
    isDbConnected,
    isDbConnected ? 'AI Scholarship Matcher API is healthy' : 'Database connection unavailable',
    {
      server: 'ok',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date()
    }
  );
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/profile', studentRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const { startScheduler } = require('./services/notificationSchedulerService');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  try {
    startScheduler();
    console.log('[Notification Scheduler] Deadline reminder scheduler initialized.');
  } catch (schedErr) {
    console.error('[Notification Scheduler] Startup error:', schedErr.message);
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[Server Conflict] Port ${PORT} is already in use by another process.`);
    console.error(`[Server Solution] Stop the process using port ${PORT} or change PORT in .env.`);
    process.exit(1);
  } else {
    console.error(`[Server Fatal Error] ${error.message}`);
  }
});
