import { MailService } from '@sendgrid/mail';

// Initialize SendGrid with the API key
const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY || '');

// Application URL for links in emails - Using Replit app URL structure
const APP_URL = process.env.APP_URL || 'https://integrated-health-empowerment-program.replit.app';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const defaultFrom = 'no-reply@healthinsightventures.org';
    
    await mailService.send({
      to: options.to,
      from: options.from || defaultFrom,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send an appointment reminder email
 */
export async function sendAppointmentReminder(
  email: string,
  firstName: string,
  appointmentDate: Date,
  providerName: string
): Promise<boolean> {
  // Default values for optional parameters
  const appointmentType = 'Healthcare';
  const location = 'Our clinic';
  const virtualAppointment = false;
  const appointmentId = 0;
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const locationText = virtualAppointment
    ? 'This is a virtual appointment. Please check your email for the video link 30 minutes before your appointment.'
    : `Please arrive at ${location} 15 minutes before your appointment time.`;
  
  const subject = `Reminder: Your appointment on ${formattedDate}`;
  
  const appointmentUrl = `${APP_URL}/appointments/${appointmentId}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #285238; margin-bottom: 5px;">Appointment Reminder</h1>
        <p style="color: #666; font-size: 16px;">Integrated Health Empowerment Program (IHEP)</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p>Hello ${firstName},</p>
        <p>This is a reminder about your upcoming ${appointmentType} appointment.</p>
      </div>
      
      <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <div style="margin-bottom: 15px;">
          <strong style="display: block; color: #285238; margin-bottom: 5px;">Date and Time:</strong>
          <span>${formattedDate} at ${formattedTime}</span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="display: block; color: #285238; margin-bottom: 5px;">Provider:</strong>
          <span>Dr. ${providerName}</span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="display: block; color: #285238; margin-bottom: 5px;">Type:</strong>
          <span>${appointmentType}</span>
        </div>
        
        <div>
          <strong style="display: block; color: #285238; margin-bottom: 5px;">Location:</strong>
          <span>${location}</span>
          <p style="margin-top: 10px; font-style: italic;">${locationText}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${appointmentUrl}" style="display: inline-block; background-color: #285238; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Appointment Details</a>
      </div>
      
      <div>
        <p>If you need to reschedule or cancel your appointment, please log in to your account or call us at (555) 123-4567 at least 24 hours in advance.</p>
        <p>Thank you for choosing the Integrated Health Empowerment Program (IHEP) for your healthcare needs.</p>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} Integrated Health Empowerment Program (IHEP). All rights reserved.</p>
      </div>
    </div>
  `;
  
  const text = `
    Appointment Reminder - Integrated Health Empowerment Program (IHEP)
    
    Hello ${firstName},
    
    This is a reminder about your upcoming ${appointmentType} appointment.
    
    Date and Time: ${formattedDate} at ${formattedTime}
    Provider: Dr. ${providerName}
    Type: ${appointmentType}
    Location: ${location}
    
    ${locationText}
    
    View your appointment details at: ${appointmentUrl}
    
    If you need to reschedule or cancel your appointment, please log in to your account or call us at (555) 123-4567 at least 24 hours in advance.
    
    Thank you for choosing the Integrated Health Empowerment Program (IHEP) for your healthcare needs.
    
    This is an automated message, please do not reply to this email.
    © ${new Date().getFullYear()} Integrated Health Empowerment Program (IHEP). All rights reserved.
  `;
  
  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}