/**
 * HIPAA-compliant Audit Routes
 * 
 * These routes provide administrative access to audit logs for compliance purposes.
 * All PHI access is tracked for accountability and security reviews.
 */

import express, { Request, Response } from 'express';
import { getAuditLogs, getAuditSummary, AuditEventType } from '../services/auditLogger';

const router = express.Router();

// Middleware to ensure only admins can access audit logs
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

// Get audit logs with filtering options
router.get('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const {
      userId,
      resourceType,
      resourceId,
      eventType,
      startDate,
      endDate,
      page = '1',
      limit = '50'
    } = req.query;

    const filters: any = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    };

    if (userId) filters.userId = parseInt(userId as string, 10);
    if (resourceType) filters.resourceType = resourceType as string;
    if (resourceId) filters.resourceId = resourceId as string;
    if (eventType) filters.eventType = eventType as AuditEventType;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const logs = await getAuditLogs(filters);
    
    res.json({
      logs,
      pagination: {
        page: filters.page,
        limit: filters.limit,
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

// Get audit summary for reporting
router.get('/summary', isAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = req.query;
    
    const summary = await getAuditSummary(
      new Date(startDate as string), 
      new Date(endDate as string)
    );
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching audit summary:', error);
    res.status(500).json({ message: 'Failed to fetch audit summary' });
  }
});

// Get specific audit log by ID
router.get('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = await getAuditLogs({ resourceId: id });
    
    if (!logs.length) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    
    res.json(logs[0]);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ message: 'Failed to fetch audit log' });
  }
});

export default router;