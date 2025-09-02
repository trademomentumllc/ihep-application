/**
 * Twilio Healthcare Routes
 * 
 * API endpoints for enhanced Twilio healthcare services:
 * - Twilio Engage for Healthcare - Patient engagement and medication adherence
 * - Twilio Verify for Healthcare - Enhanced verification
 * - Twilio Video for Telehealth - Virtual appointments
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import * as twilioHealthcare from '../services/twilioHealthcare';
import * as gamificationService from '../services/gamification';

const router = express.Router();

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Patient role check middleware
const isPatient = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // @ts-ignore
  if (req.user.role !== 'patient') {
    return res.status(403).json({ message: "Forbidden: Patient access required" });
  }
  
  next();
};

// Provider role check middleware
const isProvider = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // @ts-ignore
  if (req.user.role !== 'provider') {
    return res.status(403).json({ message: "Forbidden: Provider access required" });
  }
  
  next();
};

// Admin role check middleware
const isAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // @ts-ignore
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
};

// Schema validation for medication adherence reminder
const medicationReminderSchema = z.object({
  phoneNumber: z.string(),
  patientName: z.string(),
  medicationName: z.string(),
  dosage: z.string(),
  scheduledTime: z.string()
});

// Schema validation for appointment reminder
const appointmentReminderSchema = z.object({
  phoneNumber: z.string(),
  patientName: z.string(),
  providerName: z.string(),
  appointmentId: z.number(),
  appointmentDate: z.string().transform(date => new Date(date)),
  appointmentType: z.string(),
  location: z.string()
});

// Schema validation for health education reminder
const educationReminderSchema = z.object({
  phoneNumber: z.string(),
  patientName: z.string(),
  contentId: z.number(),
  contentTitle: z.string(),
  contentType: z.string(),
  contentUrl: z.string()
});

// Schema validation for enhanced verification
const enhancedVerificationSchema = z.object({
  phoneNumber: z.string(),
  channel: z.enum(['sms', 'call', 'email']).optional().default('sms'),
  email: z.string().email().optional()
});

// Schema validation for telehealth session creation
const telehealthSessionSchema = z.object({
  patientId: z.number(),
  providerId: z.number(),
  appointmentId: z.number().optional(),
  scheduledStartTime: z.string().optional().transform(date => date ? new Date(date) : undefined),
  enableRecording: z.boolean().optional().default(false)
});

// Schema validation for telehealth token generation
const telehealthTokenSchema = z.object({
  sessionId: z.string(),
  userType: z.enum(['patient', 'provider']),
  userName: z.string()
});

// Schema validation for ending telehealth session
const endTelehealthSchema = z.object({
  sessionId: z.string(),
  endedBy: z.enum(['patient', 'provider', 'system']),
  endReason: z.string().optional()
});

// ----------------------
// TWILIO ENGAGE ENDPOINTS
// ----------------------

/**
 * POST /api/twilio-healthcare/engage/medication-reminder
 * Send medication adherence reminder
 */
router.post('/engage/medication-reminder', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const validatedData = medicationReminderSchema.parse(req.body);
    
    const result = await twilioHealthcare.sendMedicationAdherenceReminder(
      userId,
      validatedData.phoneNumber,
      validatedData.patientName,
      validatedData.medicationName,
      validatedData.dosage,
      validatedData.scheduledTime
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    
    console.error('Error sending medication reminder:', error);
    res.status(500).json({ 
      message: "Failed to send medication reminder", 
      error: (error as Error).message 
    });
  }
});

/**
 * POST /api/twilio-healthcare/engage/appointment-reminder
 * Send smart appointment reminder
 */
router.post('/engage/appointment-reminder', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const validatedData = appointmentReminderSchema.parse(req.body);
    
    const result = await twilioHealthcare.sendSmartAppointmentReminder(
      userId,
      validatedData.phoneNumber,
      validatedData.patientName,
      validatedData.providerName,
      validatedData.appointmentId,
      validatedData.appointmentDate,
      validatedData.appointmentType,
      validatedData.location
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    
    console.error('Error sending appointment reminder:', error);
    res.status(500).json({ 
      message: "Failed to send appointment reminder", 
      error: (error as Error).message 
    });
  }
});

/**
 * POST /api/twilio-healthcare/engage/education-reminder
 * Send health education content reminder
 */
router.post('/engage/education-reminder', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const validatedData = educationReminderSchema.parse(req.body);
    
    const result = await twilioHealthcare.sendHealthEducationReminder(
      userId,
      validatedData.phoneNumber,
      validatedData.patientName,
      validatedData.contentId,
      validatedData.contentTitle,
      validatedData.contentType,
      validatedData.contentUrl
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    
    console.error('Error sending education reminder:', error);
    res.status(500).json({ 
      message: "Failed to send education reminder", 
      error: (error as Error).message 
    });
  }
});

/**
 * POST /api/twilio-healthcare/engage/webhook
 * Webhook for SMS responses (medication adherence, appointment confirmations)
 */
router.post('/engage/webhook', express.urlencoded({ extended: false }), async (req: Request, res: Response) => {
  try {
    const { Body, From, To } = req.body;
    const { userId, trackingId, type, appointmentId, contentId } = req.query;
    
    console.log(`[SMS WEBHOOK] From: ${From}, Body: ${Body}, Type: ${type}`);
    
    // Ensure we have required parameters
    if (!userId || !trackingId || !type) {
      return res.status(400).json({
        message: "Missing required parameters"
      });
    }
    
    // Process different types of responses
    if (type === 'medication-adherence') {
      const result = await twilioHealthcare.processMedicationAdherenceResponse(
        Number(userId),
        trackingId as string,
        Body
      );
      
      if (result.success && result.pointsAwarded) {
        // Record activity in gamification system to award points
        // This would call our gamification service
      }
      
      // Respond with TwiML
      res.setHeader('Content-Type', 'text/xml');
      res.send(`
        <Response>
          <Message>Thank you for confirming your medication. ${result.pointsAwarded ? `You've earned ${result.pointsAwarded} points!` : ''}</Message>
        </Response>
      `);
    } else if (type === 'appointment') {
      const result = await twilioHealthcare.processAppointmentResponse(
        Number(userId),
        Number(appointmentId),
        trackingId as string,
        Body
      );
      
      if (result.success) {
        if (result.action === 'confirmed' && result.pointsAwarded) {
          // Record activity in gamification system to award points
        }
        
        // Respond with TwiML based on action
        res.setHeader('Content-Type', 'text/xml');
        
        if (result.action === 'confirmed') {
          res.send(`
            <Response>
              <Message>Thank you for confirming your appointment. ${result.pointsAwarded ? `You've earned ${result.pointsAwarded} points!` : ''}</Message>
            </Response>
          `);
        } else if (result.action === 'reschedule') {
          res.send(`
            <Response>
              <Message>We've received your request to reschedule. Our team will contact you shortly to find a new time.</Message>
            </Response>
          `);
        } else if (result.action === 'cancelled') {
          res.send(`
            <Response>
              <Message>Your appointment has been cancelled. If this was a mistake, please call our office.</Message>
            </Response>
          `);
        }
      } else {
        // Unrecognized response
        res.setHeader('Content-Type', 'text/xml');
        res.send(`
          <Response>
            <Message>Sorry, we couldn't process your response. Please call our office for assistance.</Message>
          </Response>
        `);
      }
    } else {
      // Unrecognized message type
      res.setHeader('Content-Type', 'text/xml');
      res.send(`
        <Response>
          <Message>Thank you for your message. If you need assistance, please call our office.</Message>
        </Response>
      `);
    }
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    
    // Return TwiML response even in case of error
    res.setHeader('Content-Type', 'text/xml');
    res.send(`
      <Response>
        <Message>We're sorry, but we encountered an error processing your message. Please call our office for assistance.</Message>
      </Response>
    `);
  }
});

// -------------------------
// TWILIO VERIFY ENDPOINTS
// -------------------------

/**
 * POST /api/twilio-healthcare/verify/enhanced
 * Start enhanced healthcare identity verification
 */
router.post('/verify/enhanced', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const validatedData = enhancedVerificationSchema.parse(req.body);
    
    const result = await twilioHealthcare.initiateEnhancedVerification(
      validatedData.phoneNumber,
      userId,
      validatedData.channel,
      validatedData.email
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    
    console.error('Error initiating enhanced verification:', error);
    res.status(500).json({ 
      message: "Failed to start enhanced verification", 
      error: (error as Error).message 
    });
  }
});

/**
 * POST /api/twilio-healthcare/verify/multi-factor
 * Start multi-factor authentication for PHI access
 */
router.post('/verify/multi-factor', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { phoneNumber, email } = req.body;
    
    if (!phoneNumber || !email) {
      return res.status(400).json({
        message: "Phone number and email are required"
      });
    }
    
    const result = await twilioHealthcare.initiateMultiFactorAuth(
      userId,
      phoneNumber,
      email
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error initiating multi-factor authentication:', error);
    res.status(500).json({ 
      message: "Failed to start multi-factor authentication", 
      error: (error as Error).message 
    });
  }
});

// -------------------------
// TWILIO VIDEO ENDPOINTS
// -------------------------

/**
 * POST /api/twilio-healthcare/telehealth/create-session
 * Create a new telehealth session
 */
router.post('/telehealth/create-session', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validatedData = telehealthSessionSchema.parse(req.body);
    
    const result = await twilioHealthcare.createTelehealthSession(
      validatedData.patientId,
      validatedData.providerId,
      validatedData.appointmentId,
      validatedData.scheduledStartTime,
      validatedData.enableRecording
    );
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    
    console.error('Error creating telehealth session:', error);
    res.status(500).json({ 
      message: "Failed to create telehealth session", 
      error: (error as Error).message 
    });
  }
});

/**
 * POST /api/twilio-healthcare/telehealth/token
 * Generate access token for telehealth session
 */
router.post('/telehealth/token', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const validatedData = telehealthTokenSchema.parse(req.body);
    
    const result = await twilioHealthcare.generateTelehealthToken(
      validatedData.sessionId,
      userId,
      validatedData.userType,
      validatedData.userName
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    
    console.error('Error generating telehealth token:', error);
    res.status(500).json({ 
      message: "Failed to generate telehealth token", 
      error: (error as Error).message 
    });
  }
});

/**
 * POST /api/twilio-healthcare/telehealth/end-session
 * End a telehealth session
 */
router.post('/telehealth/end-session', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validatedData = endTelehealthSchema.parse(req.body);
    
    const result = await twilioHealthcare.endTelehealthSession(
      validatedData.sessionId,
      validatedData.endedBy,
      validatedData.endReason
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    
    console.error('Error ending telehealth session:', error);
    res.status(500).json({ 
      message: "Failed to end telehealth session", 
      error: (error as Error).message 
    });
  }
});

export default router;