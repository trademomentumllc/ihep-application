/**
 * Neural Governance Intelligence API Routes
 * 
 * RESTful endpoints for AI governance, risk assessment, and compliance monitoring
 */

import express, { Request, Response } from 'express';
import { 
  performRiskAssessment, 
  monitorCompliance, 
  getGovernanceDashboard,
  trackNeuralMetrics,
  logAiDecision,
  COMPLIANCE_FRAMEWORKS
} from '../services/neuralGovernance';
import { db } from '../db';
import { 
  aiRiskAssessments, 
  complianceMonitoring, 
  aiDecisionLogs, 
  neuralMetrics,
  automationRules,
  aiGovernanceConfig
} from '../../shared/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

const router = express.Router();

// Middleware for authentication
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware for admin access
const isAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user || (req.user as any).role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * GET /api/neural-governance/dashboard
 * Get comprehensive governance dashboard data
 */
router.get('/dashboard', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const dashboardData = await getGovernanceDashboard(userId);
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching governance dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch governance dashboard' });
  }
});

/**
 * POST /api/neural-governance/risk-assessment
 * Perform AI risk assessment
 */
router.post('/risk-assessment', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { assessmentType, entityId, entityType, entityData } = req.body;
    
    if (!assessmentType || !entityId || !entityType || !entityData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const assessment = await performRiskAssessment(
      assessmentType,
      entityId,
      entityType,
      entityData,
      req.user.id
    );

    res.json(assessment);
  } catch (error) {
    console.error('Error performing risk assessment:', error);
    res.status(500).json({ error: 'Failed to perform risk assessment' });
  }
});

/**
 * GET /api/neural-governance/risk-assessments
 * Get paginated risk assessments with filtering
 */
router.get('/risk-assessments', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      riskCategory, 
      entityType, 
      requiresReview 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = db.select().from(aiRiskAssessments);
    
    // Apply filters
    const conditions = [];
    if (riskCategory) {
      conditions.push(eq(aiRiskAssessments.riskCategory, riskCategory as string));
    }
    if (entityType) {
      conditions.push(eq(aiRiskAssessments.entityType, entityType as string));
    }
    if (requiresReview === 'true') {
      conditions.push(eq(aiRiskAssessments.requiresHumanReview, true));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const assessments = await query
      .orderBy(desc(aiRiskAssessments.createdAt))
      .limit(Number(limit))
      .offset(offset);
    
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching risk assessments:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessments' });
  }
});

/**
 * POST /api/neural-governance/compliance-monitoring
 * Monitor compliance for specific entity
 */
router.post('/compliance-monitoring', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { framework, entityType, entityId, entityData } = req.body;
    
    if (!framework || !entityType || !entityId || !entityData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const monitoring = await monitorCompliance(
      framework,
      entityType,
      entityId,
      entityData,
      req.user.id
    );

    res.json(monitoring);
  } catch (error) {
    console.error('Error monitoring compliance:', error);
    res.status(500).json({ error: 'Failed to monitor compliance' });
  }
});

/**
 * GET /api/neural-governance/compliance-status
 * Get current compliance status across all frameworks
 */
router.get('/compliance-status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { framework, severity, status } = req.query;
    
    let query = db.select().from(complianceMonitoring);
    
    const conditions = [];
    if (framework) {
      conditions.push(eq(complianceMonitoring.framework, framework as string));
    }
    if (severity) {
      conditions.push(eq(complianceMonitoring.severity, severity as string));
    }
    if (status) {
      conditions.push(eq(complianceMonitoring.complianceStatus, status as string));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const complianceRecords = await query
      .orderBy(desc(complianceMonitoring.createdAt))
      .limit(50);
    
    res.json(complianceRecords);
  } catch (error) {
    console.error('Error fetching compliance status:', error);
    res.status(500).json({ error: 'Failed to fetch compliance status' });
  }
});

/**
 * GET /api/neural-governance/compliance-frameworks
 * Get available compliance frameworks and their configurations
 */
router.get('/compliance-frameworks', isAuthenticated, (req: Request, res: Response) => {
  res.json(COMPLIANCE_FRAMEWORKS);
});

/**
 * POST /api/neural-governance/ai-decision
 * Log an AI decision with full audit trail
 */
router.post('/ai-decision', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { 
      decisionType, 
      entityType, 
      entityId, 
      inputData, 
      outputData, 
      decision, 
      reasoning, 
      confidence, 
      processingTime 
    } = req.body;
    
    if (!decisionType || !entityType || !entityId || !decision || !reasoning) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await logAiDecision(
      decisionType,
      entityType,
      entityId,
      inputData,
      outputData,
      decision,
      reasoning,
      confidence || 80,
      processingTime || 0,
      req.user.id
    );

    res.json({ success: true, message: 'AI decision logged successfully' });
  } catch (error) {
    console.error('Error logging AI decision:', error);
    res.status(500).json({ error: 'Failed to log AI decision' });
  }
});

/**
 * GET /api/neural-governance/ai-decisions
 * Get AI decision logs with filtering
 */
router.get('/ai-decisions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      decisionType, 
      entityType,
      startDate,
      endDate
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = db.select().from(aiDecisionLogs);
    
    const conditions = [];
    if (decisionType) {
      conditions.push(eq(aiDecisionLogs.decisionType, decisionType as string));
    }
    if (entityType) {
      conditions.push(eq(aiDecisionLogs.entityType, entityType as string));
    }
    if (startDate) {
      conditions.push(gte(aiDecisionLogs.createdAt, new Date(startDate as string)));
    }
    if (endDate) {
      conditions.push(lte(aiDecisionLogs.createdAt, new Date(endDate as string)));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const decisions = await query
      .orderBy(desc(aiDecisionLogs.createdAt))
      .limit(Number(limit))
      .offset(offset);
    
    res.json(decisions);
  } catch (error) {
    console.error('Error fetching AI decisions:', error);
    res.status(500).json({ error: 'Failed to fetch AI decisions' });
  }
});

/**
 * POST /api/neural-governance/neural-metrics
 * Track neural network performance metrics
 */
router.post('/neural-metrics', isAdmin, async (req: Request, res: Response) => {
  try {
    const { modelName, metricType, value, threshold, testDataset } = req.body;
    
    if (!modelName || !metricType || value === undefined || threshold === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await trackNeuralMetrics(modelName, metricType, value, threshold, testDataset);

    res.json({ success: true, message: 'Neural metrics tracked successfully' });
  } catch (error) {
    console.error('Error tracking neural metrics:', error);
    res.status(500).json({ error: 'Failed to track neural metrics' });
  }
});

/**
 * GET /api/neural-governance/neural-metrics
 * Get neural network performance metrics
 */
router.get('/neural-metrics', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { modelName, metricType, status } = req.query;
    
    let query = db.select().from(neuralMetrics);
    
    const conditions = [];
    if (modelName) {
      conditions.push(eq(neuralMetrics.modelName, modelName as string));
    }
    if (metricType) {
      conditions.push(eq(neuralMetrics.metricType, metricType as string));
    }
    if (status) {
      conditions.push(eq(neuralMetrics.status, status as string));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const metrics = await query
      .orderBy(desc(neuralMetrics.evaluationDate))
      .limit(100);
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching neural metrics:', error);
    res.status(500).json({ error: 'Failed to fetch neural metrics' });
  }
});

/**
 * GET /api/neural-governance/automation-rules
 * Get automation rules
 */
router.get('/automation-rules', isAdmin, async (req: Request, res: Response) => {
  try {
    const rules = await db.select()
      .from(automationRules)
      .orderBy(desc(automationRules.createdAt));
    
    res.json(rules);
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    res.status(500).json({ error: 'Failed to fetch automation rules' });
  }
});

/**
 * POST /api/neural-governance/automation-rules
 * Create new automation rule
 */
router.post('/automation-rules', isAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      triggerType, 
      triggerConditions, 
      actionType, 
      actionParameters,
      priority,
      riskLevel,
      requiresApproval 
    } = req.body;
    
    if (!name || !description || !triggerType || !actionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRule = await db.insert(automationRules).values({
      name,
      description,
      triggerType,
      triggerConditions: triggerConditions || {},
      actionType,
      actionParameters: actionParameters || {},
      priority: priority || 50,
      riskLevel: riskLevel || 'medium',
      requiresApproval: requiresApproval !== false,
      createdBy: req.user.id
    }).returning();

    res.json(newRule[0]);
  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({ error: 'Failed to create automation rule' });
  }
});

/**
 * PUT /api/neural-governance/automation-rules/:id
 * Update automation rule
 */
router.put('/automation-rules/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedRule = await db.update(automationRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(automationRules.id, ruleId))
      .returning();

    if (updatedRule.length === 0) {
      return res.status(404).json({ error: 'Automation rule not found' });
    }

    res.json(updatedRule[0]);
  } catch (error) {
    console.error('Error updating automation rule:', error);
    res.status(500).json({ error: 'Failed to update automation rule' });
  }
});

/**
 * GET /api/neural-governance/governance-config
 * Get AI governance configuration
 */
router.get('/governance-config', isAdmin, async (req: Request, res: Response) => {
  try {
    const configs = await db.select()
      .from(aiGovernanceConfig)
      .where(eq(aiGovernanceConfig.isActive, true))
      .limit(1);
    
    res.json(configs[0] || null);
  } catch (error) {
    console.error('Error fetching governance config:', error);
    res.status(500).json({ error: 'Failed to fetch governance config' });
  }
});

/**
 * POST /api/neural-governance/governance-config
 * Update AI governance configuration
 */
router.post('/governance-config', isAdmin, async (req: Request, res: Response) => {
  try {
    const config = req.body;
    
    // Deactivate existing configs
    await db.update(aiGovernanceConfig)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(aiGovernanceConfig.isActive, true));
    
    // Create new active config
    const newConfig = await db.insert(aiGovernanceConfig)
      .values({
        ...config,
        isActive: true
      })
      .returning();

    res.json(newConfig[0]);
  } catch (error) {
    console.error('Error updating governance config:', error);
    res.status(500).json({ error: 'Failed to update governance config' });
  }
});

export default router;