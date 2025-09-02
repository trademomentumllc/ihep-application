import { sendAppointmentReminders, scheduleAppointmentReminder } from './notifications';

// In-memory storage for scheduled jobs
const scheduledJobs: Record<string, NodeJS.Timeout> = {};

/**
 * Start the reminder scheduler service
 */
export function startReminderScheduler() {
  console.log('Starting reminder scheduler service...');
  
  // Schedule the daily reminder check to run every 4 hours
  const dailyReminderCheck = setInterval(async () => {
    console.log('Running scheduled reminder check...');
    await sendAppointmentReminders(24); // Send reminders for appointments in the next 24 hours
  }, 4 * 60 * 60 * 1000); // Every 4 hours
  
  // Store the reference to our interval
  scheduledJobs['dailyReminderCheck'] = dailyReminderCheck;
  
  // Run an immediate check when the server starts
  sendAppointmentReminders(24).catch(error => {
    console.error('Error in initial appointment reminder check:', error);
  });
  
  console.log('Reminder scheduler started successfully');
  return true;
}

/**
 * Schedule a reminder for a specific appointment
 */
export function scheduleReminder(appointmentId: number, reminderTime: Date) {
  const now = new Date();
  const delay = Math.max(0, reminderTime.getTime() - now.getTime());
  
  console.log(`Scheduling reminder for appointment #${appointmentId} at ${reminderTime.toISOString()}`);
  console.log(`Will execute in ${Math.round(delay / 60000)} minutes`);
  
  // Clear any existing reminder for this appointment
  clearScheduledReminder(appointmentId);
  
  // Schedule the new reminder
  const timerId = setTimeout(() => {
    console.log(`Executing scheduled reminder for appointment #${appointmentId}`);
    scheduleAppointmentReminder(appointmentId, 0).catch(error => {
      console.error(`Error in scheduled reminder for appointment #${appointmentId}:`, error);
    });
    
    // Remove the job from our tracking once executed
    delete scheduledJobs[`appointment-${appointmentId}`];
  }, delay);
  
  // Track this scheduled job
  scheduledJobs[`appointment-${appointmentId}`] = timerId;
  
  return true;
}

/**
 * Clear a scheduled reminder for a specific appointment
 */
export function clearScheduledReminder(appointmentId: number) {
  const key = `appointment-${appointmentId}`;
  
  if (scheduledJobs[key]) {
    console.log(`Clearing scheduled reminder for appointment #${appointmentId}`);
    clearTimeout(scheduledJobs[key]);
    delete scheduledJobs[key];
    return true;
  }
  
  return false;
}

/**
 * Stop all scheduled reminders (used during server shutdown)
 */
export function stopReminderScheduler() {
  console.log('Stopping reminder scheduler...');
  
  // Clear all scheduled intervals/timeouts
  Object.values(scheduledJobs).forEach(job => {
    clearTimeout(job);
  });
  
  // Reset our tracking
  Object.keys(scheduledJobs).forEach(key => {
    delete scheduledJobs[key];
  });
  
  console.log('Reminder scheduler stopped');
  return true;
}