/**
 * Groq API Service
 * Provides AI capabilities using Groq's Llama models
 * - Llama 3.3 70B for complex reasoning and response generation
 * - Llama 4 Scout 16e for fast classification and sentiment analysis
 */
import Groq from "groq-sdk";
// Model identifiers
export const GROQ_MODELS = {
    // Fast model for classification, sentiment, intent extraction
    FAST: "meta-llama/llama-4-scout-17b-16e-instruct",
    // Deep model for response generation, complex reasoning
    DEEP: "llama-3.3-70b-versatile",
};
// Configuration for retry logic
const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
};
// Rate limiting tracking
const rateLimitState = {
    lastRequestTime: 0,
    requestCount: 0,
    windowStartTime: Date.now(),
    windowDurationMs: 60000, // 1 minute window
    maxRequestsPerWindow: 30, // Conservative limit
};
/**
 * Initialize Groq client
 * Uses GROQ_API_KEY from environment
 */
function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY environment variable is not set");
    }
    return new Groq({ apiKey });
}
/**
 * Select appropriate model based on task type
 */
export function selectModel(task) {
    switch (task) {
        // Fast model for quick analysis tasks
        case "classify":
        case "sentiment":
        case "intent":
            return GROQ_MODELS.FAST;
        // Deep model for generation and reasoning
        case "respond":
        case "summarize":
        case "complex_reasoning":
            return GROQ_MODELS.DEEP;
        default:
            return GROQ_MODELS.FAST;
    }
}
/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt) {
    const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
    return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}
/**
 * Check and update rate limiting state
 * Returns true if request should proceed, false if rate limited
 */
function checkRateLimit() {
    const now = Date.now();
    // Reset window if expired
    if (now - rateLimitState.windowStartTime >= rateLimitState.windowDurationMs) {
        rateLimitState.windowStartTime = now;
        rateLimitState.requestCount = 0;
    }
    // Check if we're over the limit
    if (rateLimitState.requestCount >= rateLimitState.maxRequestsPerWindow) {
        return false;
    }
    rateLimitState.requestCount++;
    rateLimitState.lastRequestTime = now;
    return true;
}
/**
 * Wait for rate limit window to reset
 */
async function waitForRateLimit() {
    const now = Date.now();
    const timeUntilReset = rateLimitState.windowDurationMs - (now - rateLimitState.windowStartTime);
    if (timeUntilReset > 0) {
        console.log(`[GroqService] Rate limited, waiting ${timeUntilReset}ms`);
        await sleep(timeUntilReset + 100); // Add small buffer
    }
}
/**
 * Determine if an error is retryable
 */
function isRetryableError(error) {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        // Retry on rate limits, timeouts, and temporary server errors
        return (message.includes("rate limit") ||
            message.includes("429") ||
            message.includes("timeout") ||
            message.includes("503") ||
            message.includes("502") ||
            message.includes("500"));
    }
    return false;
}
/**
 * Main completion function with retry logic and rate limiting
 */
export async function createCompletion(options) {
    const { messages, model, task, temperature = 0.7, maxTokens = 1024, responseFormat = "text", jsonSchema, } = options;
    // Determine model to use
    const selectedModel = model || (task ? selectModel(task) : GROQ_MODELS.FAST);
    // Adjust temperature for classification tasks
    const adjustedTemp = task && ["classify", "sentiment", "intent"].includes(task)
        ? 0
        : temperature;
    let lastError = null;
    for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
        try {
            // Check rate limiting
            if (!checkRateLimit()) {
                await waitForRateLimit();
            }
            const client = getGroqClient();
            const startTime = Date.now();
            const completionParams = {
                model: selectedModel,
                messages,
                temperature: adjustedTemp,
                max_tokens: maxTokens,
            };
            // Add JSON response format if requested
            if (responseFormat === "json") {
                completionParams.response_format = { type: "json_object" };
            }
            const completion = await client.chat.completions.create(completionParams);
            const latencyMs = Date.now() - startTime;
            const content = completion.choices[0]?.message?.content || "";
            return {
                content,
                model: selectedModel,
                usage: {
                    promptTokens: completion.usage?.prompt_tokens || 0,
                    completionTokens: completion.usage?.completion_tokens || 0,
                    totalTokens: completion.usage?.total_tokens || 0,
                },
                latencyMs,
            };
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`[GroqService] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries} failed:`, lastError.message);
            // Only retry on retryable errors
            if (!isRetryableError(error) || attempt === RETRY_CONFIG.maxRetries - 1) {
                throw lastError;
            }
            // Wait before retrying
            const delay = getRetryDelay(attempt);
            console.log(`[GroqService] Retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
    throw lastError || new Error("Unknown error in Groq completion");
}
/**
 * Quick helper for fast classification tasks
 */
export async function fastClassify(systemPrompt, userMessage) {
    return createCompletion({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        task: "classify",
        responseFormat: "json",
    });
}
/**
 * Helper for response generation with deep model
 */
export async function generateResponse(systemPrompt, messages) {
    return createCompletion({
        messages: [
            { role: "system", content: systemPrompt },
            ...messages,
        ],
        task: "respond",
        maxTokens: 2048,
    });
}
export default {
    GROQ_MODELS,
    selectModel,
    createCompletion,
    fastClassify,
    generateResponse,
};
