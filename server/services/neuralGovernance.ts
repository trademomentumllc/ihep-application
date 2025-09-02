/**
 * Neural Governance Intelligence Service
 * 
 * Comprehensive AI governance platform providing:
 * - Intelligent risk assessment and mitigation
 * - Real-time compliance monitoring across multiple frameworks
 * - Automated decision logging and audit trails
 * - Neural network performance tracking
 * - Intelligent automation with human oversight
 */

import { db } from '../db';
import { 
  aiGovernanceConfig, 
  aiRiskAssessments, 
  complianceMonitoring, 
  aiDecisionLogs, 
  neuralMetrics, 
  automationRules,
  auditLogs,
  InsertAiRiskAssessment,
  InsertComplianceMonitoring,
  InsertAiDecisionLog,
  InsertNeuralMetric
} from '../../shared/schema';
import { sql, eq, and, gte, lte, desc } from 'drizzle-orm';
import OpenAI from 'openai';
import { logAuditEvent, AuditEventType } from './auditLogger';

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
  console.error("Error initializing OpenAI for Neural Governance:", error);
}

// Compliance frameworks configuration
const COMPLIANCE_FRAMEWORKS = {
  HIPAA: {
    name: 'Health Insurance Portability and Accountability Act',
    categories: ['PHI_protection', 'access_controls', 'audit_trails', 'breach_notification'],
    riskThresholds: { low: 20, medium: 50, high: 80 }
  },
  GDPR: {
    name: 'General Data Protection Regulation',
    categories: ['data_minimization', 'consent_management', 'right_to_erasure', 'data_portability'],
    riskThresholds: { low: 25, medium: 60, high: 85 }
  },
  SOX: {
    name: 'Sarbanes-Oxley Act',
    categories: ['financial_reporting', 'internal_controls', 'data_integrity', 'audit_compliance'],
    riskThresholds: { low: 15, medium: 45, high: 75 }
  },
  FDA_21CFR11: {
    name: 'FDA 21 CFR Part 11',
    categories: ['electronic_records', 'electronic_signatures', 'system_validation', 'audit_trails'],
    riskThresholds: { low: 30, medium: 65, high: 90 }
  }
};

/**
 * Perform comprehensive AI risk assessment
 */
export async function performRiskAssessment(
  assessmentType: string,
  entityId: string,
  entityType: string,
  entityData: any,
  userId?: number
): Promise<{
  riskScore: number;
  riskCategory: string;
  identifiedRisks: string[];
  mitigationStrategies: string[];
  complianceViolations: string[];
  requiresHumanReview: boolean;
  confidence: number;
}> {
  const startTime = Date.now();
  
  try {
    if (!isOpenAIConfigured || !openaiClient) {
      // Fallback assessment without AI
      return {
        riskScore: 50,
        riskCategory: 'medium',
        identifiedRisks: ['AI assessment unavailable'],
        mitigationStrategies: ['Manual review required'],
        complianceViolations: [],
        requiresHumanReview: true,
        confidence: 0
      };
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI governance specialist performing risk assessment for healthcare systems. 
          Analyze the provided content/data for potential risks across these dimensions:
          - Healthcare data privacy and security risks
          - Regulatory compliance violations (HIPAA, GDPR, FDA)
          - Ethical AI concerns and bias detection
          - Content appropriateness and medical accuracy
          - System security and access control risks
          
          Provide a JSON response with:
          - riskScore: 0-100 (higher = more risk)
          - riskCategory: "low", "medium", "high", "critical"
          - identifiedRisks: array of specific risk descriptions
          - mitigationStrategies: array of recommended mitigation actions
          - complianceViolations: array of potential violations
          - requiresHumanReview: boolean
          - confidence: 0-100 confidence in assessment`
        },
        {
          role: "user",
          content: `Assessment Type: ${assessmentType}
          Entity Type: ${entityType}
          Entity ID: ${entityId}
          Data to assess: ${JSON.stringify(entityData, null, 2)}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const processingTime = Date.now() - startTime;
    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Validate and normalize the response
    const riskScore = Math.max(0, Math.min(100, analysis.riskScore || 50));
    const riskCategory = ['low', 'medium', 'high', 'critical'].includes(analysis.riskCategory) 
      ? analysis.riskCategory : 'medium';
    
    const result = {
      riskScore,
      riskCategory,
      identifiedRisks: Array.isArray(analysis.identifiedRisks) ? analysis.identifiedRisks : [],
      mitigationStrategies: Array.isArray(analysis.mitigationStrategies) ? analysis.mitigationStrategies : [],
      complianceViolations: Array.isArray(analysis.complianceViolations) ? analysis.complianceViolations : [],
      requiresHumanReview: analysis.requiresHumanReview || riskScore > 70,
      confidence: Math.max(0, Math.min(100, analysis.confidence || 80))
    };

    // Store the risk assessment
    await db.insert(aiRiskAssessments).values({
      assessmentType,
      entityId,
      entityType,
      riskScore,
      riskCategory,
      identifiedRisks: result.identifiedRisks,
      mitigationStrategies: result.mitigationStrategies,
      complianceViolations: result.complianceViolations,
      autoApproved: riskScore < 30 && !result.requiresHumanReview,
      requiresHumanReview: result.requiresHumanReview,
      aiModel: "gpt-4o",
      confidence: result.confidence,
      processingTime
    });

    // Log audit event
    if (userId) {
      await logAuditEvent({
        userId,
        eventType: AuditEventType.SYSTEM_EVENT,
        resourceType: 'risk_assessment',
        resourceId: entityId,
        action: 'ai_risk_assessment',
        description: `AI risk assessment performed for ${entityType} with score ${riskScore}`,
        ipAddress: 'system',
        success: true,
        additionalInfo: { riskScore, riskCategory, confidence: result.confidence }
      });
    }

    return result;

  } catch (error) {
    console.error('Error in AI risk assessment:', error);
    
    // Return conservative assessment on error
    return {
      riskScore: 75,
      riskCategory: 'high',
      identifiedRisks: ['Assessment system error - manual review required'],
      mitigationStrategies: ['Immediate human review and approval required'],
      complianceViolations: ['Unable to verify compliance'],
      requiresHumanReview: true,
      confidence: 0
    };
  }
}

/**
 * Monitor compliance across multiple frameworks
 */
export async function monitorCompliance(
  framework: string,
  entityType: string,
  entityId: string,
  entityData: any,
  userId?: number
): Promise<{
  complianceStatus: string;
  violations: string[];
  recommendedActions: string[];
  riskLevel: number;
  autoRemediated: boolean;
}> {
  try {
    const frameworkConfig = COMPLIANCE_FRAMEWORKS[framework as keyof typeof COMPLIANCE_FRAMEWORKS];
    if (!frameworkConfig) {
      throw new Error(`Unknown compliance framework: ${framework}`);
    }

    let violations: string[] = [];
    let recommendedActions: string[] = [];
    let riskLevel = 0;
    let autoRemediated = false;

    if (isOpenAIConfigured && openaiClient) {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a compliance monitoring specialist for ${frameworkConfig.name}. 
            Analyze the provided data for compliance violations in these categories: ${frameworkConfig.categories.join(', ')}.
            
            Provide a JSON response with:
            - violations: array of specific violation descriptions
            - recommendedActions: array of remediation actions
            - riskLevel: 0-100 compliance risk score
            - canAutoRemediate: boolean if violations can be automatically fixed`
          },
          {
            role: "user",
            content: `Framework: ${framework}
            Entity Type: ${entityType}
            Entity ID: ${entityId}
            Data: ${JSON.stringify(entityData, null, 2)}`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      violations = Array.isArray(analysis.violations) ? analysis.violations : [];
      recommendedActions = Array.isArray(analysis.recommendedActions) ? analysis.recommendedActions : [];
      riskLevel = Math.max(0, Math.min(100, analysis.riskLevel || 0));
      autoRemediated = analysis.canAutoRemediate && violations.length === 0;
    }

    // Determine compliance status
    let complianceStatus = 'compliant';
    if (violations.length > 0) {
      if (riskLevel >= frameworkConfig.riskThresholds.high) {
        complianceStatus = 'violation';
      } else if (riskLevel >= frameworkConfig.riskThresholds.medium) {
        complianceStatus = 'warning';
      } else {
        complianceStatus = 'under_review';
      }
    }

    // Store compliance monitoring record
    await db.insert(complianceMonitoring).values({
      framework,
      category: frameworkConfig.categories[0], // Primary category
      entityType,
      entityId,
      complianceStatus,
      violationType: violations.length > 0 ? violations[0] : null,
      severity: riskLevel >= 80 ? 'critical' : riskLevel >= 60 ? 'high' : riskLevel >= 40 ? 'medium' : 'low',
      description: `Compliance monitoring for ${framework} framework`,
      recommendedActions,
      autoRemediated,
      riskLevel,
      businessImpact: riskLevel >= 70 ? 'High impact - immediate attention required' : 'Monitor and review',
      regulatoryReporting: riskLevel >= 80
    });

    // Log audit event
    if (userId) {
      await logAuditEvent({
        userId,
        eventType: AuditEventType.SYSTEM_EVENT,
        resourceType: 'compliance_monitoring',
        resourceId: entityId,
        action: 'compliance_check',
        description: `Compliance monitoring performed for ${framework} framework`,
        ipAddress: 'system',
        success: true,
        additionalInfo: { framework, complianceStatus, riskLevel, violations: violations.length }
      });
    }

    return {
      complianceStatus,
      violations,
      recommendedActions,
      riskLevel,
      autoRemediated
    };

  } catch (error) {
    console.error('Error in compliance monitoring:', error);
    return {
      complianceStatus: 'under_review',
      violations: ['Compliance monitoring system error'],
      recommendedActions: ['Manual compliance review required'],
      riskLevel: 100,
      autoRemediated: false
    };
  }
}

/**
 * Log AI decision with full audit trail
 */
export async function logAiDecision(
  decisionType: string,
  entityType: string,
  entityId: string,
  inputData: any,
  outputData: any,
  decision: string,
  reasoning: string,
  confidence: number,
  processingTime: number,
  userId?: number
): Promise<void> {
  try {
    // Detect potential bias in the decision
    let biasScore = 0;
    let fairnessMetrics = {};

    if (isOpenAIConfigured && openaiClient) {
      try {
        const biasAnalysis = await openaiClient.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Analyze the AI decision for potential bias. Provide a JSON response with:
              - biasScore: 0-100 (0 = no bias detected, 100 = high bias)
              - fairnessMetrics: object with fairness analysis`
            },
            {
              role: "user",
              content: `Decision: ${decision}
              Reasoning: ${reasoning}
              Input Data: ${JSON.stringify(inputData)}
              Output Data: ${JSON.stringify(outputData)}`
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(biasAnalysis.choices[0].message.content || '{}');
        biasScore = Math.max(0, Math.min(100, analysis.biasScore || 0));
        fairnessMetrics = analysis.fairnessMetrics || {};
      } catch (biasError) {
        console.warn('Bias analysis failed, continuing without it:', biasError);
      }
    }

    // Store the AI decision log
    await db.insert(aiDecisionLogs).values({
      decisionType,
      entityType,
      entityId,
      inputData,
      outputData,
      aiModel: "gpt-4o",
      modelVersion: "2024-05-13",
      confidence,
      processingTime,
      decision,
      reasoning,
      biasScore,
      fairnessMetrics,
      auditTrail: {
        timestamp: new Date().toISOString(),
        userId,
        systemInfo: {
          nodeVersion: process.version,
          platform: process.platform
        }
      }
    });

    // Log audit event
    if (userId) {
      await logAuditEvent({
        userId,
        eventType: AuditEventType.SYSTEM_EVENT,
        resourceType: 'ai_decision',
        resourceId: entityId,
        action: 'ai_decision_logged',
        description: `AI decision logged for ${decisionType}`,
        ipAddress: 'system',
        success: true,
        additionalInfo: { 
          decisionType, 
          confidence, 
          biasScore, 
          processingTime 
        }
      });
    }

  } catch (error) {
    console.error('Error logging AI decision:', error);
    throw error;
  }
}

/**
 * Track neural network performance metrics
 */
export async function trackNeuralMetrics(
  modelName: string,
  metricType: string,
  value: number,
  threshold: number,
  testDataset?: string
): Promise<void> {
  try {
    const status = value >= threshold ? 'passing' : 
                  value >= (threshold * 0.8) ? 'warning' : 'failing';
    
    // Determine performance trend by comparing with recent metrics
    let performanceTrend = 'stable';
    try {
      const recentMetrics = await db
        .select()
        .from(neuralMetrics)
        .where(
          and(
            eq(neuralMetrics.modelName, modelName),
            eq(neuralMetrics.metricType, metricType)
          )
        )
        .orderBy(desc(neuralMetrics.evaluationDate))
        .limit(5);

      if (recentMetrics.length > 1) {
        const recentAverage = recentMetrics.slice(1).reduce((sum, metric) => sum + metric.value, 0) / (recentMetrics.length - 1);
        if (value > recentAverage * 1.05) {
          performanceTrend = 'improving';
        } else if (value < recentAverage * 0.95) {
          performanceTrend = 'declining';
        }
      }
    } catch (trendError) {
      console.warn('Could not determine performance trend:', trendError);
    }

    await db.insert(neuralMetrics).values({
      modelName,
      metricType,
      value: Math.round(value * 100), // Store as percentage * 100
      threshold: Math.round(threshold * 100),
      status,
      testDataset,
      performanceTrend,
      alertGenerated: status === 'failing',
      notes: status === 'failing' ? 'Performance below threshold - investigation required' : undefined
    });

    console.log(`Neural metric tracked: ${modelName} ${metricType} = ${value} (${status})`);

  } catch (error) {
    console.error('Error tracking neural metrics:', error);
    throw error;
  }
}

/**
 * Get comprehensive governance dashboard data
 */
export async function getGovernanceDashboard(userId: number): Promise<{
  riskAssessments: {
    total: number;
    byCategory: Record<string, number>;
    pendingReview: number;
  };
  complianceStatus: {
    byFramework: Record<string, { compliant: number; violations: number; warnings: number }>;
    criticalViolations: number;
  };
  neuralPerformance: {
    modelsTracked: number;
    averagePerformance: number;
    alertsGenerated: number;
  };
  automationMetrics: {
    activeRules: number;
    executionsToday: number;
    successRate: number;
  };
}> {
  try {
    // Risk assessments summary
    const riskAssessmentStats = await db
      .select({
        riskCategory: aiRiskAssessments.riskCategory,
        count: sql<number>`count(*)`
      })
      .from(aiRiskAssessments)
      .groupBy(aiRiskAssessments.riskCategory);

    const pendingReviewCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiRiskAssessments)
      .where(eq(aiRiskAssessments.requiresHumanReview, true));

    // Compliance status summary
    const complianceStats = await db
      .select({
        framework: complianceMonitoring.framework,
        complianceStatus: complianceMonitoring.complianceStatus,
        count: sql<number>`count(*)`
      })
      .from(complianceMonitoring)
      .groupBy(complianceMonitoring.framework, complianceMonitoring.complianceStatus);

    const criticalViolations = await db
      .select({ count: sql<number>`count(*)` })
      .from(complianceMonitoring)
      .where(eq(complianceMonitoring.severity, 'critical'));

    // Neural performance metrics
    const neuralStats = await db
      .select({
        modelName: neuralMetrics.modelName,
        avgValue: sql<number>`avg(${neuralMetrics.value})`,
        status: neuralMetrics.status
      })
      .from(neuralMetrics)
      .groupBy(neuralMetrics.modelName, neuralMetrics.status);

    const alertCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(neuralMetrics)
      .where(eq(neuralMetrics.alertGenerated, true));

    // Automation metrics
    const automationStats = await db
      .select({
        count: sql<number>`count(*)`,
        avgSuccessRate: sql<number>`avg(${automationRules.successRate})`,
        totalExecutions: sql<number>`sum(${automationRules.executionCount})`
      })
      .from(automationRules)
      .where(eq(automationRules.isActive, true));

    // Process the data
    const riskByCategory: Record<string, number> = {};
    riskAssessmentStats.forEach(stat => {
      riskByCategory[stat.riskCategory] = stat.count;
    });

    const complianceByFramework: Record<string, { compliant: number; violations: number; warnings: number }> = {};
    complianceStats.forEach(stat => {
      if (!complianceByFramework[stat.framework]) {
        complianceByFramework[stat.framework] = { compliant: 0, violations: 0, warnings: 0 };
      }
      if (stat.complianceStatus === 'compliant') {
        complianceByFramework[stat.framework].compliant = stat.count;
      } else if (stat.complianceStatus === 'violation') {
        complianceByFramework[stat.framework].violations = stat.count;
      } else if (stat.complianceStatus === 'warning') {
        complianceByFramework[stat.framework].warnings = stat.count;
      }
    });

    return {
      riskAssessments: {
        total: Object.values(riskByCategory).reduce((sum, count) => sum + count, 0),
        byCategory: riskByCategory,
        pendingReview: pendingReviewCount[0]?.count || 0
      },
      complianceStatus: {
        byFramework: complianceByFramework,
        criticalViolations: criticalViolations[0]?.count || 0
      },
      neuralPerformance: {
        modelsTracked: new Set(neuralStats.map(s => s.modelName)).size,
        averagePerformance: neuralStats.length > 0 ? 
          neuralStats.reduce((sum, s) => sum + s.avgValue, 0) / neuralStats.length / 100 : 0,
        alertsGenerated: alertCount[0]?.count || 0
      },
      automationMetrics: {
        activeRules: automationStats[0]?.count || 0,
        executionsToday: automationStats[0]?.totalExecutions || 0,
        successRate: automationStats[0]?.avgSuccessRate || 0
      }
    };

  } catch (error) {
    console.error('Error generating governance dashboard:', error);
    throw error;
  }
}

// Export the service functions
export {
  COMPLIANCE_FRAMEWORKS
};