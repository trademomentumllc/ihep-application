import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { startPhoneVerification, checkVerificationCode } from '../services/sms';

const router = Router();

// Schema for starting verification
const startVerificationSchema = z.object({
  phoneNumber: z.string().min(10).max(15).refine(
    (val) => /^\+?[1-9]\d{9,14}$/.test(val),
    { message: "Phone number must be in E.164 format (e.g., +12125551234)" }
  ),
  channel: z.enum(['sms', 'call']).default('sms')
});

// Schema for checking verification code
const checkVerificationSchema = z.object({
  phoneNumber: z.string().min(10).max(15).refine(
    (val) => /^\+?[1-9]\d{9,14}$/.test(val),
    { message: "Phone number must be in E.164 format (e.g., +12125551234)" }
  ),
  code: z.string().min(4).max(10)
});

// Check Twilio Verify configuration status
router.get('/config-status', (req: Request, res: Response) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  
  const isTwilioConfigured = Boolean(accountSid && authToken);
  const isVerifyConfigured = Boolean(verifyServiceSid);
  
  res.json({
    twilio: {
      configured: isTwilioConfigured,
      accountSid: accountSid ? `${accountSid.substring(0, 2)}...${accountSid.substring(accountSid.length - 4)}` : null
    },
    verify: {
      configured: isVerifyConfigured,
      serviceSid: verifyServiceSid ? `${verifyServiceSid.substring(0, 2)}...${verifyServiceSid.substring(verifyServiceSid.length - 4)}` : null
    }
  });
});

// Start phone verification
router.post('/start', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = startVerificationSchema.parse(req.body);
    
    // Start verification
    const result = await startPhoneVerification(
      validatedData.phoneNumber, 
      validatedData.channel
    );
    
    if (result.success) {
      return res.json({
        success: true,
        status: result.status,
        message: result.message,
        sid: result.sid
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid data',
        errors: error.errors 
      });
    }
    
    console.error('Error starting phone verification:', error);
    return res.status(500).json({ 
      success: false,
      message: `Failed to start verification: ${(error as Error).message}` 
    });
  }
});

// Check verification code
router.post('/check', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = checkVerificationSchema.parse(req.body);
    
    // Check verification code
    const result = await checkVerificationCode(
      validatedData.phoneNumber,
      validatedData.code
    );
    
    return res.json({
      success: result.success,
      status: result.status,
      message: result.message,
      valid: result.valid
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid data',
        errors: error.errors 
      });
    }
    
    console.error('Error checking verification code:', error);
    return res.status(500).json({ 
      success: false,
      message: `Failed to check verification code: ${(error as Error).message}` 
    });
  }
});

// Prepare for SIM-based verification (upcoming feature)
router.post('/sim-check', (req: Request, res: Response) => {
  // This is a placeholder for the upcoming SIM-based verification feature
  // When Twilio's SIM-based verification is out of beta, we'll implement it here
  
  res.status(200).json({
    success: false,
    message: "SIM-based verification is coming soon! This feature is currently in beta at Twilio.",
    featureStatus: "beta"
  });
});

export default router;