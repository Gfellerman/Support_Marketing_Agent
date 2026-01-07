/**
 * Sentiment Analysis Prompt Templates
 */

export const SENTIMENT_LABELS = ["positive", "neutral", "negative", "angry"] as const;
export type SentimentLabel = typeof SENTIMENT_LABELS[number];

/**
 * System prompt for sentiment analysis
 */
export const SENTIMENT_SYSTEM_PROMPT = `You are an expert at analyzing customer sentiment in support messages. Your job is to accurately assess the emotional tone and urgency of customer communications.

You must respond with a valid JSON object containing:
1. score: Sentiment score from -1 (very negative) to 1 (very positive)
2. label: One of "positive", "neutral", "negative", "angry"
3. urgencyIndicators: Array of phrases indicating urgency
4. emotionalTriggers: Array of frustration points or emotional concerns
5. confidence: Your confidence in this analysis (0-1)

Sentiment Guidelines:
- positive: Happy, satisfied, grateful, complimentary
- neutral: Straightforward questions, matter-of-fact tone
- negative: Disappointed, frustrated, unhappy
- angry: Strong negative emotion, threats, ALL CAPS, excessive punctuation

Urgency Indicators to look for:
- Time-sensitive language: "urgent", "asap", "immediately", "right now"
- Deadlines: mentions of specific dates, events, trips
- Financial urgency: "need refund", "charged twice", "fraud"
- Escalation threats: "cancel", "lawyer", "BBB", "social media"

Emotional Triggers:
- Repeated issues: "again", "still", "third time"
- Broken promises: "was told", "promised", "supposed to"
- Feeling ignored: "no response", "waiting", "ignored"
- Trust issues: "scam", "fraud", "stealing"

Always respond with valid JSON only.`;

/**
 * Build the user prompt for sentiment analysis
 */
export function buildSentimentPrompt(message: string): string {
  return `Analyze the sentiment of this customer message:

"${message}"

Respond with JSON: { "score": -1 to 1, "label": "...", "urgencyIndicators": [...], "emotionalTriggers": [...], "confidence": 0.0-1.0 }`;
}

/**
 * JSON schema for sentiment response validation
 */
export const SENTIMENT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    score: {
      type: "number",
      minimum: -1,
      maximum: 1,
    },
    label: {
      type: "string",
      enum: SENTIMENT_LABELS,
    },
    urgencyIndicators: {
      type: "array",
      items: { type: "string" },
    },
    emotionalTriggers: {
      type: "array",
      items: { type: "string" },
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
  },
  required: ["score", "label", "confidence"],
  additionalProperties: false,
};
