/**
 * Healthcare AI Assistant Service
 * 
 * Specialized AI that guides patients to relevant programs, groups, and professionals
 * without providing direct medical advice. Integrates with neural governance for
 * compliance and safety monitoring.
 */

import OpenAI from 'openai';
import { db } from '../db';
import { 
  resources, 
  communityGroups, 
  events,
  users,
  educationalContent,
  healthActivities
} from '../../shared/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';
import { performRiskAssessment, monitorCompliance, logAiDecision } from './neuralGovernance';
import { automationEngine } from './intelligentAutomation';

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openaiClient: OpenAI | null = null;
let isOpenAIConfigured = false;

try {
  if (OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
    isOpenAIConfigured = true;
    console.log("Healthcare AI Assistant initialized successfully");
  } else {
    console.warn("Warning: OPENAI_API_KEY is not set. Healthcare AI features will not be available.");
  }
} catch (error) {
  console.error("Error initializing Healthcare AI Assistant:", error);
}

// Healthcare specialization areas
const HEALTHCARE_SPECIALIZATIONS = {
  mental_health: {
    keywords: ['anxiety', 'depression', 'stress', 'mood', 'therapy', 'counseling', 'psychological', 'emotional'],
    professional_types: ['psychologist', 'psychiatrist', 'therapist', 'counselor', 'mental health specialist'],
    program_categories: ['Mental Health', 'Counseling', 'Support Groups', 'Therapy']
  },
  chronic_conditions: {
    keywords: ['diabetes', 'hypertension', 'heart disease', 'arthritis', 'chronic pain', 'autoimmune'],
    professional_types: ['endocrinologist', 'cardiologist', 'rheumatologist', 'internist', 'specialist'],
    program_categories: ['Chronic Care', 'Disease Management', 'Support Groups', 'Education']
  },
  preventive_care: {
    keywords: ['screening', 'prevention', 'wellness', 'checkup', 'vaccination', 'health maintenance'],
    professional_types: ['primary care physician', 'family doctor', 'internist', 'preventive medicine'],
    program_categories: ['Preventive Care', 'Wellness', 'Health Screening', 'Education']
  },
  nutrition_fitness: {
    keywords: ['nutrition', 'diet', 'weight', 'exercise', 'fitness', 'obesity', 'eating'],
    professional_types: ['nutritionist', 'dietitian', 'fitness trainer', 'wellness coach'],
    program_categories: ['Nutrition', 'Fitness', 'Weight Management', 'Wellness']
  },
  substance_abuse: {
    keywords: ['addiction', 'substance abuse', 'alcohol', 'drugs', 'recovery', 'detox'],
    professional_types: ['addiction specialist', 'substance abuse counselor', 'recovery coach'],
    program_categories: ['Addiction Recovery', 'Support Groups', 'Rehabilitation', 'Counseling']
  },
  elderly_care: {
    keywords: ['senior', 'elderly', 'geriatric', 'aging', 'retirement', 'medicare'],
    professional_types: ['geriatrician', 'elder care specialist', 'gerontologist'],
    program_categories: ['Senior Care', 'Geriatrics', 'Elder Support', 'Age-Related Health']
  }
};

interface HealthcareRecommendation {
  type: 'resource' | 'group' | 'event' | 'education' | 'professional';
  id: number;
  title: string;
  description: string;
  category: string;
  relevanceScore: number;
  contactInfo?: string;
  location?: string;
  nextSteps: string[];
}

interface AIResponse {
  message: string;
  recommendations: HealthcareRecommendation[];
  disclaimers: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  followUpQuestions: string[];
  specialization: string;
}

/**
 * Main healthcare AI assistant function
 */
export async function getHealthcareGuidance(
  userQuery: string,
  userId?: number,
  conversationHistory: string[] = []
): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    if (!isOpenAIConfigured || !openaiClient) {
      return {
        message: "I apologize, but the AI guidance system is currently unavailable. Please contact our support team or speak directly with a healthcare professional for assistance.",
        recommendations: [],
        disclaimers: ["AI system unavailable - please contact healthcare provider"],
        urgencyLevel: 'medium',
        followUpQuestions: [],
        specialization: 'general'
      };
    }

    // Perform risk assessment on the query
    const riskAssessment = await performRiskAssessment(
      'healthcare_query',
      `query_${Date.now()}`,
      'user_query',
      { query: userQuery, userId, timestamp: new Date() },
      userId
    );

    // Monitor compliance with healthcare guidance regulations
    await monitorCompliance(
      'HIPAA',
      'healthcare_ai_interaction',
      `interaction_${Date.now()}`,
      { query: userQuery, userId },
      userId
    );

    // Analyze the query to determine specialization and urgency
    const queryAnalysis = await analyzeHealthcareQuery(userQuery, conversationHistory);
    
    // Get relevant healthcare resources
    const recommendations = await findRelevantHealthcareResources(
      userQuery,
      queryAnalysis.specialization,
      queryAnalysis.urgencyLevel
    );

    // Generate AI response
    const aiResponse = await generateHealthcareResponse(
      userQuery,
      queryAnalysis,
      recommendations,
      riskAssessment
    );

    // Log the AI decision
    const processingTime = Date.now() - startTime;
    await logAiDecision(
      'healthcare_guidance',
      'user_query',
      `query_${Date.now()}`,
      { query: userQuery, userId },
      aiResponse,
      'guidance_provided',
      `Healthcare guidance provided for ${queryAnalysis.specialization} query`,
      queryAnalysis.confidence,
      processingTime,
      userId
    );

    // Trigger automation rules if needed
    await automationEngine.evaluateTrigger(
      'healthcare_query',
      {
        query: userQuery,
        urgencyLevel: aiResponse.urgencyLevel,
        specialization: aiResponse.specialization,
        userId
      },
      userId
    );

    return aiResponse;

  } catch (error) {
    console.error('Error in healthcare AI guidance:', error);
    
    return {
      message: "I apologize, but I'm experiencing technical difficulties. For your safety and to ensure you receive proper guidance, please contact a healthcare professional directly or reach out to our support team.",
      recommendations: [],
      disclaimers: ["Technical error - please contact healthcare provider immediately"],
      urgencyLevel: 'medium',
      followUpQuestions: [],
      specialization: 'general'
    };
  }
}

/**
 * Analyze healthcare query to determine specialization and urgency
 */
async function analyzeHealthcareQuery(
  query: string,
  conversationHistory: string[]
): Promise<{
  specialization: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  confidence: number;
  keyTopics: string[];
  medicalTerms: string[];
}> {
  try {
    const completion = await openaiClient!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a healthcare AI triage specialist. Analyze user queries to determine:
          1. Healthcare specialization area (mental_health, chronic_conditions, preventive_care, nutrition_fitness, substance_abuse, elderly_care, or general)
          2. Urgency level (low, medium, high, emergency)
          3. Key health topics mentioned
          4. Medical terms that require professional interpretation
          
          IMPORTANT: If the query suggests emergency symptoms (chest pain, severe breathing problems, suicide ideation, severe injury), mark as emergency.
          
          Provide JSON response with:
          - specialization: primary area of concern
          - urgencyLevel: assessment of urgency
          - confidence: 0-100 confidence in analysis
          - keyTopics: array of main health topics
          - medicalTerms: array of medical terms that need professional interpretation`
        },
        {
          role: "user",
          content: `Query: ${query}
          
          Previous conversation: ${conversationHistory.join('\n')}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      specialization: analysis.specialization || 'general',
      urgencyLevel: analysis.urgencyLevel || 'medium',
      confidence: Math.max(0, Math.min(100, analysis.confidence || 80)),
      keyTopics: Array.isArray(analysis.keyTopics) ? analysis.keyTopics : [],
      medicalTerms: Array.isArray(analysis.medicalTerms) ? analysis.medicalTerms : []
    };

  } catch (error) {
    console.error('Error analyzing healthcare query:', error);
    return {
      specialization: 'general',
      urgencyLevel: 'medium',
      confidence: 0,
      keyTopics: [],
      medicalTerms: []
    };
  }
}

/**
 * Find relevant healthcare resources based on query and specialization
 */
async function findRelevantHealthcareResources(
  query: string,
  specialization: string,
  urgencyLevel: string
): Promise<HealthcareRecommendation[]> {
  const recommendations: HealthcareRecommendation[] = [];
  
  try {
    const spec = HEALTHCARE_SPECIALIZATIONS[specialization as keyof typeof HEALTHCARE_SPECIALIZATIONS];
    const searchTerms = spec?.keywords || [];
    
    // Find relevant healthcare resources
    const relevantResources = await db
      .select()
      .from(resources)
      .where(
        or(
          ...searchTerms.map(term => like(resources.description, `%${term}%`)),
          ...searchTerms.map(term => like(resources.name, `%${term}%`)),
          ...(spec?.program_categories || []).map(cat => like(resources.category, `%${cat}%`))
        )
      )
      .limit(5);

    // Convert resources to recommendations
    for (const resource of relevantResources) {
      recommendations.push({
        type: 'resource',
        id: resource.id,
        title: resource.name,
        description: resource.description,
        category: resource.category,
        relevanceScore: calculateRelevanceScore(query, resource.description),
        contactInfo: resource.contactInfo,
        location: resource.address ? `${resource.address}, ${resource.city}, ${resource.state}` : undefined,
        nextSteps: [
          'Contact the facility to schedule an appointment',
          'Verify insurance coverage and requirements',
          'Prepare your medical history and current medications list'
        ]
      });
    }

    // Find relevant community groups
    const relevantGroups = await db
      .select()
      .from(communityGroups)
      .where(
        or(
          ...searchTerms.map(term => like(communityGroups.description, `%${term}%`)),
          ...searchTerms.map(term => like(communityGroups.name, `%${term}%`))
        )
      )
      .limit(3);

    for (const group of relevantGroups) {
      recommendations.push({
        type: 'group',
        id: group.id,
        title: group.name,
        description: group.description,
        category: 'Support Group',
        relevanceScore: calculateRelevanceScore(query, group.description),
        nextSteps: [
          'Review group guidelines and meeting schedule',
          'Contact group moderator for joining instructions',
          'Attend an initial meeting to see if it\'s a good fit'
        ]
      });
    }

    // Find relevant events
    const relevantEvents = await db
      .select()
      .from(events)
      .where(
        and(
          or(
            ...searchTerms.map(term => like(events.description, `%${term}%`)),
            ...searchTerms.map(term => like(events.title, `%${term}%`))
          ),
          sql`${events.startTime} > NOW()`
        )
      )
      .limit(3);

    for (const event of relevantEvents) {
      recommendations.push({
        type: 'event',
        id: event.id,
        title: event.title,
        description: event.description,
        category: 'Educational Event',
        relevanceScore: calculateRelevanceScore(query, event.description),
        location: event.location || 'Virtual Event',
        nextSteps: [
          'Register for the event in advance',
          'Prepare questions you\'d like to ask',
          'Check technical requirements if virtual'
        ]
      });
    }

    // Find relevant educational content
    const relevantEducation = await db
      .select()
      .from(educationalContent)
      .where(
        or(
          ...searchTerms.map(term => like(educationalContent.content, `%${term}%`)),
          ...searchTerms.map(term => like(educationalContent.title, `%${term}%`))
        )
      )
      .limit(3);

    for (const content of relevantEducation) {
      recommendations.push({
        type: 'education',
        id: content.id,
        title: content.title,
        description: content.content.substring(0, 200) + '...',
        category: content.category,
        relevanceScore: calculateRelevanceScore(query, content.content),
        nextSteps: [
          'Review the educational material thoroughly',
          'Take notes on important points',
          'Discuss insights with your healthcare provider'
        ]
      });
    }

    // Sort by relevance score
    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return recommendations.slice(0, 8); // Return top 8 recommendations

  } catch (error) {
    console.error('Error finding healthcare resources:', error);
    return [];
  }
}

/**
 * Generate comprehensive healthcare response
 */
async function generateHealthcareResponse(
  query: string,
  analysis: any,
  recommendations: HealthcareRecommendation[],
  riskAssessment: any
): Promise<AIResponse> {
  try {
    const completion = await openaiClient!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a healthcare guidance AI assistant. Your role is to:
          1. Provide supportive, informative responses that guide users to appropriate resources
          2. NEVER provide medical advice, diagnoses, or treatment recommendations
          3. Always emphasize the importance of consulting healthcare professionals
          4. Be empathetic and understanding while maintaining professional boundaries
          5. Include appropriate disclaimers about not replacing professional medical advice
          
          For emergency situations, prioritize directing to emergency services.
          For serious concerns, emphasize urgency of professional consultation.
          
          Provide a JSON response with:
          - message: empathetic, helpful response (2-3 paragraphs)
          - disclaimers: array of important disclaimers
          - followUpQuestions: array of helpful questions to ask healthcare providers
          - urgencyGuidance: specific guidance based on urgency level`
        },
        {
          role: "user",
          content: `User Query: ${query}
          
          Analysis: ${JSON.stringify(analysis)}
          Available Resources: ${recommendations.length} relevant resources found
          Risk Assessment: ${riskAssessment.riskCategory} risk level
          
          Generate a helpful response that guides the user to appropriate resources without providing medical advice.`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Standard disclaimers based on specialization and urgency
    const disclaimers = [
      "This guidance is for informational purposes only and does not replace professional medical advice.",
      "Always consult with qualified healthcare professionals for medical concerns.",
      "If you're experiencing a medical emergency, call 911 or go to the nearest emergency room immediately."
    ];

    if (analysis.urgencyLevel === 'emergency') {
      disclaimers.unshift("EMERGENCY: If you're experiencing severe symptoms, call 911 immediately.");
    }

    if (analysis.urgencyLevel === 'high') {
      disclaimers.push("This appears to be a serious concern that requires prompt medical attention.");
    }

    return {
      message: aiResponse.message || "I understand your concern and I'm here to help guide you to the right resources.",
      recommendations,
      disclaimers: [...disclaimers, ...(aiResponse.disclaimers || [])],
      urgencyLevel: analysis.urgencyLevel,
      followUpQuestions: aiResponse.followUpQuestions || [
        "What symptoms are you currently experiencing?",
        "How long have you been dealing with this concern?",
        "Are you currently taking any medications?",
        "Do you have any known allergies or medical conditions?"
      ],
      specialization: analysis.specialization
    };

  } catch (error) {
    console.error('Error generating healthcare response:', error);
    return {
      message: "I understand you're looking for guidance. While I'm having technical difficulties providing personalized recommendations right now, I encourage you to speak with a healthcare professional who can properly address your concerns.",
      recommendations,
      disclaimers: [
        "AI response generation failed - please consult healthcare provider",
        "This guidance is for informational purposes only and does not replace professional medical advice."
      ],
      urgencyLevel: analysis.urgencyLevel || 'medium',
      followUpQuestions: [],
      specialization: analysis.specialization || 'general'
    };
  }
}

/**
 * Calculate relevance score for recommendations
 */
function calculateRelevanceScore(query: string, description: string): number {
  const queryWords = query.toLowerCase().split(' ');
  const descWords = description.toLowerCase().split(' ');
  
  let matches = 0;
  for (const queryWord of queryWords) {
    if (queryWord.length > 3) { // Only count meaningful words
      for (const descWord of descWords) {
        if (descWord.includes(queryWord) || queryWord.includes(descWord)) {
          matches++;
          break;
        }
      }
    }
  }
  
  return Math.min(100, (matches / queryWords.length) * 100);
}

/**
 * Emergency detection and routing
 */
export async function detectEmergency(query: string): Promise<{
  isEmergency: boolean;
  emergencyType: string;
  immediateActions: string[];
}> {
  try {
    if (!isOpenAIConfigured || !openaiClient) {
      return {
        isEmergency: false,
        emergencyType: 'unknown',
        immediateActions: ['Contact emergency services if experiencing severe symptoms']
      };
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an emergency detection AI. Analyze queries for emergency medical situations:
          
          Emergency indicators include:
          - Chest pain, heart attack symptoms
          - Severe breathing difficulties
          - Stroke symptoms (FAST signs)
          - Severe allergic reactions
          - Suicide ideation or self-harm
          - Severe trauma or injuries
          - Severe bleeding
          - Loss of consciousness
          - Severe poisoning
          
          Provide JSON response:
          - isEmergency: boolean
          - emergencyType: specific type if emergency
          - immediateActions: array of immediate steps to take`
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      isEmergency: result.isEmergency || false,
      emergencyType: result.emergencyType || 'unknown',
      immediateActions: result.immediateActions || ['Contact emergency services immediately']
    };

  } catch (error) {
    console.error('Error in emergency detection:', error);
    return {
      isEmergency: false,
      emergencyType: 'detection_failed',
      immediateActions: ['If experiencing severe symptoms, contact emergency services immediately']
    };
  }
}