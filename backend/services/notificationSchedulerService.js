const Application = require('../models/Application');
const { createDeadlineNotification } = require('./notificationService');

/**
 * Scan active applications for deadline reminders
 */
const runDeadlineSchedulerScan = async () => {
  try {
    const now = new Date();
    const todayWindowStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Find active applications with populated scholarships
    const applications = await Application.find({
      status: { $in: ['Saved', 'Applied', 'Under Review'] }
    }).populate('scholarshipId');

    let processedCount = 0;

    for (const app of applications) {
      if (!app.studentId || !app.scholarshipId || !app.scholarshipId.deadline) {
        continue;
      }

      const scholarship = app.scholarshipId;
      if (!scholarship.isActive) continue;

      const deadline = new Date(scholarship.deadline);
      if (isNaN(deadline.getTime())) continue;

      const diffTime = deadline - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 1. Due Today (0 days remaining)
      if (diffDays === 0) {
        await createDeadlineNotification({
          studentId: app.studentId,
          scholarshipId: scholarship._id,
          scholarshipTitle: scholarship.title,
          deadline: scholarship.deadline,
          type: 'DeadlineToday',
          dateWindow: `${todayWindowStr}-today`
        });
        processedCount++;
      }
      // 2. Approaching Deadline (approx 7 days left: between 6 and 7 days)
      else if (diffDays >= 6 && diffDays <= 7) {
        await createDeadlineNotification({
          studentId: app.studentId,
          scholarshipId: scholarship._id,
          scholarshipTitle: scholarship.title,
          deadline: scholarship.deadline,
          type: 'DeadlineApproaching',
          dateWindow: `${todayWindowStr}-7day`
        });
        processedCount++;
      }
    }

    return { success: true, processedCount };
  } catch (error) {
    console.error('[Notification Scheduler] Scan error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize Background Scheduler Task
 */
let schedulerInterval = null;

const startScheduler = (intervalMs = 24 * 60 * 60 * 1000) => {
  try {
    // Run an initial scan asynchronously on startup (non-blocking)
    runDeadlineSchedulerScan().catch((err) =>
      console.error('[Notification Scheduler] Startup scan error:', err.message)
    );

    // Schedule recurring interval check
    if (!schedulerInterval) {
      schedulerInterval = setInterval(() => {
        runDeadlineSchedulerScan().catch((err) =>
          console.error('[Notification Scheduler] Recurring scan error:', err.message)
        );
      }, intervalMs);
    }
  } catch (err) {
    console.error('[Notification Scheduler] Failed to initialize scheduler:', err.message);
  }
};

const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
};

module.exports = {
  runDeadlineSchedulerScan,
  startScheduler,
  stopScheduler
};
