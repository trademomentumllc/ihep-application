import { sendAppointmentReminder } from './email';
import { sendAppointmentReminder as sendAppointmentReminderSMS } from './sms';
import { db } from '../db';
import { users, appointments } from '@shared/schema';
import { eq, and, gte, lte, or, sql } from 'drizzle-orm';

/**
 * Send appointment reminders for appointments within the specified time frame
 * @param hoursInAdvance How many hours before the appointment to send reminders
 */
export async function sendAppointmentReminders(hoursInAdvance = 24): Promise<void> {
  try {
    console.log(`Checking for appointments that need reminders (${hoursInAdvance} hours in advance)...`);
    
    // Validate the hours parameter to prevent injection
    const numericHours = parseFloat(String(hoursInAdvance));
    if (isNaN(numericHours)) {
      console.error('Invalid hours parameter provided:', hoursInAdvance);
      return;
    }
    
    // Use a more direct approach with Drizzle ORM
    const hoursMs = numericHours * 60 * 60 * 1000;
    const nowDate = new Date();
    const futureDate = new Date(nowDate.getTime() + hoursMs);
    
    const results = await db
      .select({
        id: appointments.id,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        type: appointments.type,
        notes: appointments.notes, 
        status: appointments.status,
        location: appointments.location,
        isVirtual: appointments.isVirtual,
        reminderSent: appointments.reminderSent,
        patientId: users.id,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
        patientEmail: users.email,
        patientPhone: users.phone
      })
      .from(appointments)
      .innerJoin(users, eq(appointments.patientId, users.id))
      .where(
        and(
          eq(appointments.reminderSent, false),
          gte(appointments.startTime, nowDate),
          lte(appointments.startTime, futureDate),
          or(
            eq(appointments.status, 'confirmed'),
            eq(appointments.status, 'pending')
          )
        )
      );
    
    // Format the results to match the expected structure
    const queryResult = {
      rows: results.map(row => ({
        id: row.id,
        start_time: row.startTime,
        end_time: row.endTime,
        type: row.type,
        notes: row.notes,
        status: row.status,
        location: row.location,
        is_virtual: row.isVirtual,
        reminder_sent: row.reminderSent,
        patient_id: row.patientId,
        patient_first_name: row.patientFirstName,
        patient_last_name: row.patientLastName,
        patient_email: row.patientEmail,
        patient_phone: row.patientPhone,
        provider_id: null,
        provider_first_name: null, 
        provider_last_name: null
      }))
    };
    
    const reminderRows = queryResult.rows;
    console.log(`Found ${reminderRows ? reminderRows.length : 0} appointments requiring reminders`);
    
    // Send reminders for each appointment
    for (const row of reminderRows || []) {
      try {
        // Extract data from the row
        const appointmentRow = row as Record<string, any>;
        const patientFirstName = appointmentRow.patient_first_name || 'Patient';
        const patientEmail = appointmentRow.patient_email;
        const patientPhone = appointmentRow.patient_phone;
        const providerName = `${appointmentRow.provider_first_name || ''} ${appointmentRow.provider_last_name || ''}`.trim();
        const appointmentId = appointmentRow.id;
        const appointmentType = appointmentRow.type || 'Healthcare';
        const appointmentLocation = appointmentRow.location || 'Our clinic';
        const isVirtual = appointmentRow.is_virtual;
        // Convert start_time to Date safely
        const startTime = appointmentRow.start_time ? new Date(appointmentRow.start_time) : new Date();
        
        // Send email reminder if patient has an email
        if (patientEmail) {
          await sendAppointmentReminder(
            patientEmail,
            patientFirstName,
            startTime,
            providerName
          );
          console.log(`✓ Email reminder sent to ${patientEmail} for appointment #${appointmentId}`);
        }
        
        // Send SMS reminder if patient has a phone number
        if (patientPhone) {
          await sendAppointmentReminderSMS(
            patientPhone,
            patientFirstName,
            startTime,
            providerName
          );
          console.log(`✓ SMS reminder sent to ${patientPhone} for appointment #${appointmentId}`);
        }
        
        // Mark appointment as having reminders sent
        if (appointmentId) {
          // Use parameterized query to prevent SQL injection
          await db
            .update(appointments)
            .set({ reminderSent: true })
            .where(eq(appointments.id, appointmentId));
          console.log(`✓ Appointment #${appointmentId} marked as reminded`);
        }
      } catch (error) {
        console.error(`Failed to send reminder for appointment #${row.id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error processing appointment reminders:', error);
  }
}

/**
 * Schedule a one-time reminder for a specific appointment
 */
export async function scheduleAppointmentReminder(appointmentId: number, minutesInAdvance = 60): Promise<void> {
  try {
    // Use parameterized query to safely get appointment details
    // Use a safer type-safe approach with the ORM
    const results = await db
      .select({
        id: appointments.id,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        type: appointments.type,
        notes: appointments.notes, 
        status: appointments.status,
        location: appointments.location,
        isVirtual: appointments.isVirtual,
        reminderSent: appointments.reminderSent,
        patientId: users.id,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
        patientEmail: users.email,
        patientPhone: users.phone
      })
      .from(appointments)
      .innerJoin(users, eq(appointments.patientId, users.id))
      .where(eq(appointments.id, appointmentId));
    
    // Format for compatibility with existing code
    const queryResult = {
      rows: results.map(row => ({
        id: row.id,
        start_time: row.startTime,
        end_time: row.endTime,
        type: row.type,
        notes: row.notes,
        status: row.status,
        location: row.location,
        is_virtual: row.isVirtual,
        reminder_sent: row.reminderSent,
        patient_id: row.patientId,
        patient_first_name: row.patientFirstName,
        patient_last_name: row.patientLastName,
        patient_email: row.patientEmail,
        patient_phone: row.patientPhone,
        provider_id: null,
        provider_first_name: null,
        provider_last_name: null,
        provider_email: null,
        provider_phone: null
      }))
    };
    
    const appointmentDetails = queryResult.rows && queryResult.rows.length > 0 ? queryResult.rows[0] : null;
    
    if (!appointmentDetails) {
      console.error(`Appointment #${appointmentId} not found for scheduling reminder`);
      return;
    }
    
    // Extract data from the row with type safety
    const appointmentRow = appointmentDetails as Record<string, any>;
    
    const patientFirstName = appointmentRow.patient_first_name || 'Patient';
    const patientEmail = appointmentRow.patient_email;
    const patientPhone = appointmentRow.patient_phone;
    const providerName = `${appointmentRow.provider_first_name || ''} ${appointmentRow.provider_last_name || ''}`.trim();
    
    // Calculate when to send the reminder
    const appointmentTime = appointmentRow.start_time ? new Date(appointmentRow.start_time) : new Date();
    const reminderTime = new Date(appointmentTime.getTime() - (minutesInAdvance * 60 * 1000));
    const now = new Date();
    
    // Calculate delay in milliseconds (if in the past, send immediately)
    const delay = Math.max(0, reminderTime.getTime() - now.getTime());
    
    if (delay === 0) {
      console.log(`Sending immediate reminder for appointment #${appointmentId}`);
      // Send email reminder if patient has an email
      if (patientEmail) {
        await sendAppointmentReminder(
          patientEmail,
          patientFirstName,
          appointmentTime,
          providerName
        );
        console.log(`✓ Immediate email reminder sent to ${patientEmail} for appointment #${appointmentId}`);
      }
      
      // Send SMS reminder if patient has a phone number
      if (patientPhone) {
        await sendAppointmentReminderSMS(
          patientPhone,
          patientFirstName,
          appointmentTime,
          providerName
        );
        console.log(`✓ Immediate SMS reminder sent to ${patientPhone} for appointment #${appointmentId}`);
      }
    } else {
      console.log(`Scheduling reminder for appointment #${appointmentId} in ${Math.round(delay / 60000)} minutes`);
      
      // Schedule the reminder using setTimeout
      setTimeout(async () => {
        // Send email reminder if patient has an email
        if (patientEmail) {
          await sendAppointmentReminder(
            patientEmail,
            patientFirstName,
            appointmentTime,
            providerName
          );
          console.log(`✓ Scheduled email reminder sent to ${patientEmail} for appointment #${appointmentId}`);
        }
        
        // Send SMS reminder if patient has a phone number
        if (patientPhone) {
          await sendAppointmentReminderSMS(
            patientPhone,
            patientFirstName,
            appointmentTime,
            providerName
          );
          console.log(`✓ Scheduled SMS reminder sent to ${patientPhone} for appointment #${appointmentId}`);
        }
      }, delay);
    }
  } catch (error) {
    console.error(`Error scheduling reminder for appointment #${appointmentId}:`, error);
  }
}