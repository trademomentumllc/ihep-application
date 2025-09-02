import { Router, Request, Response } from 'express';
import { z } from 'zod';
import twilio from 'twilio';
// No need for dotenv import in this context
import fs from 'fs';
import path from 'path';

const router = Router();

// Schema for Twilio credentials
const twilioCredentialsSchema = z.object({
  accountSid: z.string().min(1),
  authToken: z.string().min(1),
  phoneNumber: z.string().min(1)
});

// Admin middleware
const isAdmin = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // @ts-ignore - User role is defined in the User type
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// Get current Twilio settings
router.get('/twilio', isAdmin, async (req: Request, res: Response) => {
  try {
    // Get current settings from environment
    const settings = {
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        // Don't send the full auth token for security reasons
        authToken: process.env.TWILIO_AUTH_TOKEN ? '••••••••••••••••' : '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
      }
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching Twilio settings:', error);
    res.status(500).json({ message: 'Failed to fetch Twilio settings' });
  }
});

// Update Twilio settings
router.post('/twilio', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = twilioCredentialsSchema.parse(req.body);
    
    // Update environment variables
    process.env.TWILIO_ACCOUNT_SID = validatedData.accountSid;
    process.env.TWILIO_AUTH_TOKEN = validatedData.authToken;
    process.env.TWILIO_PHONE_NUMBER = validatedData.phoneNumber;
    
    // In a real production app, you would securely store these credentials
    // For demo purposes, we'll just update environment variables
    console.log('Twilio configuration updated:', {
      accountSid: validatedData.accountSid.substring(0, 3) + '...',
      phoneNumber: validatedData.phoneNumber
    });
    
    res.json({ message: 'Twilio settings updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error updating Twilio settings:', error);
    res.status(500).json({ message: 'Failed to update Twilio settings' });
  }
});

// Test Twilio credentials
router.post('/twilio/test', async (req: Request, res: Response) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      return res.status(400).json({
        message: 'Twilio credentials not configured',
        status: 'error'
      });
    }
    
    // Initialize Twilio with saved credentials
    const client = twilio(accountSid, authToken);
    
    // Verify credentials by fetching account info
    const account = await client.api.accounts(accountSid).fetch();
    
    if (account.sid) {
      // Send test response
      res.json({
        message: 'Twilio credentials are valid',
        status: 'success',
        accountName: account.friendlyName
      });
    } else {
      res.status(400).json({
        message: 'Failed to validate Twilio credentials',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error testing Twilio credentials:', error);
    res.status(500).json({
      message: `Failed to validate Twilio credentials: ${(error as any).message}`,
      status: 'error'
    });
  }
});

export default router;