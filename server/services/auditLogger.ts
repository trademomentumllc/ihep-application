/**
 * HIPAA-compliant Audit Logging Service
 * 
 * This service provides comprehensive logging for all PHI (Protected Health Information)
 * access and modifications to meet HIPAA Security Rule requirements for audit controls.
 * 
 * Implements Winston for secure, structured logging with enhanced security features.
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { users, auditLogs, InsertAuditLog } from '../../shared/schema';
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure log directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'health-insight-audit' },
  transports: [
    // Write all logs to separate files
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'hipaa-audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Define audit event types
export enum AuditEventType {
  PHI_ACCESS = 'PHI_ACCESS',
  PHI_MODIFICATION = 'PHI_MODIFICATION',
  PHI_DELETION = 'PHI_DELETION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SYSTEM_EVENT = 'SYSTEM_EVENT'
}

// Define audit log entry structure
export interface AuditLogEntry {
  timestamp: Date;
  userId: number | null; // null for system events or unauthenticated attempts
  eventType: AuditEventType;
  resourceType: string; // e.g., 'user', 'appointment', 'message'
  resourceId: string | null;
  action: string;
  description: string;
  ipAddress: string;
  success: boolean;
  additionalInfo?: Record<string, any>;
}

/**
 * Log an audit event
 * 
 * @param entry The audit log entry to record
 * @returns Promise that resolves when the log is recorded
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  try {
    const timestamp = new Date();
    
    // Insert audit log entry into database using Drizzle ORM
    await db.insert(auditLogs).values({
      timestamp,
      userId: entry.userId,
      eventType: entry.eventType,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      action: entry.action,
      description: entry.description,
      ipAddress: entry.ipAddress,
      success: entry.success,
      additionalInfo: entry.additionalInfo || {}
    });
    
    // Log structured audit information using Winston
    logger.info('Audit event recorded', {
      timestamp,
      userId: entry.userId,
      eventType: entry.eventType,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      action: entry.action,
      ipAddress: entry.ipAddress,
      success: entry.success
    });
    
    // For critical events, log with higher severity
    if (
      entry.eventType === AuditEventType.PHI_DELETION || 
      (entry.eventType === AuditEventType.AUTHENTICATION && !entry.success)
    ) {
      // Log critical events with elevated priority
      logger.warn('CRITICAL AUDIT EVENT', {
        timestamp,
        userId: entry.userId,
        eventType: entry.eventType,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        action: entry.action,
        description: entry.description,
        ipAddress: entry.ipAddress
      });
    }
  } catch (error) {
    // We never want audit logging to fail silently, but also don't want to 
    // prevent the application from working if logging fails
    logger.error('AUDIT LOGGING ERROR', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      entry
    });
    
    // In a production system, this should trigger an alert to administrators
  }
}

/**
 * Log PHI access event
 */
export function logPhiAccess(
  userId: number,
  resourceType: string,
  resourceId: string,
  action: string,
  description: string,
  ipAddress: string,
  success: boolean,
  additionalInfo?: Record<string, any>
): Promise<void> {
  return logAuditEvent({
    userId,
    eventType: AuditEventType.PHI_ACCESS,
    resourceType,
    resourceId,
    action,
    description,
    ipAddress,
    success,
    additionalInfo
  });
}

/**
 * Log PHI modification event
 */
export function logPhiModification(
  userId: number,
  resourceType: string,
  resourceId: string,
  action: string,
  description: string,
  ipAddress: string,
  success: boolean,
  additionalInfo?: Record<string, any>
): Promise<void> {
  return logAuditEvent({
    userId,
    eventType: AuditEventType.PHI_MODIFICATION,
    resourceType,
    resourceId,
    action,
    description,
    ipAddress,
    success,
    additionalInfo
  });
}

/**
 * Log authentication event (login/logout)
 */
export function logAuthentication(
  userId: number | null,
  action: string,
  description: string,
  ipAddress: string,
  success: boolean,
  additionalInfo?: Record<string, any>
): Promise<void> {
  return logAuditEvent({
    userId,
    eventType: AuditEventType.AUTHENTICATION,
    resourceType: 'authentication',
    resourceId: userId?.toString() || null,
    action,
    description,
    ipAddress,
    success,
    additionalInfo
  });
}

/**
 * Retrieve audit logs for a specific user or resource
 */
export async function getAuditLogs(filters: {
  userId?: number;
  resourceType?: string;
  resourceId?: string;
  eventType?: AuditEventType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}): Promise<any[]> {
  const {
    userId,
    resourceType,
    resourceId,
    eventType,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = filters;

  const offset = (page - 1) * limit;
  
  try {
    // Use Drizzle's query builder with proper parameterization
    const query = sql`
      SELECT al.*, u.username, u.email 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
      ${userId ? sql`AND al.user_id = ${userId}` : sql``}
      ${resourceType ? sql`AND al.resource_type = ${resourceType}` : sql``}
      ${resourceId ? sql`AND al.resource_id = ${resourceId}` : sql``}
      ${eventType ? sql`AND al.event_type = ${eventType}` : sql``}
      ${startDate ? sql`AND al.timestamp >= ${startDate}` : sql``}
      ${endDate ? sql`AND al.timestamp <= ${endDate}` : sql``}
      ORDER BY al.timestamp DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const results = await db.execute(query);
    
    // Return the results as an array
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Error executing audit log query:", error);
    return [];
  }
}

/**
 * Get a summary of audit activities for reporting
 */
export async function getAuditSummary(startDate: Date, endDate: Date): Promise<{
  period: { start: Date; end: Date };
  totalAccessEvents: number;
  totalModificationEvents: number;
  failedAuthEvents: number;
  topAccessedResources: { resourceType: string; count: number }[];
}> {
  try {
    logger.info('Generating audit summary', { startDate, endDate });
    
    // Use parameterized queries for improved security
    const totalAccessQuery = `
      SELECT COUNT(*) as count FROM audit_logs 
      WHERE event_type = $1
      AND timestamp BETWEEN $2 AND $3
    `;
    const totalAccessParams = [AuditEventType.PHI_ACCESS, startDate.toISOString(), endDate.toISOString()];
    const totalAccessEvents = await db.execute(sql.raw(totalAccessQuery, totalAccessParams));
    
    const totalModificationQuery = `
      SELECT COUNT(*) as count FROM audit_logs 
      WHERE event_type = $1
      AND timestamp BETWEEN $2 AND $3
    `;
    const totalModificationParams = [AuditEventType.PHI_MODIFICATION, startDate.toISOString(), endDate.toISOString()];
    const totalModificationEvents = await db.execute(sql.raw(totalModificationQuery, totalModificationParams));
    
    const failedAuthQuery = `
      SELECT COUNT(*) as count FROM audit_logs 
      WHERE event_type = $1
      AND success = false
      AND timestamp BETWEEN $2 AND $3
    `;
    const failedAuthParams = [AuditEventType.AUTHENTICATION, startDate.toISOString(), endDate.toISOString()];
    const failedAuthEvents = await db.execute(sql.raw(failedAuthQuery, failedAuthParams));
    
    const topResourcesQuery = `
      SELECT resource_type as "resourceType", COUNT(*) as count 
      FROM audit_logs 
      WHERE event_type = $1
      AND timestamp BETWEEN $2 AND $3
      GROUP BY resource_type
      ORDER BY count DESC
      LIMIT 5
    `;
    const topResourcesParams = [AuditEventType.PHI_ACCESS, startDate.toISOString(), endDate.toISOString()];
    const topResourcesResult = await db.execute(sql.raw(topResourcesQuery, topResourcesParams));
    
    // Safely extract counts from query results
    let accessCount = 0;
    let modificationCount = 0;
    let authFailCount = 0;
    
    try {
      if (Array.isArray(totalAccessEvents) && totalAccessEvents.length > 0) {
        accessCount = Number(totalAccessEvents[0]?.count || 0);
      }
      
      if (Array.isArray(totalModificationEvents) && totalModificationEvents.length > 0) {
        modificationCount = Number(totalModificationEvents[0]?.count || 0);
      }
      
      if (Array.isArray(failedAuthEvents) && failedAuthEvents.length > 0) {
        authFailCount = Number(failedAuthEvents[0]?.count || 0);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("Error parsing audit summary counts", { error: errorMsg });
    }
    
    // Process resource type results
    const resources = [];
    try {
      if (Array.isArray(topResourcesResult)) {
        for (const row of topResourcesResult) {
          resources.push({
            resourceType: String(row?.resourceType || 'unknown'),
            count: Number(row?.count || 0)
          });
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("Error processing resource results", { error: errorMsg });
    }
    
    // Log summary generation success
    logger.info('Audit summary generated successfully', {
      period: { startDate, endDate },
      accessEvents: accessCount,
      modificationEvents: modificationCount,
      failedAuthEvents: authFailCount
    });
    
    return {
      period: {
        start: startDate,
        end: endDate
      },
      totalAccessEvents: accessCount,
      totalModificationEvents: modificationCount,
      failedAuthEvents: authFailCount,
      topAccessedResources: resources
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Failed to generate audit summary', {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
      startDate, 
      endDate
    });
    
    // Return empty data on error
    return {
      period: { start: startDate, end: endDate },
      totalAccessEvents: 0,
      totalModificationEvents: 0,
      failedAuthEvents: 0,
      topAccessedResources: []
    };
  }
}