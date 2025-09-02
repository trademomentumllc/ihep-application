/**
 * Gamification Routes
 * 
 * API endpoints for the health engagement rewards program, including:
 * - Recording health activities
 * - Viewing and unlocking achievements
 * - Tracking points and streaks
 * - Redeeming rewards
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import * as gamificationService from '../services/gamification';

const router = express.Router();

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Initialize gamification database with default values
gamificationService.initializeGamificationDefaults().catch(err => {
  console.error('Failed to initialize gamification defaults:', err);
});

// Schema for recording a health activity
const recordActivitySchema = z.object({
  activityId: z.number(),
  notes: z.string().optional(),
  proofImageUrl: z.string().optional()
});

// Schema for redeeming a reward
const redeemRewardSchema = z.object({
  rewardId: z.number()
});

/**
 * GET /api/gamification/activities
 * Get all available health activities
 */
router.get('/activities', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const activities = await gamificationService.getAvailableActivities(
      category as string | undefined
    );
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ 
      message: "Failed to fetch activities", 
      error: (error as Error).message 
    });
  }
});

/**
 * POST /api/gamification/activities/record
 * Record a completed health activity
 */
router.post('/activities/record', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const validatedData = recordActivitySchema.parse(req.body);
    
    const result = await gamificationService.recordActivity(
      userId,
      validatedData.activityId,
      validatedData.notes,
      validatedData.proofImageUrl
    );
    
    res.status(201).json({
      success: true,
      message: "Activity recorded successfully",
      activity: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    
    console.error('Error recording activity:', error);
    res.status(500).json({ 
      message: "Failed to record activity", 
      error: (error as Error).message 
    });
  }
});

/**
 * GET /api/gamification/user/activities
 * Get a user's completed activities
 */
router.get('/user/activities', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { startDate, endDate, category } = req.query;
    
    const activities = await gamificationService.getUserActivities(
      userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      category as string | undefined
    );
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ 
      message: "Failed to fetch user activities", 
      error: (error as Error).message 
    });
  }
});

/**
 * GET /api/gamification/achievements
 * Get all available achievements
 */
router.get('/achievements', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const achievements = await gamificationService.getAllAchievements(
      category as string | undefined
    );
    
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ 
      message: "Failed to fetch achievements", 
      error: (error as Error).message 
    });
  }
});

/**
 * GET /api/gamification/user/achievements
 * Get a user's earned achievements
 */
router.get('/user/achievements', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const achievements = await gamificationService.getUserAchievements(userId);
    
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ 
      message: "Failed to fetch user achievements", 
      error: (error as Error).message 
    });
  }
});

/**
 * GET /api/gamification/user/points
 * Get a user's current points and streak information
 */
router.get('/user/points', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const points = await gamificationService.getUserPoints(userId);
    
    res.json(points);
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ 
      message: "Failed to fetch user points", 
      error: (error as Error).message 
    });
  }
});

/**
 * GET /api/gamification/user/points/history
 * Get a user's points transaction history
 */
router.get('/user/points/history', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const history = await gamificationService.getPointsHistory(userId, limit, offset);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching points history:', error);
    res.status(500).json({ 
      message: "Failed to fetch points history", 
      error: (error as Error).message 
    });
  }
});

/**
 * GET /api/gamification/rewards
 * Get all available rewards
 */
router.get('/rewards', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const rewards = await gamificationService.getAvailableRewards(
      category as string | undefined
    );
    
    res.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ 
      message: "Failed to fetch rewards", 
      error: (error as Error).message 
    });
  }
});

/**
 * POST /api/gamification/rewards/redeem
 * Redeem a reward using points
 */
router.post('/rewards/redeem', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const validatedData = redeemRewardSchema.parse(req.body);
    
    const result = await gamificationService.redeemReward(
      userId,
      validatedData.rewardId
    );
    
    res.status(201).json({
      success: true,
      message: "Reward redeemed successfully",
      reward: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    
    console.error('Error redeeming reward:', error);
    res.status(500).json({ 
      message: "Failed to redeem reward", 
      error: (error as Error).message 
    });
  }
});

/**
 * GET /api/gamification/user/rewards
 * Get a user's redeemed rewards
 */
router.get('/user/rewards', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { status } = req.query;
    
    const rewards = await gamificationService.getUserRewards(
      userId,
      status as 'active' | 'redeemed' | 'expired' | undefined
    );
    
    res.json(rewards);
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    res.status(500).json({ 
      message: "Failed to fetch user rewards", 
      error: (error as Error).message 
    });
  }
});

export default router;