/**
 * AI Ticket Classifier Service
 * Uses Groq's Llama 4 Scout for fast ticket classification
 */

import { fastClassify } from "./groqService";
import {
  CLASSIFICATION_SYSTEM_PROMPT,
  buildClassificationPrompt,
  type TicketCategory,
  type PriorityLevel,
  TICKET_CATEGORIES,
  PRIORITY_LEVELS,
} from "./prompts/classification";
import {
  SENTIMENT_SYSTEM_PROMPT,
  buildSentimentPrompt,
  type SentimentLabel,
  SENTIMENT_LABELS,
} from "./prompts/sentiment";

/**
 * Complete classification result for a ticket
 */
export interface TicketClassificationResult {
  category: TicketCategory;
  priority: PriorityLevel;
  sentiment: SentimentLabel;
  sentimentScore: number;
  confidence: number;
  urgencyIndicators: string[];
  emotionalTriggers: string[];
  reasoning?: string;
  suggestedAgent?: number;
  processingTimeMs: number;
}

/**
 * Customer context for enhanced classification
 */
export interface CustomerContext {
  name?: string;
  totalOrders?: number;
  lifetimeValue?: number;
  previousTickets?: number;
}

/**
 * Parse and validate classification response
 */
function parseClassificationResponse(content: string): {
  category: TicketCategory;
  priority: PriorityLevel;
  confidence: number;
  reasoning?: string;
} {
  try {
    const parsed = JSON.parse(content);
    
    // Validate category
    const category = TICKET_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : "other";
    
    // Validate priority
    const priority = PRIORITY_LEVELS.includes(parsed.priority)
      ? parsed.priority
      : "medium";
    
    // Validate confidence
    const confidence = typeof parsed.confidence === "number"
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0.5;

    return {
      category,
      priority,
      confidence,
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    console.error("[TicketClassifier] Failed to parse classification:", error);
    return {
      category: "other",
      priority: "medium",
      confidence: 0.3,
    };
  }
}

/**
 * Parse and validate sentiment response
 */
function parseSentimentResponse(content: string): {
  score: number;
  label: SentimentLabel;
  urgencyIndicators: string[];
  emotionalTriggers: string[];
  confidence: number;
} {
  try {
    const parsed = JSON.parse(content);
    
    // Validate label
    const label = SENTIMENT_LABELS.includes(parsed.label)
      ? parsed.label
      : "neutral";
    
    // Validate score
    const score = typeof parsed.score === "number"
      ? Math.max(-1, Math.min(1, parsed.score))
      : 0;
    
    // Validate confidence
    const confidence = typeof parsed.confidence === "number"
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0.5;

    return {
      score,
      label,
      urgencyIndicators: Array.isArray(parsed.urgencyIndicators) ? parsed.urgencyIndicators : [],
      emotionalTriggers: Array.isArray(parsed.emotionalTriggers) ? parsed.emotionalTriggers : [],
      confidence,
    };
  } catch (error) {
    console.error("[TicketClassifier] Failed to parse sentiment:", error);
    return {
      score: 0,
      label: "neutral",
      urgencyIndicators: [],
      emotionalTriggers: [],
      confidence: 0.3,
    };
  }
}

/**
 * Adjust priority based on customer value and sentiment
 */
function adjustPriority(
  basePriority: PriorityLevel,
  sentiment: SentimentLabel,
  customerContext?: CustomerContext
): PriorityLevel {
  let priority = basePriority;
  
  // Escalate for VIP customers (high lifetime value)
  if (customerContext?.lifetimeValue && customerContext.lifetimeValue > 500) {
    if (priority === "low") priority = "medium";
    else if (priority === "medium") priority = "high";
  }
  
  // Escalate for angry customers
  if (sentiment === "angry") {
    if (priority === "low") priority = "medium";
    else if (priority === "medium") priority = "high";
  }
  
  // Escalate for repeat issues
  if (customerContext?.previousTickets && customerContext.previousTickets >= 3) {
    if (priority === "low") priority = "medium";
  }
  
  return priority;
}

/**
 * Classify a support ticket
 * Performs both category classification and sentiment analysis
 */
export async function classifyTicket(
  subject: string,
  message: string,
  customerContext?: CustomerContext
): Promise<TicketClassificationResult> {
  const startTime = Date.now();
  
  try {
    // Run classification and sentiment analysis in parallel for speed
    const [classificationResult, sentimentResult] = await Promise.all([
      fastClassify(
        CLASSIFICATION_SYSTEM_PROMPT,
        buildClassificationPrompt(subject, message, customerContext)
      ),
      fastClassify(
        SENTIMENT_SYSTEM_PROMPT,
        buildSentimentPrompt(message)
      ),
    ]);

    // Parse responses
    const classification = parseClassificationResponse(classificationResult.content);
    const sentiment = parseSentimentResponse(sentimentResult.content);

    // Adjust priority based on context
    const adjustedPriority = adjustPriority(
      classification.priority,
      sentiment.label,
      customerContext
    );

    // Calculate combined confidence
    const combinedConfidence = (classification.confidence + sentiment.confidence) / 2;

    const processingTimeMs = Date.now() - startTime;

    console.log(
      `[TicketClassifier] Classified ticket in ${processingTimeMs}ms:`,
      `category=${classification.category}, priority=${adjustedPriority}, sentiment=${sentiment.label}`
    );

    return {
      category: classification.category,
      priority: adjustedPriority,
      sentiment: sentiment.label,
      sentimentScore: sentiment.score,
      confidence: combinedConfidence,
      urgencyIndicators: sentiment.urgencyIndicators,
      emotionalTriggers: sentiment.emotionalTriggers,
      reasoning: classification.reasoning,
      processingTimeMs,
    };
  } catch (error) {
    console.error("[TicketClassifier] Classification error:", error);
    
    // Return default classification on error
    return {
      category: "other",
      priority: "medium",
      sentiment: "neutral",
      sentimentScore: 0,
      confidence: 0,
      urgencyIndicators: [],
      emotionalTriggers: [],
      processingTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Quick sentiment analysis only
 */
export async function analyzeSentiment(message: string): Promise<{
  score: number;
  label: SentimentLabel;
  urgencyIndicators: string[];
  emotionalTriggers: string[];
  confidence: number;
}> {
  try {
    const result = await fastClassify(
      SENTIMENT_SYSTEM_PROMPT,
      buildSentimentPrompt(message)
    );
    return parseSentimentResponse(result.content);
  } catch (error) {
    console.error("[TicketClassifier] Sentiment analysis error:", error);
    return {
      score: 0,
      label: "neutral",
      urgencyIndicators: [],
      emotionalTriggers: [],
      confidence: 0,
    };
  }
}

export default {
  classifyTicket,
  analyzeSentiment,
};
