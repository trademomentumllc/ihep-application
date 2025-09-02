import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendSMS } from '../services/sms';

const router = Router();

// Schema for SMS test request
const smsTestSchema = z.object({
  to: z.string().min(1),
  message: z.string().min(1)
});

// Send a test SMS
router.post('/test', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = smsTestSchema.parse(req.body);
    
    // Send the SMS
    const success = await sendSMS(validatedData.to, validatedData.message);
    
    if (success) {
      res.json({ message: 'Test SMS sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send SMS. Check Twilio configuration.' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error sending test SMS:', error);
    res.status(500).json({ message: `Failed to send SMS: ${(error as Error).message}` });
  }
});

// Middleware to check Twilio configuration
export const checkTwilioConfig = (req: Request, res: Response, next: Function) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken || !phoneNumber) {
    return res.status(400).json({ 
      message: 'Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.',
      configured: false
    });
  }
  
  next();
};

// Get Twilio configuration status
router.get('/config-status', (req: Request, res: Response) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  const isTwilioConfigured = Boolean(accountSid && authToken && phoneNumber);
  
  res.json({
    configured: isTwilioConfigured,
    accountSid: accountSid ? `${accountSid.substring(0, 2)}...${accountSid.substring(accountSid.length - 4)}` : null,
    phoneNumber: phoneNumber || null
  });
});

export default router;