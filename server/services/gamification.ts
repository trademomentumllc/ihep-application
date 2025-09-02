/**
 * Gamification Service
 * 
 * Manages the health engagement rewards program, including:
 * - Activity tracking and points awarding
 * - Achievement and badge unlocking
 * - Streak tracking and maintenance
 * - Reward redemption and point management
 */

import { db } from '../db';
import {
  healthActivities,
  userActivities,
  achievements,
  userAchievements,
  userPoints,
  pointsTransactions,
  rewards,
  userRewards,
  type UserPoints,
  type UserActivity,
  type Achievement
} from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Activity categories for health engagements
export enum ActivityCategory {
  PHYSICAL = 'physical',
  MENTAL = 'mental',
  MEDICATION = 'medication',
  APPOINTMENT = 'appointment',
  EDUCATION = 'education',
  SOCIAL = 'social'
}

// Time periods for streaks and frequency
export enum Frequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ONCE = 'once'
}

// Transaction types for point history
export enum TransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  EXPIRED = 'expired',
  BONUS = 'bonus',
  ADJUSTMENT = 'adjustment'
}

// Source types for transactions
export enum SourceType {
  ACTIVITY = 'activity',
  REWARD = 'reward',
  ACHIEVEMENT = 'achievement',
  ADMIN = 'admin',
  STREAK = 'streak'
}

/**
 * Record a completed health activity for a user and award points
 */
export async function recordActivity(
  userId: number,
  activityId: number,
  notes?: string,
  proofImageUrl?: string
): Promise<UserActivity> {
  // Start a transaction to ensure all operations succeed or fail together
  return await db.transaction(async (tx) => {
    // Get the activity to determine points value
    const activity = await tx.query.healthActivities.findFirst({
      where: eq(healthActivities.id, activityId)
    });

    if (!activity) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }

    // Check if user has already completed this activity today if it's a daily activity
    if (activity.frequency === Frequency.DAILY) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const existingActivity = await tx.query.userActivities.findFirst({
        where: and(
          eq(userActivities.userId, userId),
          eq(userActivities.activityId, activityId),
          gte(userActivities.completedAt, today),
          lte(userActivities.completedAt, tomorrow)
        )
      });

      if (existingActivity) {
        throw new Error(`User has already completed this daily activity today`);
      }
    }

    // Record the activity completion
    const [userActivity] = await tx
      .insert(userActivities)
      .values({
        userId,
        activityId,
        pointsEarned: activity.pointsValue,
        notes,
        proofImageUrl
      })
      .returning();

    // Update user points
    const userPointsRecord = await tx.query.userPoints.findFirst({
      where: eq(userPoints.userId, userId)
    });

    if (!userPointsRecord) {
      // Create a new user points record if it doesn't exist
      await tx.insert(userPoints).values({
        userId,
        totalPoints: activity.pointsValue,
        availablePoints: activity.pointsValue,
        lifetimePoints: activity.pointsValue,
        currentStreak: 1,
        longestStreak: 1
      });
    } else {
      // Update existing points record
      await tx
        .update(userPoints)
        .set({
          totalPoints: userPointsRecord.totalPoints + activity.pointsValue,
          availablePoints: userPointsRecord.availablePoints + activity.pointsValue,
          lifetimePoints: userPointsRecord.lifetimePoints + activity.pointsValue,
          lastActivity: new Date()
        })
        .where(eq(userPoints.userId, userId));
        
      // Update streak if necessary
      await updateUserStreak(tx, userId);
    }

    // Record points transaction
    await tx.insert(pointsTransactions).values({
      userId,
      amount: activity.pointsValue,
      type: TransactionType.EARNED,
      description: `Completed activity: ${activity.name}`,
      sourceId: userActivity.id,
      sourceType: SourceType.ACTIVITY
    });

    // Check for achievements
    await checkForAchievements(tx, userId);

    return userActivity;
  });
}

/**
 * Update a user's activity streak based on their recent activity
 */
async function updateUserStreak(tx: any, userId: number): Promise<void> {
  const userPointsRecord = await tx.query.userPoints.findFirst({
    where: eq(userPoints.userId, userId)
  });

  if (!userPointsRecord) return;

  const now = new Date();
  const lastUpdate = new Date(userPointsRecord.lastStreakUpdate);
  
  // Check if last activity was within last 24 hours
  const hoursSinceLastActivity = 
    (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  // Get activities completed yesterday
  const yesterdayActivities = await tx.query.userActivities.findMany({
    where: and(
      eq(userActivities.userId, userId),
      gte(userActivities.completedAt, yesterday),
      lte(userActivities.completedAt, now)
    )
  });

  if (hoursSinceLastActivity <= 36 && yesterdayActivities.length > 0) {
    // User has been active in the last day, increment streak
    const newStreak = userPointsRecord.currentStreak + 1;
    const newLongestStreak = Math.max(newStreak, userPointsRecord.longestStreak);
    
    await tx
      .update(userPoints)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastStreakUpdate: now
      })
      .where(eq(userPoints.userId, userId));
      
    // Award streak bonus if milestone reached (every 5 days)
    if (newStreak > 0 && newStreak % 5 === 0) {
      const bonusPoints = 25 * (newStreak / 5); // 25 points per 5-day streak
      
      await tx
        .update(userPoints)
        .set({
          totalPoints: userPointsRecord.totalPoints + bonusPoints,
          availablePoints: userPointsRecord.availablePoints + bonusPoints,
          lifetimePoints: userPointsRecord.lifetimePoints + bonusPoints
        })
        .where(eq(userPoints.userId, userId));
        
      // Record bonus transaction
      await tx.insert(pointsTransactions).values({
        userId,
        amount: bonusPoints,
        type: TransactionType.BONUS,
        description: `${newStreak}-day streak bonus!`,
        sourceType: SourceType.STREAK
      });
    }
  } else if (hoursSinceLastActivity > 36) {
    // User has broken their streak
    await tx
      .update(userPoints)
      .set({
        currentStreak: 1, // Reset to 1 since they're active today
        lastStreakUpdate: now
      })
      .where(eq(userPoints.userId, userId));
  }
}

/**
 * Check if a user has earned any new achievements based on their activities and points
 */
async function checkForAchievements(tx: any, userId: number): Promise<void> {
  // Get user's current points
  const userPointsRecord = await tx.query.userPoints.findFirst({
    where: eq(userPoints.userId, userId)
  });

  if (!userPointsRecord) return;

  // Get user's current achievements
  const userCurrentAchievements = await tx.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
    with: {
      achievement: true
    }
  });

  const earnedAchievementIds = userCurrentAchievements.map(ua => ua.achievementId);

  // Find all achievements the user qualifies for but hasn't earned yet
  const eligibleAchievements = await tx.query.achievements.findMany({
    where: and(
      eq(achievements.isActive, true),
      lte(achievements.pointsRequired, userPointsRecord.lifetimePoints),
      // Exclude already earned achievements
      sql`${achievements.id} NOT IN (${earnedAchievementIds.length > 0 ? earnedAchievementIds : [0]})`
    )
  });

  // Award any newly earned achievements
  for (const achievement of eligibleAchievements) {
    await tx.insert(userAchievements).values({
      userId,
      achievementId: achievement.id
    });

    // Add bonus points if applicable
    if (achievement.level > 1) { // Higher level achievements give bonus points
      const bonusPoints = achievement.level * 50; // 50 points per level
      
      await tx
        .update(userPoints)
        .set({
          totalPoints: userPointsRecord.totalPoints + bonusPoints,
          availablePoints: userPointsRecord.availablePoints + bonusPoints,
          lifetimePoints: userPointsRecord.lifetimePoints + bonusPoints
        })
        .where(eq(userPoints.userId, userId));
        
      // Record bonus transaction
      await tx.insert(pointsTransactions).values({
        userId,
        amount: bonusPoints,
        type: TransactionType.BONUS,
        description: `Achievement bonus: ${achievement.name}`,
        sourceId: achievement.id,
        sourceType: SourceType.ACHIEVEMENT
      });
    }
  }
}

/**
 * Get a user's current points balance and streak information
 */
export async function getUserPoints(userId: number): Promise<UserPoints> {
  // Get user points or create if not exists
  let userPointsRecord = await db.query.userPoints.findFirst({
    where: eq(userPoints.userId, userId)
  });

  if (!userPointsRecord) {
    // Create default points record
    const [newPointsRecord] = await db
      .insert(userPoints)
      .values({
        userId,
        totalPoints: 0,
        availablePoints: 0,
        lifetimePoints: 0,
        currentStreak: 0,
        longestStreak: 0
      })
      .returning();
      
    userPointsRecord = newPointsRecord;
  }

  return userPointsRecord;
}

/**
 * Get all available health activities that users can complete
 */
export async function getAvailableActivities(category?: string) {
  const query = category 
    ? and(eq(healthActivities.isActive, true), eq(healthActivities.category, category))
    : eq(healthActivities.isActive, true);
    
  return await db.query.healthActivities.findMany({
    where: query,
    orderBy: [desc(healthActivities.pointsValue)]
  });
}

/**
 * Get a user's completed activities with optional filtering
 */
export async function getUserActivities(
  userId: number, 
  startDate?: Date,
  endDate?: Date,
  category?: string
) {
  let query = eq(userActivities.userId, userId);
  
  if (startDate) {
    query = and(query, gte(userActivities.completedAt, startDate));
  }
  
  if (endDate) {
    query = and(query, lte(userActivities.completedAt, endDate));
  }

  const userActivityRecords = await db.query.userActivities.findMany({
    where: query,
    with: {
      activity: true,
    },
    orderBy: [desc(userActivities.completedAt)]
  });
  
  // If category filter is applied, filter after fetching to check activity category
  if (category) {
    return userActivityRecords.filter(record => record.activity.category === category);
  }
  
  return userActivityRecords;
}

/**
 * Get all achievements a user has earned
 */
export async function getUserAchievements(userId: number): Promise<Achievement[]> {
  const userAchievementRecords = await db.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
    with: {
      achievement: true,
    }
  });
  
  return userAchievementRecords.map(record => record.achievement);
}

/**
 * Get all available achievements that can be earned
 */
export async function getAllAchievements(category?: string) {
  const query = category 
    ? and(eq(achievements.isActive, true), eq(achievements.category, category))
    : eq(achievements.isActive, true);
    
  return await db.query.achievements.findMany({
    where: query,
    orderBy: [achievements.pointsRequired]
  });
}

/**
 * Redeem a reward using user points
 */
export async function redeemReward(userId: number, rewardId: number): Promise<any> {
  return await db.transaction(async (tx) => {
    // Get the reward
    const reward = await tx.query.rewards.findFirst({
      where: and(
        eq(rewards.id, rewardId),
        eq(rewards.isActive, true)
      )
    });

    if (!reward) {
      throw new Error(`Reward with ID ${rewardId} not found or is not active`);
    }

    // Check inventory if applicable
    if (reward.inventory !== null && reward.inventory <= 0) {
      throw new Error(`Reward is out of stock`);
    }

    // Get user points
    const userPointsRecord = await tx.query.userPoints.findFirst({
      where: eq(userPoints.userId, userId)
    });

    if (!userPointsRecord) {
      throw new Error(`User ${userId} has no points record`);
    }

    // Check if user has enough points
    if (userPointsRecord.availablePoints < reward.pointsCost) {
      throw new Error(`Insufficient points. Required: ${reward.pointsCost}, Available: ${userPointsRecord.availablePoints}`);
    }

    // Generate redemption code
    const redemptionCode = generateRedemptionCode(reward.category);

    // Create expiration date (30 days from now) for applicable rewards
    const expirationDate = ['discount', 'gift_card'].includes(reward.category) 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : null;

    // Create user reward record
    const [userReward] = await tx
      .insert(userRewards)
      .values({
        userId,
        rewardId,
        code: redemptionCode,
        status: 'active',
        expiresAt: expirationDate
      })
      .returning();

    // Deduct points
    await tx
      .update(userPoints)
      .set({
        availablePoints: userPointsRecord.availablePoints - reward.pointsCost,
        lastActivity: new Date()
      })
      .where(eq(userPoints.userId, userId));

    // Record transaction
    await tx.insert(pointsTransactions).values({
      userId,
      amount: -reward.pointsCost,
      type: TransactionType.SPENT,
      description: `Redeemed reward: ${reward.name}`,
      sourceId: reward.id,
      sourceType: SourceType.REWARD
    });

    // Update inventory if applicable
    if (reward.inventory !== null) {
      await tx
        .update(rewards)
        .set({
          inventory: reward.inventory - 1
        })
        .where(eq(rewards.id, reward.id));
    }

    return {
      ...userReward,
      reward: {
        name: reward.name,
        description: reward.description,
        category: reward.category,
        imageUrl: reward.imageUrl
      }
    };
  });
}

/**
 * Get all rewards available for redemption
 */
export async function getAvailableRewards(category?: string) {
  const query = category 
    ? and(eq(rewards.isActive, true), eq(rewards.category, category))
    : eq(rewards.isActive, true);
    
  return await db.query.rewards.findMany({
    where: query,
    orderBy: [rewards.pointsCost]
  });
}

/**
 * Get all rewards a user has redeemed
 */
export async function getUserRewards(userId: number, status?: 'active' | 'redeemed' | 'expired') {
  let query = eq(userRewards.userId, userId);
  
  if (status) {
    query = and(query, eq(userRewards.status, status));
  }
    
  return await db.query.userRewards.findMany({
    where: query,
    with: {
      reward: true,
    },
    orderBy: [desc(userRewards.earnedAt)]
  });
}

/**
 * Get a user's points transaction history
 */
export async function getPointsHistory(userId: number, limit: number = 20, offset: number = 0) {
  return await db.query.pointsTransactions.findMany({
    where: eq(pointsTransactions.userId, userId),
    orderBy: [desc(pointsTransactions.createdAt)],
    limit,
    offset
  });
}

/**
 * Generate a unique redemption code for rewards
 */
function generateRedemptionCode(category: string): string {
  const prefix = category.substring(0, 3).toUpperCase();
  const uniqueId = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${uniqueId}`;
}

/**
 * Initialize default activities and achievements if none exist
 */
export async function initializeGamificationDefaults() {
  // Check if any activities exist
  const existingActivities = await db.query.healthActivities.findMany({
    limit: 1
  });
  
  if (existingActivities.length === 0) {
    // Create default health activities
    await db.insert(healthActivities).values([
      // Physical activities
      {
        name: "Daily Exercise",
        description: "Complete at least 30 minutes of physical activity",
        category: ActivityCategory.PHYSICAL,
        pointsValue: 15,
        frequency: Frequency.DAILY,
      },
      {
        name: "Take 10,000 Steps",
        description: "Walk at least 10,000 steps in a day",
        category: ActivityCategory.PHYSICAL,
        pointsValue: 20,
        frequency: Frequency.DAILY,
      },
      {
        name: "Join a Group Fitness Class",
        description: "Participate in a group fitness session",
        category: ActivityCategory.PHYSICAL,
        pointsValue: 25,
        frequency: Frequency.WEEKLY,
      },
      
      // Mental health activities
      {
        name: "Meditation Session",
        description: "Complete at least 10 minutes of meditation",
        category: ActivityCategory.MENTAL,
        pointsValue: 15,
        frequency: Frequency.DAILY,
      },
      {
        name: "Stress Journal",
        description: "Record your thoughts and feelings in a journal",
        category: ActivityCategory.MENTAL,
        pointsValue: 10,
        frequency: Frequency.DAILY,
      },
      {
        name: "Connect with Support Group",
        description: "Attend or check in with your support group",
        category: ActivityCategory.MENTAL,
        pointsValue: 30,
        frequency: Frequency.WEEKLY,
      },
      
      // Medication activities
      {
        name: "Medication Adherence",
        description: "Take all prescribed medications on time",
        category: ActivityCategory.MEDICATION,
        pointsValue: 20,
        frequency: Frequency.DAILY,
      },
      {
        name: "Medication Refill",
        description: "Refill your prescriptions before running out",
        category: ActivityCategory.MEDICATION,
        pointsValue: 25,
        frequency: Frequency.MONTHLY,
      },
      
      // Appointment activities
      {
        name: "Attend Medical Appointment",
        description: "Complete a scheduled healthcare appointment",
        category: ActivityCategory.APPOINTMENT,
        pointsValue: 35,
        frequency: Frequency.ONCE,
      },
      {
        name: "Schedule Follow-up",
        description: "Schedule your next recommended appointment",
        category: ActivityCategory.APPOINTMENT,
        pointsValue: 15,
        frequency: Frequency.ONCE,
      },
      
      // Educational activities
      {
        name: "Read Health Article",
        description: "Read an educational article about health management",
        category: ActivityCategory.EDUCATION,
        pointsValue: 10,
        frequency: Frequency.DAILY,
      },
      {
        name: "Watch Educational Video",
        description: "Watch a video about health management",
        category: ActivityCategory.EDUCATION,
        pointsValue: 15,
        frequency: Frequency.DAILY,
      },
      {
        name: "Complete Health Assessment",
        description: "Take a health assessment quiz",
        category: ActivityCategory.EDUCATION,
        pointsValue: 25,
        frequency: Frequency.MONTHLY,
      },
      
      // Social activities
      {
        name: "Share Experience",
        description: "Share your health journey on community forums",
        category: ActivityCategory.SOCIAL,
        pointsValue: 20,
        frequency: Frequency.WEEKLY,
      },
      {
        name: "Support Other Members",
        description: "Reply to community posts with encouragement",
        category: ActivityCategory.SOCIAL,
        pointsValue: 15,
        frequency: Frequency.DAILY,
      }
    ]);
  }
  
  // Check if any achievements exist
  const existingAchievements = await db.query.achievements.findMany({
    limit: 1
  });
  
  if (existingAchievements.length === 0) {
    // Create default achievements
    await db.insert(achievements).values([
      // Physical activity achievements
      {
        name: "Exercise Beginner",
        description: "Complete 10 exercise activities",
        icon: "activity",
        level: 1,
        pointsRequired: 150,
        category: ActivityCategory.PHYSICAL,
      },
      {
        name: "Exercise Expert",
        description: "Complete 50 exercise activities",
        icon: "activity",
        level: 2,
        pointsRequired: 750,
        category: ActivityCategory.PHYSICAL,
      },
      {
        name: "Fitness Master",
        description: "Complete 100 exercise activities",
        icon: "award",
        level: 3,
        pointsRequired: 1500,
        category: ActivityCategory.PHYSICAL,
      },
      
      // Mental health achievements
      {
        name: "Mindfulness Beginner",
        description: "Complete 10 mental wellness activities",
        icon: "brain",
        level: 1,
        pointsRequired: 150,
        category: ActivityCategory.MENTAL,
      },
      {
        name: "Mindfulness Expert",
        description: "Complete 50 mental wellness activities",
        icon: "brain",
        level: 2,
        pointsRequired: 750,
        category: ActivityCategory.MENTAL,
      },
      {
        name: "Wellness Master",
        description: "Complete 100 mental wellness activities",
        icon: "award",
        level: 3,
        pointsRequired: 1500,
        category: ActivityCategory.MENTAL,
      },
      
      // Medication achievements
      {
        name: "Medication Manager",
        description: "Record 30 days of medication adherence",
        icon: "pill",
        level: 1,
        pointsRequired: 600,
        category: ActivityCategory.MEDICATION,
      },
      {
        name: "Treatment Expert",
        description: "Record 90 days of medication adherence",
        icon: "pill",
        level: 2,
        pointsRequired: 1800,
        category: ActivityCategory.MEDICATION,
      },
      {
        name: "Treatment Champion",
        description: "Record 180 days of medication adherence",
        icon: "star",
        level: 3,
        pointsRequired: 3600,
        category: ActivityCategory.MEDICATION,
      },
      
      // Appointment achievements
      {
        name: "Appointment Keeper",
        description: "Attend 5 healthcare appointments",
        icon: "calendar",
        level: 1,
        pointsRequired: 175,
        category: ActivityCategory.APPOINTMENT,
      },
      {
        name: "Healthcare Partner",
        description: "Attend 15 healthcare appointments",
        icon: "calendar",
        level: 2,
        pointsRequired: 525,
        category: ActivityCategory.APPOINTMENT,
      },
      
      // Educational achievements
      {
        name: "Health Student",
        description: "Complete 10 educational activities",
        icon: "book",
        level: 1,
        pointsRequired: 150,
        category: ActivityCategory.EDUCATION,
      },
      {
        name: "Health Scholar",
        description: "Complete 30 educational activities",
        icon: "graduation-cap",
        level: 2,
        pointsRequired: 450,
        category: ActivityCategory.EDUCATION,
      },
      
      // Streak achievements
      {
        name: "Consistency Starter",
        description: "Maintain a 7-day activity streak",
        icon: "flame",
        level: 1,
        pointsRequired: 100,
        category: "streak",
      },
      {
        name: "Consistency Builder",
        description: "Maintain a 30-day activity streak",
        icon: "flame",
        level: 2,
        pointsRequired: 500,
        category: "streak",
      },
      {
        name: "Consistency Champion",
        description: "Maintain a 90-day activity streak",
        icon: "trophy",
        level: 3,
        pointsRequired: 1500,
        category: "streak",
      },
      
      // Overall achievements
      {
        name: "Health Explorer",
        description: "Earn your first 100 points",
        icon: "compass",
        level: 1,
        pointsRequired: 100,
        category: "general",
      },
      {
        name: "Health Enthusiast",
        description: "Earn 1,000 total points",
        icon: "star",
        level: 2,
        pointsRequired: 1000,
        category: "general",
      },
      {
        name: "Health Champion",
        description: "Earn 5,000 total points",
        icon: "trophy",
        level: 3,
        pointsRequired: 5000,
        category: "general",
      }
    ]);
  }
  
  // Check if any rewards exist
  const existingRewards = await db.query.rewards.findMany({
    limit: 1
  });
  
  if (existingRewards.length === 0) {
    // Create default rewards
    await db.insert(rewards).values([
      {
        name: "Health Store Discount",
        description: "10% off your next purchase at partner health stores",
        category: "discount",
        pointsCost: 500,
        inventory: 100,
        imageUrl: "/rewards/discount.png",
        termsAndConditions: "Valid for 30 days. Cannot be combined with other offers."
      },
      {
        name: "Premium Content Access",
        description: "Unlock premium educational content for 30 days",
        category: "feature_unlock",
        pointsCost: 300,
        inventory: null, // Unlimited
        imageUrl: "/rewards/premium.png",
        termsAndConditions: "Access expires after 30 days."
      },
      {
        name: "Wellness Gift Card",
        description: "$25 gift card for health and wellness products",
        category: "gift_card",
        pointsCost: 2500,
        inventory: 50,
        imageUrl: "/rewards/gift-card.png",
        termsAndConditions: "Valid for one year from date of issue."
      },
      {
        name: "Meditation App Subscription",
        description: "One month free subscription to premium meditation app",
        category: "feature_unlock",
        pointsCost: 1000,
        inventory: 100,
        imageUrl: "/rewards/meditation.png",
        termsAndConditions: "New users only. Subscription will not auto-renew."
      },
      {
        name: "Health Champion Badge",
        description: "Exclusive profile badge for your account",
        category: "badge",
        pointsCost: 750,
        inventory: null, // Unlimited
        imageUrl: "/rewards/badge.png",
        termsAndConditions: "Badge will appear on your profile permanently."
      },
      {
        name: "Fitness Tracker Discount",
        description: "20% off select fitness trackers from our partners",
        category: "discount",
        pointsCost: 1500,
        inventory: 75,
        imageUrl: "/rewards/fitness.png",
        termsAndConditions: "Valid for 30 days. Applicable to select models only."
      },
      {
        name: "Healthy Recipe Book",
        description: "Digital cookbook with 50+ healthy recipes",
        category: "merchandise",
        pointsCost: 600,
        inventory: 200,
        imageUrl: "/rewards/recipes.png",
        termsAndConditions: "Digital download only. No refunds."
      },
      {
        name: "Premium Support Access",
        description: "Priority access to health coaches for one month",
        category: "feature_unlock",
        pointsCost: 2000,
        inventory: 25,
        imageUrl: "/rewards/support.png",
        termsAndConditions: "Limited to 5 sessions during the month of access."
      }
    ]);
  }
}