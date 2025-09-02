/**
 * State-Specific Healthcare Compliance Service
 * 
 * This service implements features to ensure compliance with state-specific healthcare regulations
 * for Florida and New York state healthcare privacy laws beyond HIPAA requirements.
 */

import fs from 'fs';
import path from 'path';
import { logPhiAccess, AuditEventType } from './auditLogger';
import { Notification } from '@shared/schema';
import { db } from '../db';

/**
 * Compliance timeframes by state
 * - Florida: 30-day breach notification
 * - New York: 14-day patient record access
 */
export const STATE_COMPLIANCE_PERIODS = {
  BREACH_NOTIFICATION: {
    FLORIDA: 30, // days
    DEFAULT: 60 // days (HIPAA standard)
  },
  RECORD_ACCESS: {
    NEW_YORK: 14, // days
    DEFAULT: 30 // days (HIPAA standard)
  },
  DATA_RETENTION: {
    FLORIDA: 5, // years
    NEW_YORK: 6, // years
    DEFAULT: 7 // years (HIPAA standard recommendation)
  }
};

/**
 * Creates a breach notification report and tracks notification status
 * to comply with Florida's 30-day breach notification requirement
 */
export async function createBreachNotificationReport(
  breachDetails: {
    date: Date;
    affectedRecords: number;
    description: string;
    patientDataCompromised: boolean;
    detectionMethod: string;
    initialResponseActions: string[];
  },
  notificationStatus: {
    patientsNotified: boolean;
    regulatorsNotified: boolean;
    mediaNotified: boolean;
  }
): Promise<{ reportId: string; dueDate: Date }> {
  // Generate a unique report ID
  const reportId = `breach-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Calculate Florida's 30-day notification due date 
  const dueDate = new Date(breachDetails.date);
  dueDate.setDate(dueDate.getDate() + STATE_COMPLIANCE_PERIODS.BREACH_NOTIFICATION.FLORIDA);
  
  // Create report directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), 'compliance_reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Create and save the breach report
  const report = {
    reportId,
    createdAt: new Date(),
    breachDetails,
    notificationStatus,
    dueDate,
    completed: false,
    notificationsSent: [],
    complianceStatus: {
      floridaCompliant: false,
      hipaaCompliant: false
    }
  };
  
  fs.writeFileSync(
    path.join(reportsDir, `${reportId}.json`),
    JSON.stringify(report, null, 2)
  );
  
  // Log breach reporting activity for audit purposes
  try {
    await logPhiAccess(
      0, // system user
      'breach_report',
      reportId,
      'create',
      `Created breach notification report ${reportId} for incident on ${breachDetails.date.toISOString()}`,
      'system',
      true,
      { affectedRecords: breachDetails.affectedRecords }
    );
  } catch (error) {
    console.error('Failed to log breach report creation:', error);
  }
  
  return { reportId, dueDate };
}

/**
 * Updates breach notification status to track compliance with Florida's 
 * mandatory 30-day notification requirements
 */
export async function updateBreachNotificationStatus(
  reportId: string,
  updates: {
    patientsNotified?: boolean;
    regulatorsNotified?: boolean;
    mediaNotified?: boolean;
    additionalActions?: string[];
  }
): Promise<boolean> {
  try {
    const reportPath = path.join(process.cwd(), 'compliance_reports', `${reportId}.json`);
    
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Breach report ${reportId} not found`);
    }
    
    // Read existing report
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    // Update notification status
    report.notificationStatus = {
      ...report.notificationStatus,
      ...updates
    };
    
    // Add timestamp to notification tracking
    if (updates.patientsNotified || updates.regulatorsNotified || updates.mediaNotified) {
      report.notificationsSent.push({
        timestamp: new Date(),
        details: updates
      });
    }
    
    // Check if all required notifications are complete
    const allNotified = 
      report.notificationStatus.patientsNotified && 
      report.notificationStatus.regulatorsNotified &&
      report.notificationStatus.mediaNotified;
    
    // Calculate if notifications were made within Florida's 30-day requirement
    const notificationDate = new Date();
    const breachDate = new Date(report.breachDetails.date);
    const daysSinceBreach = Math.floor((notificationDate.getTime() - breachDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (allNotified) {
      report.completed = true;
      report.complianceStatus.floridaCompliant = daysSinceBreach <= STATE_COMPLIANCE_PERIODS.BREACH_NOTIFICATION.FLORIDA;
      report.complianceStatus.hipaaCompliant = daysSinceBreach <= STATE_COMPLIANCE_PERIODS.BREACH_NOTIFICATION.DEFAULT;
    }
    
    // Save updated report
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Log breach notification update for audit purposes
    await logPhiAccess(
      0, // system user
      'breach_report',
      reportId,
      'update',
      `Updated breach notification status for report ${reportId}`,
      'system',
      true,
      { 
        updates,
        daysSinceBreach,
        floridaCompliant: report.complianceStatus.floridaCompliant,
        hipaaCompliant: report.complianceStatus.hipaaCompliant
      }
    );
    
    return true;
  } catch (error) {
    console.error('Failed to update breach notification status:', error);
    return false;
  }
}

/**
 * Implements New York State's 14-day patient record access requirement
 * This accelerates the standard HIPAA 30-day timeline for New York patients
 */
export async function processRecordAccessRequest(
  patientId: number,
  requestDetails: {
    requestDate: Date;
    recordTypes: string[];
    format: 'electronic' | 'paper';
    state: string;
    contactEmail: string;
    urgent: boolean;
  }
): Promise<{ 
  requestId: string; 
  dueDate: Date;
  expedited: boolean;
}> {
  // Generate a unique request ID
  const requestId = `access-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  // Determine if the request needs to follow New York's expedited timeline
  const isNewYorkRequest = requestDetails.state.toUpperCase() === 'NY' || 
                           requestDetails.state.toUpperCase() === 'NEW YORK';
  
  // Calculate due date based on state regulations
  const dueDate = new Date(requestDetails.requestDate);
  if (isNewYorkRequest) {
    // New York requires 14-day access
    dueDate.setDate(dueDate.getDate() + STATE_COMPLIANCE_PERIODS.RECORD_ACCESS.NEW_YORK);
  } else {
    // HIPAA standard is 30 days
    dueDate.setDate(dueDate.getDate() + STATE_COMPLIANCE_PERIODS.RECORD_ACCESS.DEFAULT);
  }
  
  // Further expedite if marked urgent regardless of state
  if (requestDetails.urgent) {
    // Process urgent requests in 7 days
    dueDate.setDate(dueDate.getDate() - Math.floor(dueDate.getDate() / 2));
  }
  
  // Create request tracking record
  const requestRecord = {
    requestId,
    patientId,
    ...requestDetails,
    dueDate,
    status: 'pending',
    expedited: isNewYorkRequest || requestDetails.urgent,
    fulfillmentDate: null,
    trackingEvents: [{
      timestamp: new Date(),
      status: 'created',
      notes: `Record access request created. ${isNewYorkRequest ? 'New York 14-day timeline applies.' : 'Standard 30-day timeline applies.'}`
    }]
  };
  
  // Store request record 
  const reportsDir = path.join(process.cwd(), 'compliance_reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(reportsDir, `${requestId}.json`),
    JSON.stringify(requestRecord, null, 2)
  );
  
  // Create notification for the record request processing team
  try {
    // In a real system, this would create notifications for the records team
    // and add entries to a processing queue based on due dates
    console.log(`Created record access request ${requestId} with due date ${dueDate.toISOString()}`);
    
    // Log the record access request for auditing
    await logPhiAccess(
      patientId,
      'record_access',
      requestId,
      'create',
      `Created patient record access request ${requestId} for patient ${patientId}`,
      'system',
      true,
      { 
        expedited: isNewYorkRequest || requestDetails.urgent,
        dueDate: dueDate.toISOString(),
        recordTypes: requestDetails.recordTypes
      }
    );
  } catch (error) {
    console.error('Failed to process record access request:', error);
  }
  
  return {
    requestId,
    dueDate,
    expedited: isNewYorkRequest || requestDetails.urgent
  };
}

/**
 * Updates the status of a record access request to track compliance
 * with New York's 14-day access requirement
 */
export async function updateRecordAccessStatus(
  requestId: string,
  update: {
    status: 'processing' | 'fulfilled' | 'delayed' | 'denied';
    notes?: string;
    fulfillmentDate?: Date;
  }
): Promise<boolean> {
  try {
    const requestPath = path.join(process.cwd(), 'compliance_reports', `${requestId}.json`);
    
    if (!fs.existsSync(requestPath)) {
      throw new Error(`Record access request ${requestId} not found`);
    }
    
    // Read existing request
    const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
    
    // Update request status
    request.status = update.status;
    if (update.fulfillmentDate) {
      request.fulfillmentDate = update.fulfillmentDate;
    }
    
    // Add to tracking events
    request.trackingEvents.push({
      timestamp: new Date(),
      status: update.status,
      notes: update.notes || `Request status updated to ${update.status}`
    });
    
    // Calculate compliance with state regulations
    if (update.status === 'fulfilled' && update.fulfillmentDate) {
      const requestDate = new Date(request.requestDate);
      const fulfillmentDate = new Date(update.fulfillmentDate);
      const daysToFulfill = Math.floor((fulfillmentDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const isNewYorkRequest = request.state.toUpperCase() === 'NY' || 
                              request.state.toUpperCase() === 'NEW YORK';
      
      request.compliance = {
        daysToFulfill,
        nyCompliant: isNewYorkRequest ? 
                    daysToFulfill <= STATE_COMPLIANCE_PERIODS.RECORD_ACCESS.NEW_YORK : 
                    'Not Applicable',
        hipaaCompliant: daysToFulfill <= STATE_COMPLIANCE_PERIODS.RECORD_ACCESS.DEFAULT
      };
    }
    
    // Save updated request
    fs.writeFileSync(requestPath, JSON.stringify(request, null, 2));
    
    // Log the record access update for auditing
    await logPhiAccess(
      request.patientId,
      'record_access',
      requestId,
      'update',
      `Updated record access request ${requestId} status to ${update.status}`,
      'system',
      true,
      update.status === 'fulfilled' ? request.compliance : { status: update.status }
    );
    
    return true;
  } catch (error) {
    console.error('Failed to update record access status:', error);
    return false;
  }
}

/**
 * Gets all overdue record access requests that risk non-compliance
 * with New York's 14-day requirement or HIPAA's 30-day requirement
 */
export async function getOverdueRecordRequests(): Promise<any[]> {
  try {
    const reportsDir = path.join(process.cwd(), 'compliance_reports');
    if (!fs.existsSync(reportsDir)) {
      return [];
    }
    
    const overdueRequests = [];
    const today = new Date();
    
    // Read all request files
    const files = fs.readdirSync(reportsDir);
    for (const file of files) {
      if (file.startsWith('access-') && file.endsWith('.json')) {
        const request = JSON.parse(fs.readFileSync(path.join(reportsDir, file), 'utf8'));
        
        // Skip fulfilled requests
        if (request.status === 'fulfilled') {
          continue;
        }
        
        // Check if request is overdue
        const dueDate = new Date(request.dueDate);
        if (today > dueDate) {
          overdueRequests.push({
            requestId: request.requestId,
            patientId: request.patientId,
            dueDate: request.dueDate,
            state: request.state,
            daysOverdue: Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
            expedited: request.expedited,
            status: request.status
          });
        }
      }
    }
    
    return overdueRequests;
  } catch (error) {
    console.error('Failed to get overdue record requests:', error);
    return [];
  }
}