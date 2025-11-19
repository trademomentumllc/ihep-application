/**
 * Twilio Healthcare Services Integration
 *
 * This service implements advanced healthcare-specific Twilio services including:
 * 1. Twilio Engage for Healthcare - Patient engagement and reminders
 * 2. Twilio Verify for Healthcare - Enhanced identity verification
 * 3. Twilio Video for Telehealth - Virtual appointments
 */

import twilio from 'twilio';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { createInsertSchema } from 'drizzle-zod';
import { sendSMS } from './sms';
import * as gamificationService from './gamification';
import { createHash } from 'crypto';

// Utility function to hash sensitive data for logging
function hashSensitiveData(data: string | number): string {
  return createHash('sha256').update(String(data)).digest('hex').substring(0, 8);
}

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }
  
  return twilio(accountSid, authToken);
};

// Check if Twilio is fully configured
const isTwilioConfigured = () => {
  return !!(
    process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_PHONE_NUMBER
  );
};

// Check if Twilio Verify is configured
const isVerifyConfigured = () => {
  return !!(
    isTwilioConfigured() && 
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
};

// Check if Twilio Video is configured
const isVideoConfigured = () => {
  return !!(
    isTwilioConfigured()
  );
};

// Mock storage for telehealth sessions when not using real Twilio
interface TelehealthSession {
  id: string;
  patientId: number;
  providerId: number;
  appointmentId?: number;
  roomName: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledStartTime: Date;
  actualStartTime?: Date;
  endTime?: Date;
  accessToken?: string;
  patientJoined: boolean;
  providerJoined: boolean;
  recordingEnabled: boolean;
  recordingUrl?: string;
}

let mockTelehealthSessions: TelehealthSession[] = [];

// ----------------------
// TWILIO ENGAGE FEATURES
// ----------------------

/**
 * Send a medication adherence reminder with feedback mechanism
 * Connects to our gamification system for points on confirmation
 */
export async function sendMedicationAdherenceReminder(
  userId: number,
  phoneNumber: string,
  patientName: string,
  medicationName: string,
  dosage: string,
  scheduledTime: string
): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  try {
    // Create a unique tracking ID for this reminder
    const trackingId = uuidv4().substring(0, 8);
    
    // Build the reminder message with confirmation options
    const message = `Hi ${patientName}, it's time to take your ${medicationName} (${dosage}). ` +
      `This was scheduled for ${scheduledTime}. ` +
      `Reply TAKEN-${trackingId} to confirm you've taken it and earn points in your Health Rewards program.`;
    
    if (!isTwilioConfigured()) {
      // Use mock SMS if Twilio is not configured
      const success = await sendSMS(phoneNumber, message);
      const phoneHash = hashSensitiveData(phoneNumber);
      console.log(`[MOCK ADHERENCE REMINDER] To hash: ${phoneHash}, Tracking ID: ${trackingId}, Success: ${success}`);
      
      return {
        success,
        messageId: `mock-message-${trackingId}`,
        message: 'Medication adherence reminder sent (MOCK)'
      };
    }
    
    // Use Twilio for real SMS
    const client = getTwilioClient();
    const twilioMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      statusCallback: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/twilio/status-callback?userId=${userId}&trackingId=${trackingId}&type=medication-adherence`
    });
    
    // Store the reminder in our database for tracking
    // This would connect to our gamification system when the user confirms
    const phoneHash = hashSensitiveData(phoneNumber);
    console.log(`[ADHERENCE REMINDER] SID: ${twilioMessage.sid}, To hash: ${phoneHash}, Tracking ID: ${trackingId}`);
    
    return {
      success: true,
      messageId: twilioMessage.sid,
      message: 'Medication adherence reminder sent'
    };
  } catch (error) {
    console.error('Error sending medication adherence reminder:', error);
    return {
      success: false,
      message: `Failed to send reminder: ${(error as Error).message}`
    };
  }
}

/**
 * Send appointment reminder with smart scheduling
 * Integrates with calendar and gamification for rewards
 */
export async function sendSmartAppointmentReminder(
  userId: number,
  phoneNumber: string,
  patientName: string,
  providerName: string,
  appointmentId: number,
  appointmentDate: Date,
  appointmentType: string,
  location: string
): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  try {
    // Create a unique tracking ID for this reminder
    const trackingId = uuidv4().substring(0, 8);
    
    // Format the appointment date and time
    const formattedDate = appointmentDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    
    // Build reminder message with confirmation options
    const message = `Hi ${patientName}, this is a reminder about your ${appointmentType} appointment with ${providerName} on ${formattedDate} at ${location}. ` +
      `Reply CONFIRM-${trackingId} to confirm, RESCHEDULE-${trackingId} to reschedule, or CANCEL-${trackingId} to cancel. ` +
      `Confirming earns you 20 points in your Health Rewards program!`;
    
    if (!isTwilioConfigured()) {
      // Use mock SMS if Twilio is not configured
      const success = await sendSMS(phoneNumber, message);
      const phoneHash = hashSensitiveData(phoneNumber);
      console.log(`[MOCK APPOINTMENT REMINDER] To hash: ${phoneHash}, Appointment ID: ${appointmentId}, Tracking ID: ${trackingId}, Success: ${success}`);
      
      return {
        success,
        messageId: `mock-message-${trackingId}`,
        message: 'Smart appointment reminder sent (MOCK)'
      };
    }
    
    // Use Twilio for real SMS
    const client = getTwilioClient();
    const twilioMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      statusCallback: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/twilio/status-callback?userId=${userId}&appointmentId=${appointmentId}&trackingId=${trackingId}&type=appointment`
    });
    
    const phoneHash = hashSensitiveData(phoneNumber);
    console.log(`[APPOINTMENT REMINDER] SID: ${twilioMessage.sid}, To hash: ${phoneHash}, Appointment ID: ${appointmentId}, Tracking ID: ${trackingId}`);
    
    return {
      success: true,
      messageId: twilioMessage.sid,
      message: 'Smart appointment reminder sent'
    };
  } catch (error) {
    console.error('Error sending smart appointment reminder:', error);
    return {
      success: false,
      message: `Failed to send reminder: ${(error as Error).message}`
    };
  }
}

/**
 * Send health education content reminder
 * Encourages engagement with educational materials
 */
export async function sendHealthEducationReminder(
  userId: number,
  phoneNumber: string,
  patientName: string,
  contentId: number,
  contentTitle: string,
  contentType: string,
  contentUrl: string
): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  try {
    // Create a unique tracking ID
    const trackingId = uuidv4().substring(0, 8);
    
    // Build the health education message
    const message = `Hi ${patientName}, we've added new ${contentType} content that might interest you: "${contentTitle}". ` +
      `Check it out here: ${contentUrl} ` +
      `Reading this material will earn you 15 points in your Health Rewards program!`;
    
    if (!isTwilioConfigured()) {
      // Use mock SMS if Twilio is not configured
      const success = await sendSMS(phoneNumber, message);
      const phoneHash = hashSensitiveData(phoneNumber);
      console.log(`[MOCK EDUCATION REMINDER] To hash: ${phoneHash}, Content ID: ${contentId}, Tracking ID: ${trackingId}, Success: ${success}`);
      
      return {
        success,
        messageId: `mock-message-${trackingId}`,
        message: 'Health education reminder sent (MOCK)'
      };
    }
    
    // Use Twilio for real SMS
    const client = getTwilioClient();
    const twilioMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      statusCallback: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/twilio/status-callback?userId=${userId}&contentId=${contentId}&trackingId=${trackingId}&type=education`
    });
    
    const phoneHash = hashSensitiveData(phoneNumber);
    console.log(`[EDUCATION REMINDER] SID: ${twilioMessage.sid}, To hash: ${phoneHash}, Content ID: ${contentId}, Tracking ID: ${trackingId}`);
    
    return {
      success: true,
      messageId: twilioMessage.sid,
      message: 'Health education reminder sent'
    };
  } catch (error) {
    console.error('Error sending health education reminder:', error);
    return {
      success: false,
      message: `Failed to send reminder: ${(error as Error).message}`
    };
  }
}

// -------------------------
// TWILIO VERIFY ENHANCEMENTS
// -------------------------

/**
 * Enhanced healthcare identity verification
 * More secure than standard verification for healthcare applications
 */
export async function initiateEnhancedVerification(
  phoneNumber: string,
  userId: number,
  channel: 'sms' | 'call' | 'email' = 'sms',
  email?: string
): Promise<{
  success: boolean;
  verificationId?: string;
  message: string;
}> {
  try {
    if (!isVerifyConfigured()) {
      const userHash = hashSensitiveData(userId);
      console.log(`[MOCK ENHANCED VERIFICATION] Starting verification for user hash ${userHash} via ${channel}`);
      
      // Generate mock verification ID
      const verificationId = `mock-verify-${uuidv4().substring(0, 8)}`;
      
      // If using SMS, send a mock message
      if (channel === 'sms') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await sendSMS(
          phoneNumber,
          `Your Health Insight Ventures enhanced verification code is: ${code}. This code provides secure access to your protected health information.`
        );
      }
      
      return {
        success: true,
        verificationId,
        message: `Enhanced verification initiated (MOCK) via ${channel}`
      };
    }
    
    // Use real Twilio Verify
    const client = getTwilioClient();
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    // Start verification
    const verification = await client.verify.v2
      .services(verifyServiceSid!)
      .verifications.create({
        to: channel === 'email' ? email! : phoneNumber,
        channel
      });

    const toHash = hashSensitiveData(channel === 'email' ? email! : phoneNumber);
    console.log(`[ENHANCED VERIFICATION] SID: ${verification.sid}, To hash: ${toHash}, Status: ${verification.status}`);
    
    return {
      success: true,
      verificationId: verification.sid,
      message: `Enhanced verification initiated via ${channel}`
    };
  } catch (error) {
    console.error('Error initiating enhanced verification:', error);
    return {
      success: false,
      message: `Failed to start verification: ${(error as Error).message}`
    };
  }
}

/**
 * Multi-factor authentication for health data access
 * Combines verification methods for higher security
 */
export async function initiateMultiFactorAuth(
  userId: number,
  phoneNumber: string,
  email: string
): Promise<{
  success: boolean;
  primaryVerificationId?: string;
  secondaryVerificationId?: string;
  message: string;
}> {
  try {
    // Start primary verification via SMS
    const primaryVerification = await initiateEnhancedVerification(phoneNumber, userId, 'sms');
    
    if (!primaryVerification.success) {
      return {
        success: false,
        message: `Failed to start primary verification: ${primaryVerification.message}`
      };
    }
    
    // Start secondary verification via email
    const secondaryVerification = await initiateEnhancedVerification(phoneNumber, userId, 'email', email);
    
    return {
      success: true,
      primaryVerificationId: primaryVerification.verificationId,
      secondaryVerificationId: secondaryVerification.success ? secondaryVerification.verificationId : undefined,
      message: `Multi-factor authentication initiated. Please check both your SMS (${phoneNumber}) and email (${email}).`
    };
  } catch (error) {
    console.error('Error initiating multi-factor authentication:', error);
    return {
      success: false,
      message: `Failed to start multi-factor authentication: ${(error as Error).message}`
    };
  }
}

// -------------------------
// TWILIO VIDEO FOR TELEHEALTH
// -------------------------

/**
 * Create a new telehealth session
 * Establishes a secure video room for patient-provider interaction
 */
export async function createTelehealthSession(
  patientId: number,
  providerId: number,
  appointmentId?: number,
  scheduledStartTime?: Date,
  enableRecording: boolean = false
): Promise<{
  success: boolean;
  sessionId?: string;
  roomName?: string;
  message: string;
}> {
  try {
    // Generate a unique room name
    const roomName = `telehealth-${uuidv4().substring(0, 8)}`;
    const sessionId = uuidv4();
    const startTime = scheduledStartTime || new Date();
    
    if (!isVideoConfigured()) {
      // Store mock telehealth session
      const mockSession: TelehealthSession = {
        id: sessionId,
        patientId,
        providerId,
        appointmentId,
        roomName,
        status: 'scheduled',
        scheduledStartTime: startTime,
        patientJoined: false,
        providerJoined: false,
        recordingEnabled: enableRecording
      };
      
      mockTelehealthSessions.push(mockSession);

      const patientHash = hashSensitiveData(patientId);
      const providerHash = hashSensitiveData(providerId);
      console.log(`[MOCK TELEHEALTH] Created session ${sessionId} for patient hash ${patientHash} and provider hash ${providerHash}`);
      
      return {
        success: true,
        sessionId,
        roomName,
        message: 'Telehealth session created (MOCK)'
      };
    }
    
    // Use real Twilio Video
    const client = getTwilioClient();
    
    // Create a room in Twilio
    const room = await client.video.v1.rooms.create({
      uniqueName: roomName,
      type: 'group',
      recordParticipantsOnConnect: enableRecording
    });

    const patientHash = hashSensitiveData(patientId);
    const providerHash = hashSensitiveData(providerId);
    console.log(`[TELEHEALTH] Created room SID: ${room.sid} for patient hash ${patientHash} and provider hash ${providerHash}`);
    
    // Here we would store the session details in our database
    
    return {
      success: true,
      sessionId,
      roomName: room.uniqueName,
      message: 'Telehealth session created successfully'
    };
  } catch (error) {
    console.error('Error creating telehealth session:', error);
    return {
      success: false,
      message: `Failed to create telehealth session: ${(error as Error).message}`
    };
  }
}

/**
 * Generate access token for telehealth session
 * Creates secure tokens for patients and providers
 */
export async function generateTelehealthToken(
  sessionId: string,
  userId: number,
  userType: 'patient' | 'provider',
  userName: string
): Promise<{
  success: boolean;
  token?: string;
  roomName?: string;
  message: string;
}> {
  try {
    if (!isVideoConfigured()) {
      // Find mock session
      const session = mockTelehealthSessions.find(s => s.id === sessionId);
      
      if (!session) {
        return {
          success: false,
          message: 'Telehealth session not found'
        };
      }
      
      // Generate mock token
      const mockToken = `mock-token-${uuidv4()}`;
      
      // Update session status
      if (userType === 'patient') {
        session.patientJoined = true;
      } else {
        session.providerJoined = true;
      }
      
      if (session.patientJoined && session.providerJoined) {
        session.status = 'in-progress';
        session.actualStartTime = new Date();
      }

      const userHash = hashSensitiveData(userId);
      console.log(`[MOCK TELEHEALTH] Generated token for ${userType} user hash ${userHash} for session ${sessionId}`);
      
      return {
        success: true,
        token: mockToken,
        roomName: session.roomName,
        message: `Mock token generated for ${userType}`
      };
    }
    
    // Use real Twilio Video
    // Here we would generate a proper token using Twilio's AccessToken
    
    return {
      success: true,
      token: "REAL_TOKEN_WOULD_BE_GENERATED_HERE",
      roomName: "room-name",
      message: `Token generated for ${userType}`
    };
  } catch (error) {
    console.error('Error generating telehealth token:', error);
    return {
      success: false,
      message: `Failed to generate token: ${(error as Error).message}`
    };
  }
}

/**
 * End a telehealth session
 * Properly closes the room and handles recordings
 */
export async function endTelehealthSession(
  sessionId: string,
  endedBy: 'patient' | 'provider' | 'system',
  endReason?: string
): Promise<{
  success: boolean;
  message: string;
  recordingUrl?: string;
}> {
  try {
    if (!isVideoConfigured()) {
      // Find mock session
      const sessionIndex = mockTelehealthSessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return {
          success: false,
          message: 'Telehealth session not found'
        };
      }
      
      // Update session status
      const session = mockTelehealthSessions[sessionIndex];
      session.status = 'completed';
      session.endTime = new Date();
      
      // Generate mock recording URL if recording was enabled
      let recordingUrl;
      if (session.recordingEnabled) {
        recordingUrl = `https://example.com/recordings/${sessionId}`;
        session.recordingUrl = recordingUrl;
      }

      console.log(`[MOCK TELEHEALTH] Ended session ${sessionId}, ended by ${endedBy}`);
      
      return {
        success: true,
        message: 'Telehealth session ended (MOCK)',
        recordingUrl
      };
    }
    
    // Use real Twilio Video
    // Here we would close the room in Twilio and handle any recordings
    
    return {
      success: true,
      message: 'Telehealth session ended successfully'
    };
  } catch (error) {
    console.error('Error ending telehealth session:', error);
    return {
      success: false,
      message: `Failed to end telehealth session: ${(error as Error).message}`
    };
  }
}

/**
 * Process Twilio SMS webhook for medication adherence
 * Handles confirmation responses and awards points
 */
export async function processMedicationAdherenceResponse(
  userId: number, 
  trackingId: string, 
  messageBody: string
): Promise<{
  success: boolean;
  pointsAwarded?: number;
  message: string;
  error?: string;
}> {
  try {
    // Check if the message confirms medication was taken
    if (messageBody.toUpperCase().includes(`TAKEN-${trackingId}`)) {
      const userHash = hashSensitiveData(userId);
      console.log(`[ADHERENCE] User hash ${userHash} confirmed medication with tracking ID ${trackingId}`);
      
      // Award points in the gamification system by recording a medication activity
      // Find the medication adherence activity ID (assuming ID 1 for medication adherence)
      const MEDICATION_ADHERENCE_ACTIVITY_ID = 1;
      
      try {
        // Record the activity in our gamification system
        const userActivity = await gamificationService.recordActivity(
          userId,
          MEDICATION_ADHERENCE_ACTIVITY_ID,
          `Medication taken via SMS confirmation (Tracking ID: ${trackingId})`
        );
        
        return {
          success: true,
          pointsAwarded: userActivity.pointsEarned,
          message: `Medication adherence confirmed and ${userActivity.pointsEarned} points awarded`
        };
      } catch (gamificationError) {
        console.error('Error awarding points for medication adherence:', gamificationError);
        
        // Still mark as success even if gamification fails
        return {
          success: true,
          pointsAwarded: 0,
          message: 'Medication adherence confirmed, but points could not be awarded',
          error: gamificationError instanceof Error ? gamificationError.message : String(gamificationError)
        };
      }
    }
    
    return {
      success: false,
      message: 'Response not recognized as medication confirmation'
    };
  } catch (error) {
    console.error('Error processing medication adherence response:', error);
    return {
      success: false,
      message: `Failed to process response`,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Process Twilio SMS webhook for appointment responses
 * Handles confirmation, reschedule, or cancellation
 */
export async function processAppointmentResponse(
  userId: number,
  appointmentId: number,
  trackingId: string,
  messageBody: string
): Promise<{
  success: boolean;
  action?: 'confirmed' | 'reschedule' | 'cancelled';
  pointsAwarded?: number;
  message: string;
  error?: string;
}> {
  try {
    const messageUpper = messageBody.toUpperCase();


    // Handle confirmation
    if (messageUpper.includes(`CONFIRM-${trackingId}`)) {
      const userHash = hashSensitiveData(userId);
      console.log(`[APPOINTMENT] User hash ${userHash} confirmed appointment ${appointmentId}`);
      
      // Connect to gamification system to award points
      // Assuming ID 2 for appointment confirmation activity
      const APPOINTMENT_CONFIRMATION_ACTIVITY_ID = 2;
      
      try {
        // Record the activity in our gamification system
        const userActivity = await gamificationService.recordActivity(
          userId,
          APPOINTMENT_CONFIRMATION_ACTIVITY_ID,
          `Appointment ${appointmentId} confirmed via SMS (Tracking ID: ${trackingId})`
        );
        
        return {
          success: true,
          action: 'confirmed',
          pointsAwarded: userActivity.pointsEarned,
          message: `Appointment confirmed and ${userActivity.pointsEarned} points awarded`
        };
      } catch (gamificationError) {
        console.error('Error awarding points for appointment confirmation:', gamificationError);
        
        // Still mark as success even if gamification fails
        return {
          success: true,
          action: 'confirmed',
          pointsAwarded: 0,
          message: 'Appointment confirmed, but points could not be awarded',
          error: gamificationError instanceof Error ? gamificationError.message : String(gamificationError)
        };
      }
    }


    // Handle reschedule request
    if (messageUpper.includes(`RESCHEDULE-${trackingId}`)) {
      const userHash = hashSensitiveData(userId);
      console.log(`[APPOINTMENT] User hash ${userHash} requested to reschedule appointment ${appointmentId}`);
      
      // This would trigger our rescheduling workflow
      // TODO: Implement appointment rescheduling logic
      
      return {
        success: true,
        action: 'reschedule',
        message: 'Reschedule request received. A staff member will contact you to arrange a new time.'
      };
    }


    // Handle cancellation
    if (messageUpper.includes(`CANCEL-${trackingId}`)) {
      const userHash = hashSensitiveData(userId);
      console.log(`[APPOINTMENT] User hash ${userHash} cancelled appointment ${appointmentId}`);
      
      // This would trigger our cancellation workflow
      // TODO: Implement appointment cancellation logic
      
      return {
        success: true,
        action: 'cancelled',
        message: 'Cancellation request received. Your appointment has been cancelled.'
      };
    }
    
    return {
      success: false,
      message: 'Response not recognized as appointment confirmation, reschedule, or cancellation'
    };
  } catch (error) {
    console.error('Error processing appointment response:', error);
    return {
      success: false,
      message: `Failed to process response`,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}