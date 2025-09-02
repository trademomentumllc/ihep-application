import OpenAI from "openai";

// Default OpenAI model
const DEFAULT_MODEL = "gpt-4o";

// Check if OpenAI API key exists and initialize client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openaiClient: OpenAI | null = null;
let isOpenAIConfigured = false;

// Initialize OpenAI client only if API key is available
try {
  if (OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
    isOpenAIConfigured = true;
    console.log("OpenAI API client initialized successfully");
  } else {
    console.warn("Warning: OPENAI_API_KEY is not set. AI moderation features will not be available.");
  }
} catch (error) {
  console.error("Error initializing OpenAI client:", error);
}

/**
 * Moderate content using OpenAI to check for inappropriate content
 * in forum posts and comments
 * 
 * @param content The text content to moderate
 * @returns An object containing moderation results
 */
export async function moderateContent(content: string): Promise<{
  flagged: boolean;
  reason?: string;
}> {
  // If OpenAI is not configured, return default result and don't block content
  if (!isOpenAIConfigured || !openaiClient) {
    console.log('OpenAI API not configured. Skipping content moderation.');
    return {
      flagged: false,
      reason: 'Moderation service not configured'
    };
  }
  
  try {
    // Use OpenAI's moderation endpoint
    const moderation = await openaiClient.moderations.create({
      input: content,
    });
    
    const result = moderation.results[0];
    
    // If content is flagged, get more specific details about why
    if (result.flagged) {
      let reasons: string[] = [];
      
      // Check which categories were flagged
      Object.entries(result.categories).forEach(([category, flagged]) => {
        if (flagged) {
          reasons.push(category);
        }
      });
      
      return {
        flagged: true,
        reason: `Content flagged for: ${reasons.join(', ')}`
      };
    }
    
    // Content passed moderation
    return {
      flagged: false
    };
  } catch (error) {
    console.error('Error in AI moderation:', error);
    
    // Return a failed moderation result but don't block content
    // This allows posts to go through if the AI service fails
    return {
      flagged: false,
      reason: 'Moderation service error'
    };
  }
}

/**
 * Sanitize content using OpenAI to remove or modify potentially sensitive or
 * inappropriate content while preserving the essential message
 * 
 * @param content The text content to sanitize
 * @returns The sanitized content
 */
export async function sanitizeContent(content: string): Promise<string> {
  // If OpenAI is not configured, return original content
  if (!isOpenAIConfigured || !openaiClient) {
    console.log('OpenAI API not configured. Skipping content sanitization.');
    return content;
  }
  
  try {
    const completion = await openaiClient.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: 
            "You are a content moderator for a healthcare forum. Your job is to " +
            "sanitize content that might contain sensitive or inappropriate material. " +
            "Remove any offensive language, personal health identifiers, or other " +
            "inappropriate content while preserving the essential message. " +
            "Replace removed content with appropriate placeholders like [PHI removed] or [inappropriate content removed]."
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content || content;
  } catch (error) {
    console.error('Error in AI content sanitization:', error);
    // Return original content if sanitization fails
    return content;
  }
}

/**
 * Analyze content sentiment and toxicity level
 * 
 * @param content The text content to analyze
 * @returns An object containing sentiment analysis results
 */
export async function analyzeContentSentiment(content: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  toxicity: number;
  themes?: string[];
  summary?: string;
}> {
  // If OpenAI is not configured, return default values
  if (!isOpenAIConfigured || !openaiClient) {
    console.log('OpenAI API not configured. Skipping content sentiment analysis.');
    return {
      sentiment: 'neutral',
      toxicity: 0,
      themes: ['analysis unavailable'],
      summary: 'AI sentiment analysis is not available.'
    };
  }
  
  try {
    const completion = await openaiClient.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: 
            "Analyze the sentiment and toxicity of the following content from a healthcare forum. " +
            "Provide a JSON response with these fields: " +
            "sentiment: 'positive', 'neutral', or 'negative' " +
            "toxicity: a value from 0 (not toxic) to 1 (extremely toxic) " +
            "themes: an array of key themes or topics mentioned " +
            "summary: a brief 1-2 sentence summary of the content"
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      sentiment: analysisResult.sentiment || 'neutral',
      toxicity: analysisResult.toxicity || 0,
      themes: analysisResult.themes || [],
      summary: analysisResult.summary || ''
    };
  } catch (error) {
    console.error('Error in AI sentiment analysis:', error);
    // Return default values if analysis fails
    return {
      sentiment: 'neutral',
      toxicity: 0,
      themes: ['analysis error'],
      summary: 'An error occurred during sentiment analysis.'
    };
  }
}

// These aliases are used by the forum routes
/**
 * Analyze forum comment for medical relevance to determine if it should be archived
 * This is critical for maintaining important health-related information
 * 
 * @param content The comment content to analyze
 * @returns An object with medical relevance score and analysis notes
 */
export async function analyzeMedicalRelevance(content: string): Promise<{
  medicalRelevance: number; // 0-10 scale where 10 is highly medically relevant
  shouldArchive: boolean;   // recommendation on whether to archive
  reasoning: string;        // explanation of the analysis
}> {
  // If OpenAI is not configured, return conservative defaults (archive content)
  if (!isOpenAIConfigured || !openaiClient) {
    console.log('OpenAI API not configured. Defaulting to archiving content.');
    return {
      medicalRelevance: 5, // Middle score when uncertain
      shouldArchive: true, // Default to archiving when we can't analyze
      reasoning: 'Unable to analyze content due to AI service unavailability. Archived by default as a precaution.'
    };
  }
  
  try {
    const completion = await openaiClient.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: 
            "You are a healthcare information specialist analyzing forum comments in an HIV support community. " +
            "Your task is to evaluate the medical relevance of comments to determine if they should be " +
            "archived for future reference instead of deleted. " +
            "Consider factors such as: " +
            "1. Whether the comment contains specific medical information, advice, or experiences " +
            "2. Whether the information could be valuable to other patients or healthcare providers " +
            "3. Whether the comment discusses medication effects, treatment responses, or symptom patterns " +
            "4. Whether the comment includes timeline information about disease progression or recovery " +
            "5. Whether the comment describes interactions between treatments or conditions " +
            "Provide a score from 0-10 where 10 is extremely medically relevant, " +
            "a boolean recommendation on whether to archive (comments scoring 4+ should be archived), " +
            "and a brief explanation of your reasoning."
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const analysisText = completion.choices[0].message.content || '{}';
    let analysis;
    
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Error parsing AI analysis response:', parseError);
      // Provide a fallback analysis
      analysis = {
        medicalRelevance: 5, 
        shouldArchive: true,
        reasoning: 'Failed to parse AI analysis. Defaulting to archive as a precaution.'
      };
    }
    
    // Ensure we have proper values
    const medicalRelevance = typeof analysis.medicalRelevance === 'number' ? 
      Math.max(0, Math.min(10, analysis.medicalRelevance)) : 5;
      
    const shouldArchive = 
      typeof analysis.shouldArchive === 'boolean' ? analysis.shouldArchive : (medicalRelevance >= 4);
      
    const reasoning = analysis.reasoning || 
      `Content evaluated with medical relevance score of ${medicalRelevance}/10`;
    
    return {
      medicalRelevance,
      shouldArchive,
      reasoning
    };
  } catch (error) {
    console.error('Error in AI medical relevance analysis:', error);
    // Conservative approach: archive when in doubt
    return {
      medicalRelevance: 5,
      shouldArchive: true,
      reasoning: 'Unable to complete analysis due to technical error. Archived as a precaution.'
    };
  }
}

export const moderateForumPost = moderateContent;
export const moderateForumComment = moderateContent;

/**
 * Enhanced AI moderation with neural governance integration
 */
export async function performAdvancedModeration(
  content: string,
  contentType: string,
  contentId: string,
  userId?: number
): Promise<{
  approved: boolean;
  moderationScore: number;
  flags: string[];
  riskAssessment: any;
  complianceCheck: any;
  reasoning: string;
}> {
  try {
    // Import neural governance functions
    const { performRiskAssessment, monitorCompliance, logAiDecision } = await import('./neuralGovernance');
    
    // Perform basic moderation
    const basicModeration = await moderateContent(content);
    
    // Perform risk assessment
    const riskAssessment = await performRiskAssessment(
      'content_moderation',
      contentId,
      contentType,
      { content, userId, moderationResult: basicModeration },
      userId
    );
    
    // Check compliance across frameworks
    const complianceCheck = await monitorCompliance(
      'HIPAA',
      contentType,
      contentId,
      { content, userId },
      userId
    );
    
    // Determine final decision
    const approved = basicModeration.approved && 
                    riskAssessment.riskScore < 70 && 
                    complianceCheck.complianceStatus === 'compliant';
    
    const flags = [
      ...basicModeration.flags,
      ...riskAssessment.identifiedRisks,
      ...complianceCheck.violations
    ];
    
    const reasoning = `Content moderation: ${basicModeration.reasoning}. Risk score: ${riskAssessment.riskScore}. Compliance: ${complianceCheck.complianceStatus}.`;
    
    // Log the AI decision
    await logAiDecision(
      'content_moderation',
      contentType,
      contentId,
      { content, userId },
      { approved, moderationScore: basicModeration.toxicity, riskScore: riskAssessment.riskScore },
      approved ? 'approved' : 'rejected',
      reasoning,
      riskAssessment.confidence,
      Date.now() - Date.now(),
      userId
    );
    
    return {
      approved,
      moderationScore: basicModeration.toxicity,
      flags,
      riskAssessment,
      complianceCheck,
      reasoning
    };
    
  } catch (error) {
    console.error('Error in advanced moderation:', error);
    
    // Fallback to basic moderation
    const basicResult = await moderateContent(content);
    return {
      approved: basicResult.approved,
      moderationScore: basicResult.toxicity,
      flags: basicResult.flags,
      riskAssessment: { riskScore: 50, riskCategory: 'medium' },
      complianceCheck: { complianceStatus: 'under_review' },
      reasoning: 'Advanced moderation failed, using basic moderation result'
    };
  }
}