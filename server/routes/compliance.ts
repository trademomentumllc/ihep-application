/**
 * State Compliance Routes
 * 
 * Implements API endpoints for state-specific regulatory compliance features
 * including Florida's 30-day breach notification and New York's 14-day record access.
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import {
  processRecordAccessRequest,
  updateRecordAccessStatus,
  getOverdueRecordRequests,
  createBreachNotificationReport,
  updateBreachNotificationStatus
} from '../services/stateCompliance';
import { logPhiAccess } from '../services/auditLogger';

const router = express.Router();

// User authentication middleware
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
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

// Schema for record access requests
const recordAccessSchema = z.object({
  patientId: z.number(),
  requestDate: z.string().transform(date => new Date(date)),
  recordTypes: z.array(z.string()),
  format: z.enum(['electronic', 'paper']),
  state: z.string(),
  contactEmail: z.string().email(),
  urgent: z.boolean().optional().default(false)
});

// Schema for record access status updates
const recordStatusUpdateSchema = z.object({
  status: z.enum(['processing', 'fulfilled', 'delayed', 'denied']),
  notes: z.string().optional(),
  fulfillmentDate: z.string().optional().transform(date => date ? new Date(date) : undefined)
});

// Schema for breach notification reports
const breachReportSchema = z.object({
  date: z.string().transform(date => new Date(date)),
  affectedRecords: z.number(),
  description: z.string(),
  patientDataCompromised: z.boolean(),
  detectionMethod: z.string(),
  initialResponseActions: z.array(z.string())
});

// Schema for breach notification status updates
const breachStatusUpdateSchema = z.object({
  patientsNotified: z.boolean().optional(),
  regulatorsNotified: z.boolean().optional(),
  mediaNotified: z.boolean().optional(),
  additionalActions: z.array(z.string()).optional()
});

// Initiate record access request (New York 14-day compliance)
router.post('/record-request', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userId = (req.user as any).id;
    
    // Validate request body
    const validatedData = recordAccessSchema.parse(req.body);
    
    // Process the record access request
    const result = await processRecordAccessRequest(
      validatedData.patientId,
      validatedData
    );
    
    // Log the request for HIPAA compliance
    await logPhiAccess(
      userId,
      'record_request',
      result.requestId,
      'create',
      `User ${userId} initiated record access request for patient ${validatedData.patientId}`,
      ipAddress,
      true,
      { 
        state: validatedData.state,
        expedited: result.expedited,
        dueDate: result.dueDate.toISOString()
      }
    );
    
    res.status(201).json({
      success: true,
      message: `Record access request created successfully. ${result.expedited ? 'Expedited processing applies.' : ''}`,
      requestId: result.requestId,
      dueDate: result.dueDate
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      message: "Failed to create record access request",
      error: (error as Error).message
    });
  }
});

// Update record access request status
router.patch('/record-request/:requestId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userId = (req.user as any).id;
    
    // Validate request body
    const validatedData = recordStatusUpdateSchema.parse(req.body);
    
    // Update the record request status
    const success = await updateRecordAccessStatus(requestId, validatedData);
    
    if (!success) {
      return res.status(404).json({
        message: "Record access request not found"
      });
    }
    
    // Log the update for HIPAA compliance
    await logPhiAccess(
      userId,
      'record_request',
      requestId,
      'update',
      `User ${userId} updated record access request ${requestId} status to ${validatedData.status}`,
      ipAddress,
      true,
      { 
        status: validatedData.status,
        fulfillmentDate: validatedData.fulfillmentDate?.toISOString()
      }
    );
    
    res.json({
      success: true,
      message: "Record access request updated successfully"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      message: "Failed to update record access request",
      error: (error as Error).message
    });
  }
});

// Get all overdue record access requests (admin only)
router.get('/record-request/overdue', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const overdueRequests = await getOverdueRecordRequests();
    
    res.json({
      count: overdueRequests.length,
      requests: overdueRequests
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to retrieve overdue record requests",
      error: (error as Error).message
    });
  }
});

// Create breach notification report (Florida 30-day compliance)
router.post('/breach-notification', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userId = (req.user as any).id;
    
    // Validate request body
    const validatedData = breachReportSchema.parse(req.body);
    
    // Create the breach notification report
    const result = await createBreachNotificationReport(
      validatedData,
      {
        patientsNotified: false,
        regulatorsNotified: false,
        mediaNotified: false
      }
    );
    
    // Log the report creation for HIPAA compliance
    await logPhiAccess(
      userId,
      'breach_notification',
      result.reportId,
      'create',
      `Admin ${userId} created breach notification report ${result.reportId}`,
      ipAddress,
      true,
      { 
        affectedRecords: validatedData.affectedRecords,
        dueDate: result.dueDate.toISOString()
      }
    );
    
    res.status(201).json({
      success: true,
      message: "Breach notification report created successfully",
      reportId: result.reportId,
      dueDate: result.dueDate
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      message: "Failed to create breach notification report",
      error: (error as Error).message
    });
  }
});

// Update breach notification status
router.patch('/breach-notification/:reportId', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userId = (req.user as any).id;
    
    // Validate request body
    const validatedData = breachStatusUpdateSchema.parse(req.body);
    
    // Update the breach notification status
    const success = await updateBreachNotificationStatus(reportId, validatedData);
    
    if (!success) {
      return res.status(404).json({
        message: "Breach notification report not found"
      });
    }
    
    // Log the update for HIPAA compliance
    await logPhiAccess(
      userId,
      'breach_notification',
      reportId,
      'update',
      `Admin ${userId} updated breach notification status for report ${reportId}`,
      ipAddress,
      true,
      validatedData
    );
    
    res.json({
      success: true,
      message: "Breach notification status updated successfully"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      message: "Failed to update breach notification status",
      error: (error as Error).message
    });
  }
});

export default router;