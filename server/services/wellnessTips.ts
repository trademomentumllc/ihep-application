/**
 * Wellness Tips Service
 * 
 * Generates personalized wellness tips with AI-powered motivational messages
 * tailored to user health data and activity patterns
 */

import OpenAI from "openai";
import { db } from "../db";
import { wellnessTips, userPoints, userActivities, healthActivities } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { logAuditEvent } from "./auditLogger";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UserHealthProfile {
  userId: number;
  recentActivities: string[];
  currentStreak: number;
  totalPoints: number;
  preferredCategories: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

interface WellnessTipData {
  content: string;
  motivationalQuote: string;
  actionSteps: string[];
  category: string;
  tags: string[];
}

/**
 * Generate personalized wellness tip using AI
 */
export async function generatePersonalizedWellnessTip(
  userId: number,
  requestedCategory?: string
): Promise<WellnessTipData> {
  try {
    // Get user health profile
    const healthProfile = await getUserHealthProfile(userId);
    
    // Generate AI-powered wellness tip
    const prompt = createWellnessTipPrompt(healthProfile, requestedCategory);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a compassionate healthcare AI assistant specializing in HIV care and wellness. Generate personalized, encouraging wellness tips with motivational quotes and actionable steps. Always be supportive, understanding, and medically appropriate. Respond in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800
    });

    const tipData = JSON.parse(response.choices[0].message.content!);
    
    // Store the generated tip
    const savedTip = await saveTipToDatabase(userId, tipData);
    
    // Log the wellness tip generation for audit
    await logAuditEvent({
      userId,
      eventType: 'SYSTEM_EVENT',
      action: 'generate_wellness_tip',
      resourceType: 'wellness_tips',
      resourceId: savedTip.id.toString(),
      description: `Generated personalized wellness tip for category: ${tipData.category}`,
      ipAddress: '127.0.0.1', // Internal system
      success: true
    });

    return tipData;
  } catch (error) {
    console.error('Error generating wellness tip:', error);
    
    // Log the error
    await logAuditEvent({
      userId,
      eventType: 'SYSTEM_EVENT',
      action: 'generate_wellness_tip',
      resourceType: 'wellness_tips',
      resourceId: null,
      description: `Failed to generate wellness tip: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ipAddress: '127.0.0.1',
      success: false
    });

    throw new Error('Failed to generate personalized wellness tip');
  }
}

/**
 * Get user health profile for personalization
 */
async function getUserHealthProfile(userId: number): Promise<UserHealthProfile> {
  try {
    // Get user points and streak
    const userPointsData = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    // Get recent activities (last 7 days)
    const recentActivities = await db
      .select({
        activityName: healthActivities.name,
        category: healthActivities.category,
        completedAt: userActivities.completedAt
      })
      .from(userActivities)
      .innerJoin(healthActivities, eq(userActivities.activityId, healthActivities.id))
      .where(
        and(
          eq(userActivities.userId, userId),
          gte(userActivities.completedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .orderBy(desc(userActivities.completedAt))
      .limit(10);

    // Determine preferred categories based on activity history
    const categoryCount = recentActivities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Determine time of day (simplified)
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    return {
      userId,
      recentActivities: recentActivities.map(a => a.activityName),
      currentStreak: userPointsData[0]?.currentStreak || 0,
      totalPoints: userPointsData[0]?.totalPoints || 0,
      preferredCategories,
      timeOfDay
    };
  } catch (error) {
    console.error('Error getting user health profile:', error);
    // Return basic profile if data retrieval fails
    return {
      userId,
      recentActivities: [],
      currentStreak: 0,
      totalPoints: 0,
      preferredCategories: ['general'],
      timeOfDay: 'morning'
    };
  }
}

/**
 * Create AI prompt for wellness tip generation
 */
function createWellnessTipPrompt(
  profile: UserHealthProfile, 
  requestedCategory?: string
): string {
  const category = requestedCategory || profile.preferredCategories[0] || 'general';
  
  return `Generate a personalized wellness tip for an HIV patient with the following profile:

User Profile:
- Recent activities: ${profile.recentActivities.join(', ') || 'None recently'}
- Current streak: ${profile.currentStreak} days
- Total points earned: ${profile.totalPoints}
- Preferred categories: ${profile.preferredCategories.join(', ')}
- Time of day: ${profile.timeOfDay}
- Requested category: ${category}

Please generate a wellness tip that:
1. Is encouraging and supportive
2. Acknowledges their current progress (${profile.currentStreak} day streak)
3. Provides actionable steps they can take today
4. Includes an inspiring motivational quote
5. Is appropriate for HIV care and wellness

Respond in this JSON format:
{
  "content": "Main wellness tip content (2-3 sentences)",
  "motivationalQuote": "An inspiring quote relevant to health and wellness",
  "actionSteps": ["Step 1", "Step 2", "Step 3"],
  "category": "${category}",
  "tags": ["tag1", "tag2", "tag3"]
}`;
}

/**
 * Save generated tip to database
 */
async function saveTipToDatabase(userId: number, tipData: WellnessTipData) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Tips expire after 7 days

  const [savedTip] = await db
    .insert(wellnessTips)
    .values({
      userId,
      content: tipData.content,
      category: tipData.category,
      tags: tipData.tags,
      aiGenerated: true,
      isPersonalized: true,
      motivationalQuote: tipData.motivationalQuote,
      actionSteps: tipData.actionSteps,
      expiresAt,
      associatedDataPoints: {
        generatedAt: new Date().toISOString(),
        category: tipData.category
      }
    })
    .returning();

  return savedTip;
}

/**
 * Get user's wellness tips
 */
export async function getUserWellnessTips(userId: number, limit: number = 5) {
  return await db
    .select()
    .from(wellnessTips)
    .where(eq(wellnessTips.userId, userId))
    .orderBy(desc(wellnessTips.createdAt))
    .limit(limit);
}

/**
 * Mark tip as helpful or not helpful
 */
export async function rateTip(tipId: number, userId: number, wasHelpful: boolean) {
  await db
    .update(wellnessTips)
    .set({ 
      wasHelpful,
      interactionCount: 1 // Simplified increment
    })
    .where(
      and(
        eq(wellnessTips.id, tipId),
        eq(wellnessTips.userId, userId)
      )
    );

  await logAuditEvent({
    userId,
    eventType: 'PHI_MODIFICATION',
    action: 'rate_wellness_tip',
    resourceType: 'wellness_tips',
    resourceId: tipId.toString(),
    description: `User rated wellness tip as ${wasHelpful ? 'helpful' : 'not helpful'}`,
    ipAddress: '127.0.0.1',
    success: true
  });
}

/**
 * Save tip for later
 */
export async function saveTipForLater(tipId: number, userId: number) {
  await db
    .update(wellnessTips)
    .set({ savedByUser: true })
    .where(
      and(
        eq(wellnessTips.id, tipId),
        eq(wellnessTips.userId, userId)
      )
    );
}