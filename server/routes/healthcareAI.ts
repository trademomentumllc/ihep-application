/**
 * Healthcare AI Assistant API Routes
 * 
 * Provides intelligent healthcare guidance and resource recommendations
 * without giving direct medical advice
 */

import express, { Request, Response } from 'express';
import { getHealthcareGuidance, detectEmergency } from '../services/healthcareAI';
import { logAuditEvent, AuditEventType } from '../services/auditLogger';

const router = express.Router();

// Middleware for authentication
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * POST /api/healthcare-ai/guidance
 * Get healthcare guidance and resource recommendations
 */
router.post('/guidance', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    const userId = (req.user as any).id;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // First check for emergency situations
    const emergencyCheck = await detectEmergency(query);
    
    if (emergencyCheck.isEmergency) {
      // Log emergency detection
      await logAuditEvent({
        userId,
        eventType: AuditEventType.SYSTEM_EVENT,
        resourceType: 'healthcare_ai',
        resourceId: 'emergency_detection',
        action: 'emergency_detected',
        description: `Emergency situation detected: ${emergencyCheck.emergencyType}`,
        ipAddress,
        success: true,
        additionalInfo: { emergencyType: emergencyCheck.emergencyType, query }
      });

      return res.json({
        isEmergency: true,
        emergencyType: emergencyCheck.emergencyType,
        immediateActions: emergencyCheck.immediateActions,
        message: "This appears to be an emergency situation. Please follow the immediate actions below and seek emergency medical care right away.",
        recommendations: [],
        disclaimers: ["This is an emergency situation - call 911 or go to the nearest emergency room immediately"],
        urgencyLevel: 'emergency'
      });
    }

    // Get healthcare guidance
    const guidance = await getHealthcareGuidance(query, userId, conversationHistory);
    
    // Log healthcare AI interaction
    await logAuditEvent({
      userId,
      eventType: AuditEventType.SYSTEM_EVENT,
      resourceType: 'healthcare_ai',
      resourceId: 'guidance_request',
      action: 'healthcare_guidance',
      description: `Healthcare AI guidance provided for ${guidance.specialization} query`,
      ipAddress,
      success: true,
      additionalInfo: { 
        specialization: guidance.specialization,
        urgencyLevel: guidance.urgencyLevel,
        recommendationsCount: guidance.recommendations.length
      }
    });

    res.json(guidance);

  } catch (error) {
    console.error('Error providing healthcare guidance:', error);
    res.status(500).json({ 
      error: 'Failed to provide healthcare guidance',
      message: "I'm experiencing technical difficulties. Please contact a healthcare professional for assistance.",
      disclaimers: ["AI system error - please contact healthcare provider"]
    });
  }
});

/**
 * POST /api/healthcare-ai/emergency-check
 * Check if a query indicates an emergency situation
 */
router.post('/emergency-check', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const userId = (req.user as any).id;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const emergencyCheck = await detectEmergency(query);
    
    // Log emergency check
    await logAuditEvent({
      userId,
      eventType: AuditEventType.SYSTEM_EVENT,
      resourceType: 'healthcare_ai',
      resourceId: 'emergency_check',
      action: 'emergency_screening',
      description: `Emergency screening performed: ${emergencyCheck.isEmergency ? 'Emergency detected' : 'No emergency detected'}`,
      ipAddress,
      success: true,
      additionalInfo: { isEmergency: emergencyCheck.isEmergency, emergencyType: emergencyCheck.emergencyType }
    });

    res.json(emergencyCheck);

  } catch (error) {
    console.error('Error in emergency check:', error);
    res.status(500).json({ 
      error: 'Failed to perform emergency check',
      isEmergency: false,
      immediateActions: ['If experiencing severe symptoms, contact emergency services immediately']
    });
  }
});

/**
 * GET /api/healthcare-ai/specializations
 * Get available healthcare specialization areas
 */
router.get('/specializations', isAuthenticated, (req: Request, res: Response) => {
  const specializations = {
    mental_health: {
      name: 'Mental Health',
      description: 'Anxiety, depression, stress, therapy, and emotional wellness support',
      keywords: ['anxiety', 'depression', 'stress', 'mood', 'therapy', 'counseling']
    },
    chronic_conditions: {
      name: 'Chronic Conditions',
      description: 'Diabetes, hypertension, heart disease, and long-term health management',
      keywords: ['diabetes', 'hypertension', 'heart disease', 'chronic pain']
    },
    preventive_care: {
      name: 'Preventive Care',
      description: 'Health screenings, vaccinations, and wellness maintenance',
      keywords: ['screening', 'prevention', 'wellness', 'checkup', 'vaccination']
    },
    nutrition_fitness: {
      name: 'Nutrition & Fitness',
      description: 'Diet, exercise, weight management, and healthy lifestyle guidance',
      keywords: ['nutrition', 'diet', 'weight', 'exercise', 'fitness']
    },
    substance_abuse: {
      name: 'Substance Abuse Recovery',
      description: 'Addiction recovery, support groups, and rehabilitation resources',
      keywords: ['addiction', 'substance abuse', 'recovery', 'detox']
    },
    elderly_care: {
      name: 'Senior Care',
      description: 'Geriatric health, aging-related concerns, and elder care resources',
      keywords: ['senior', 'elderly', 'geriatric', 'aging']
    }
  };

  res.json(specializations);
});

/**
 * POST /api/healthcare-ai/feedback
 * Collect user feedback on AI responses
 */
router.post('/feedback', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { interactionId, rating, feedback, wasHelpful } = req.body;
    const userId = (req.user as any).id;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    
    // Log feedback for continuous improvement
    await logAuditEvent({
      userId,
      eventType: AuditEventType.SYSTEM_EVENT,
      resourceType: 'healthcare_ai',
      resourceId: 'user_feedback',
      action: 'feedback_received',
      description: `User feedback received for healthcare AI interaction`,
      ipAddress,
      success: true,
      additionalInfo: { 
        interactionId,
        rating,
        feedback,
        wasHelpful
      }
    });

    res.json({ 
      success: true, 
      message: 'Thank you for your feedback. It helps us improve our guidance system.' 
    });

  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ error: 'Failed to process feedback' });
  }
});

export default router;