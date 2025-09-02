/**
 * Wellness Tips API Routes
 * 
 * Endpoints for AI-generated personalized wellness tips
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  generatePersonalizedWellnessTip, 
  getUserWellnessTips, 
  rateTip, 
  saveTipForLater 
} from '../services/wellnessTips';

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * POST /api/wellness-tips/generate
 * Generate a new personalized wellness tip
 */
router.post('/generate', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { category } = req.body;

    const tipData = await generatePersonalizedWellnessTip(userId, category);
    
    res.json({
      success: true,
      tip: tipData
    });
  } catch (error) {
    console.error('Error generating wellness tip:', error);
    res.status(500).json({
      error: 'Failed to generate wellness tip',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/wellness-tips
 * Get user's wellness tips
 */
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 5;

    const tips = await getUserWellnessTips(userId, limit);
    
    res.json({
      success: true,
      tips
    });
  } catch (error) {
    console.error('Error fetching wellness tips:', error);
    res.status(500).json({
      error: 'Failed to fetch wellness tips'
    });
  }
});

/**
 * POST /api/wellness-tips/:id/rate
 * Rate a wellness tip as helpful or not helpful
 */
router.post('/:id/rate', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const tipId = parseInt(req.params.id);
    const { helpful } = req.body;

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({
        error: 'helpful field must be a boolean'
      });
    }

    await rateTip(tipId, userId, helpful);
    
    res.json({
      success: true,
      message: 'Tip rating recorded'
    });
  } catch (error) {
    console.error('Error rating tip:', error);
    res.status(500).json({
      error: 'Failed to rate tip'
    });
  }
});

/**
 * POST /api/wellness-tips/:id/save
 * Save a wellness tip for later
 */
router.post('/:id/save', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const tipId = parseInt(req.params.id);

    await saveTipForLater(tipId, userId);
    
    res.json({
      success: true,
      message: 'Tip saved for later'
    });
  } catch (error) {
    console.error('Error saving tip:', error);
    res.status(500).json({
      error: 'Failed to save tip'
    });
  }
});

export default router;