import twilio from 'twilio';

// Store for mock SMS logs when Twilio is not configured
let mockSmsLog: { to: string; body: string; timestamp: Date }[] = [];

// Store for verification codes when Twilio Verify is not configured
interface VerificationRecord {
  phoneNumber: string;
  code: string;
  createdAt: Date;
  verified: boolean;
}
let mockVerifications: VerificationRecord[] = [];

/**
 * Send an SMS message using Twilio or fallback to logging
 * @param to Phone number to send SMS to
 * @param body SMS message content
 * @returns Promise<boolean> Success status
 */
export async function sendSMS(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
  
  // If Twilio is not configured, log the SMS and return success
  if (!accountSid || !authToken || !twilioNumber) {
    console.log(`[MOCK SMS] To: ${to}, Message: ${body}`);
    
    // Store in mock log
    mockSmsLog.push({
      to,
      body,
      timestamp: new Date()
    });
    
    // Limit log size
    if (mockSmsLog.length > 100) {
      mockSmsLog = mockSmsLog.slice(-100);
    }
    
    return true;
  }
  
  // Twilio is configured, send real SMS
  try {
    const client = twilio(accountSid, authToken);
    
    const message = await client.messages.create({
      body,
      from: twilioNumber,
      to
    });
    
    console.log(`[SMS sent] SID: ${message.sid}, To: ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS via Twilio:', error);
    return false;
  }
}

/**
 * Get the mock SMS log
 * @returns Array of mock SMS log entries
 */
export function getMockSmsLog() {
  return mockSmsLog;
}

/**
 * Start phone verification process using Twilio Verify API
 * @param phoneNumber Phone number to verify in E.164 format (e.g., +12125551234)
 * @param channel Verification channel ('sms' or 'call')
 * @returns Object with status and details of the verification attempt
 */
export async function startPhoneVerification(
  phoneNumber: string,
  channel: 'sms' | 'call' = 'sms'
): Promise<{
  success: boolean;
  status?: string;
  message: string;
  sid?: string;
}> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  
  // If Twilio is not fully configured, use mock verification
  if (!accountSid || !authToken || !verifyServiceSid) {
    console.log(`[MOCK VERIFICATION] Starting verification for: ${phoneNumber} via ${channel}`);
    
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification
    const existingIndex = mockVerifications.findIndex(v => v.phoneNumber === phoneNumber);
    if (existingIndex >= 0) {
      mockVerifications[existingIndex] = {
        phoneNumber,
        code,
        createdAt: new Date(),
        verified: false
      };
    } else {
      mockVerifications.push({
        phoneNumber,
        code,
        createdAt: new Date(),
        verified: false
      });
    }
    
    // Trim mock verifications array if too large
    if (mockVerifications.length > 100) {
      mockVerifications = mockVerifications.slice(-100);
    }
    
    // Send mock verification message
    if (channel === 'sms') {
      sendSMS(
        phoneNumber,
        `Your Health Insight Ventures verification code is: ${code}`
      );
    } else {
      console.log(`[MOCK CALL] Would call ${phoneNumber} with code: ${code}`);
    }
    
    return {
      success: true,
      status: 'pending',
      message: `Verification initiated for ${phoneNumber} via ${channel} (MOCK)`,
      sid: 'mock-verification-sid'
    };
  }
  
  // Twilio is configured, use real Verify API
  try {
    const client = twilio(accountSid, authToken);
    
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel
      });
    
    console.log(`[Verification started] SID: ${verification.sid}, To: ${phoneNumber}, Status: ${verification.status}`);
    
    return {
      success: true,
      status: verification.status,
      message: `Verification initiated for ${phoneNumber} via ${channel}`,
      sid: verification.sid
    };
  } catch (error) {
    console.error('Error starting phone verification via Twilio:', error);
    return {
      success: false,
      message: `Failed to start verification: ${(error as Error).message}`
    };
  }
}

/**
 * Check verification code using Twilio Verify API
 * @param phoneNumber Phone number in E.164 format (e.g., +12125551234)
 * @param code Verification code provided by the user
 * @returns Object with verification result
 */
export async function checkVerificationCode(
  phoneNumber: string,
  code: string
): Promise<{
  success: boolean;
  status?: string;
  message: string;
  valid?: boolean;
}> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  
  // If Twilio is not fully configured, use mock verification
  if (!accountSid || !authToken || !verifyServiceSid) {
    console.log(`[MOCK VERIFICATION] Checking code for: ${phoneNumber}`);
    
    // Find verification record
    const verificationRecord = mockVerifications.find(v => v.phoneNumber === phoneNumber);
    
    if (!verificationRecord) {
      return {
        success: false,
        message: 'No verification found for this phone number',
        valid: false
      };
    }
    
    // Check if code is valid and not expired (10 minutes max)
    const isExpired = new Date().getTime() - verificationRecord.createdAt.getTime() > 10 * 60 * 1000;
    const isValid = verificationRecord.code === code && !isExpired;
    
    if (isValid) {
      // Update verification status
      verificationRecord.verified = true;
      
      return {
        success: true,
        status: 'approved',
        message: 'Verification successful',
        valid: true
      };
    } else if (isExpired) {
      return {
        success: false,
        status: 'expired',
        message: 'Verification code has expired',
        valid: false
      };
    } else {
      return {
        success: false,
        status: 'invalid',
        message: 'Invalid verification code',
        valid: false
      };
    }
  }
  
  // Twilio is configured, use real Verify API
  try {
    const client = twilio(accountSid, authToken);
    
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code
      });
    
    console.log(`[Verification check] To: ${phoneNumber}, Status: ${verificationCheck.status}`);
    
    return {
      success: true,
      status: verificationCheck.status,
      message: verificationCheck.status === 'approved' 
        ? 'Phone number verified successfully' 
        : 'Verification failed',
      valid: verificationCheck.status === 'approved'
    };
  } catch (error) {
    console.error('Error checking verification code via Twilio:', error);
    return {
      success: false,
      message: `Failed to check verification code: ${(error as Error).message}`,
      valid: false
    };
  }
}

/**
 * Send appointment reminder SMS
 * @param phoneNumber Recipient's phone number
 * @param patientName Patient name
 * @param appointmentDate Appointment date and time
 * @param providerName Provider name
 * @returns Promise<boolean> Success status
 */
export async function sendAppointmentReminder(
  phoneNumber: string,
  patientName: string,
  appointmentDate: Date,
  providerName: string
): Promise<boolean> {
  const formattedDate = appointmentDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  
  const message = `Hi ${patientName}, this is a reminder about your appointment with ${providerName} on ${formattedDate}. Reply CONFIRM to confirm or CANCEL to cancel.`;
  
  return sendSMS(phoneNumber, message);
}

/**
 * Send medication reminder SMS
 * @param phoneNumber Recipient's phone number
 * @param patientName Patient name
 * @param medicationName Medication name
 * @returns Promise<boolean> Success status
 */
export async function sendMedicationReminder(
  phoneNumber: string,
  patientName: string,
  medicationName: string
): Promise<boolean> {
  const message = `Hi ${patientName}, this is a reminder to take your ${medicationName}. Reply TAKEN once you've taken it.`;
  
  return sendSMS(phoneNumber, message);
}