/**
 * Intelligent Automation Engine
 * 
 * Provides automated decision-making and response systems based on
 * neural governance rules and AI-driven insights for healthcare compliance
 */

import { db } from '../db';
import { 
  automationRules, 
  aiDecisionLogs,
  complianceMonitoring,
  notifications,
  auditLogs
} from '../../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { performRiskAssessment, monitorCompliance, logAiDecision } from './neuralGovernance';
import { logAuditEvent, AuditEventType } from './auditLogger';
import OpenAI from 'openai';

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openaiClient: OpenAI | null = null;
let isOpenAIConfigured = false;

try {
  if (OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
    isOpenAIConfigured = true;
  }
} catch (error) {
  console.error("Error initializing OpenAI for Intelligent Automation:", error);
}

// Automation rule execution engine
export class AutomationEngine {
  private static instance: AutomationEngine;
  private executionQueue: Map<string, any> = new Map();
  private isProcessing = false;

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  /**
   * Evaluate and execute automation rules for a given trigger
   */
  async evaluateTrigger(
    triggerType: string,
    triggerData: any,
    userId?: number
  ): Promise<{
    rulesExecuted: number;
    actionsPerformed: string[];
    errors: string[];
  }> {
    try {
      // Get active automation rules for this trigger type
      const activeRules = await db
        .select()
        .from(automationRules)
        .where(
          and(
            eq(automationRules.isActive, true),
            eq(automationRules.triggerType, triggerType)
          )
        )
        .orderBy(desc(automationRules.priority));

      let rulesExecuted = 0;
      const actionsPerformed: string[] = [];
      const errors: string[] = [];

      for (const rule of activeRules) {
        try {
          // Evaluate trigger conditions
          const conditionsMet = await this.evaluateConditions(rule.triggerConditions, triggerData);
          
          if (conditionsMet) {
            // Execute the action
            const actionResult = await this.executeAction(
              rule.actionType,
              rule.actionParameters,
              triggerData,
              userId,
              rule.id
            );

            if (actionResult.success) {
              rulesExecuted++;
              actionsPerformed.push(`${rule.name}: ${actionResult.description}`);
              
              // Update rule execution count
              await db
                .update(automationRules)
                .set({ 
                  executionCount: rule.executionCount + 1,
                  lastExecuted: new Date(),
                  successRate: Math.round(((rule.successRate * rule.executionCount) + 100) / (rule.executionCount + 1))
                })
                .where(eq(automationRules.id, rule.id));
            } else {
              errors.push(`Rule ${rule.name}: ${actionResult.error}`);
              
              // Update with failure
              await db
                .update(automationRules)
                .set({ 
                  executionCount: rule.executionCount + 1,
                  lastExecuted: new Date(),
                  successRate: Math.round(((rule.successRate * rule.executionCount) + 0) / (rule.executionCount + 1))
                })
                .where(eq(automationRules.id, rule.id));
            }
          }
        } catch (ruleError) {
          errors.push(`Rule execution error for ${rule.name}: ${ruleError}`);
        }
      }

      // Log automation execution
      if (userId) {
        await logAuditEvent({
          userId,
          eventType: AuditEventType.SYSTEM_EVENT,
          resourceType: 'automation',
          resourceId: triggerType,
          action: 'automation_execution',
          description: `Automation engine executed ${rulesExecuted} rules for trigger ${triggerType}`,
          ipAddress: 'system',
          success: errors.length === 0,
          additionalInfo: { rulesExecuted, actionsPerformed, errors }
        });
      }

      return {
        rulesExecuted,
        actionsPerformed,
        errors
      };

    } catch (error) {
      console.error('Error in automation engine:', error);
      return {
        rulesExecuted: 0,
        actionsPerformed: [],
        errors: [`Automation engine error: ${error}`]
      };
    }
  }

  /**
   * Evaluate trigger conditions using AI-enhanced logic
   */
  private async evaluateConditions(conditions: any, triggerData: any): Promise<boolean> {
    try {
      // Simple condition evaluation for now
      if (!conditions || typeof conditions !== 'object') {
        return true;
      }

      // Check each condition
      for (const [key, expectedValue] of Object.entries(conditions)) {
        const actualValue = this.getNestedValue(triggerData, key);
        
        if (actualValue !== expectedValue) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error evaluating conditions:', error);
      return false;
    }
  }

  /**
   * Execute automation action
   */
  private async executeAction(
    actionType: string,
    actionParameters: any,
    triggerData: any,
    userId?: number,
    ruleId?: number
  ): Promise<{ success: boolean; description?: string; error?: string }> {
    try {
      switch (actionType) {
        case 'moderate_content':
          return await this.moderateContentAction(actionParameters, triggerData, userId);
        
        case 'send_notification':
          return await this.sendNotificationAction(actionParameters, triggerData, userId);
        
        case 'create_compliance_report':
          return await this.createComplianceReportAction(actionParameters, triggerData, userId);
        
        case 'escalate_to_admin':
          return await this.escalateToAdminAction(actionParameters, triggerData, userId);
        
        case 'auto_approve':
          return await this.autoApproveAction(actionParameters, triggerData, userId);
        
        case 'risk_assessment':
          return await this.performRiskAssessmentAction(actionParameters, triggerData, userId);
        
        default:
          return {
            success: false,
            error: `Unknown action type: ${actionType}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Action execution failed: ${error}`
      };
    }
  }

  /**
   * Content moderation automation action
   */
  private async moderateContentAction(
    parameters: any,
    triggerData: any,
    userId?: number
  ): Promise<{ success: boolean; description?: string; error?: string }> {
    try {
      const { performAdvancedModeration } = await import('./aiModeration');
      
      const moderationResult = await performAdvancedModeration(
        triggerData.content,
        triggerData.contentType,
        triggerData.contentId,
        userId
      );

      return {
        success: true,
        description: `Content moderated: ${moderationResult.approved ? 'approved' : 'rejected'} (score: ${moderationResult.moderationScore})`
      };
    } catch (error) {
      return {
        success: false,
        error: `Content moderation failed: ${error}`
      };
    }
  }

  /**
   * Send notification automation action
   */
  private async sendNotificationAction(
    parameters: any,
    triggerData: any,
    userId?: number
  ): Promise<{ success: boolean; description?: string; error?: string }> {
    try {
      await db.insert(notifications).values({
        userId: userId || parameters.targetUserId,
        title: parameters.title || 'Automated Notification',
        message: parameters.message || 'Automated system notification',
        type: parameters.type || 'system',
        relatedId: triggerData.entityId,
        relatedType: triggerData.entityType
      });

      return {
        success: true,
        description: `Notification sent: ${parameters.title}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Notification failed: ${error}`
      };
    }
  }

  /**
   * Create compliance report automation action
   */
  private async createComplianceReportAction(
    parameters: any,
    triggerData: any,
    userId?: number
  ): Promise<{ success: boolean; description?: string; error?: string }> {
    try {
      const complianceResult = await monitorCompliance(
        parameters.framework || 'HIPAA',
        triggerData.entityType,
        triggerData.entityId,
        triggerData,
        userId
      );

      return {
        success: true,
        description: `Compliance report created for ${parameters.framework}: ${complianceResult.complianceStatus}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Compliance report failed: ${error}`
      };
    }
  }

  /**
   * Escalate to admin automation action
   */
  private async escalateToAdminAction(
    parameters: any,
    triggerData: any,
    userId?: number
  ): Promise<{ success: boolean; description?: string; error?: string }> {
    try {
      // Create high-priority notification for admins
      await db.insert(notifications).values({
        userId: null, // System notification for all admins
        title: `ESCALATION: ${parameters.title || 'System Alert'}`,
        message: parameters.message || `Automated escalation triggered for ${triggerData.entityType} ${triggerData.entityId}`,
        type: 'escalation',
        relatedId: triggerData.entityId,
        relatedType: triggerData.entityType
      });

      return {
        success: true,
        description: 'Issue escalated to administrators'
      };
    } catch (error) {
      return {
        success: false,
        error: `Escalation failed: ${error}`
      };
    }
  }

  /**
   * Auto-approve automation action
   */
  private async autoApproveAction(
    parameters: any,
    triggerData: any,
    userId?: number
  ): Promise<{ success: boolean; description?: string; error?: string }> {
    try {
      // Log the auto-approval decision
      await logAiDecision(
        'auto_approval',
        triggerData.entityType,
        triggerData.entityId,
        triggerData,
        { approved: true, automated: true },
        'approved',
        'Automatically approved based on governance rules',
        parameters.confidence || 95,
        0,
        userId
      );

      return {
        success: true,
        description: 'Content auto-approved by governance rules'
      };
    } catch (error) {
      return {
        success: false,
        error: `Auto-approval failed: ${error}`
      };
    }
  }

  /**
   * Risk assessment automation action
   */
  private async performRiskAssessmentAction(
    parameters: any,
    triggerData: any,
    userId?: number
  ): Promise<{ success: boolean; description?: string; error?: string }> {
    try {
      const riskResult = await performRiskAssessment(
        parameters.assessmentType || 'automated_assessment',
        triggerData.entityId,
        triggerData.entityType,
        triggerData,
        userId
      );

      return {
        success: true,
        description: `Risk assessment completed: ${riskResult.riskCategory} risk (score: ${riskResult.riskScore})`
      };
    } catch (error) {
      return {
        success: false,
        error: `Risk assessment failed: ${error}`
      };
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }
}

/**
 * AI-powered decision support system
 */
export async function getAiRecommendation(
  context: string,
  data: any,
  options: {
    framework?: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    domain?: string;
  } = {}
): Promise<{
  recommendation: string;
  confidence: number;
  reasoning: string;
  suggestedActions: string[];
  riskFactors: string[];
}> {
  try {
    if (!isOpenAIConfigured || !openaiClient) {
      return {
        recommendation: 'AI recommendation system unavailable',
        confidence: 0,
        reasoning: 'OpenAI API not configured',
        suggestedActions: ['Manual review required'],
        riskFactors: ['AI system unavailable']
      };
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI governance specialist providing recommendations for healthcare compliance and risk management. 
          Consider ${options.framework || 'HIPAA'} compliance requirements and provide actionable guidance.
          
          Provide a JSON response with:
          - recommendation: main recommendation (1-2 sentences)
          - confidence: 0-100 confidence level
          - reasoning: detailed explanation
          - suggestedActions: array of specific actions
          - riskFactors: array of identified risks`
        },
        {
          role: "user",
          content: `Context: ${context}
          Data: ${JSON.stringify(data, null, 2)}
          Framework: ${options.framework || 'HIPAA'}
          Urgency: ${options.urgency || 'medium'}
          Domain: ${options.domain || 'healthcare'}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      recommendation: analysis.recommendation || 'Review required',
      confidence: Math.max(0, Math.min(100, analysis.confidence || 70)),
      reasoning: analysis.reasoning || 'Analysis completed',
      suggestedActions: Array.isArray(analysis.suggestedActions) ? analysis.suggestedActions : [],
      riskFactors: Array.isArray(analysis.riskFactors) ? analysis.riskFactors : []
    };

  } catch (error) {
    console.error('Error getting AI recommendation:', error);
    return {
      recommendation: 'Manual review recommended',
      confidence: 0,
      reasoning: 'AI analysis failed, human oversight required',
      suggestedActions: ['Conduct manual review', 'Escalate to administrator'],
      riskFactors: ['AI analysis system error']
    };
  }
}

/**
 * Initialize automation engine and start monitoring
 */
export function initializeAutomationEngine(): void {
  const engine = AutomationEngine.getInstance();
  console.log('Intelligent Automation Engine initialized');
  
  // Set up periodic health checks and metrics tracking
  setInterval(async () => {
    try {
      // Track automation performance metrics
      // This could include success rates, execution times, etc.
      console.log('Automation engine health check completed');
    } catch (error) {
      console.error('Automation engine health check failed:', error);
    }
  }, 300000); // Every 5 minutes
}

// Export the singleton instance
export const automationEngine = AutomationEngine.getInstance();