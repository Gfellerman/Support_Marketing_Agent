/**
 * Classification Prompt Templates
 * Used for categorizing support tickets
 */
export const TICKET_CATEGORIES = [
    "order_status", // WISMO (Where Is My Order)
    "return_refund", // Returns, exchanges, refunds
    "product_question", // Pre-sale questions
    "shipping_issue", // Delivery problems
    "payment_issue", // Billing, charges
    "account_help", // Login, profile
    "complaint", // Negative experience
    "feedback", // Suggestions, praise
    "other",
];
export const PRIORITY_LEVELS = ["urgent", "high", "medium", "low"];
/**
 * System prompt for ticket classification
 */
export const CLASSIFICATION_SYSTEM_PROMPT = `You are an expert e-commerce customer support ticket classifier. Your job is to analyze customer messages and classify them accurately.

You must respond with a valid JSON object containing:
1. category: The ticket category
2. priority: The urgency level
3. confidence: Your confidence score (0-1)
4. reasoning: Brief explanation of your classification

Categories:
- order_status: Questions about order tracking, delivery status, "where is my order"
- return_refund: Return requests, refund inquiries, exchange requests
- product_question: Questions about products before purchase, availability, features
- shipping_issue: Delivery problems, wrong address, damaged in transit
- payment_issue: Billing questions, payment failures, charge disputes
- account_help: Login issues, password reset, profile updates
- complaint: General complaints, negative experiences
- feedback: Suggestions, compliments, general feedback
- other: Anything that doesn't fit above categories

Priority Indicators:
- urgent: Contains words like "urgent", "asap", "immediately", "emergency", legal threats, or significant financial impact
- high: Time-sensitive issues, frustrated customers, repeat contacts about same issue
- medium: Standard support requests with reasonable expectations
- low: General inquiries, feedback, non-time-sensitive questions

Always respond with valid JSON only.`;
/**
 * Build the user prompt for classification
 */
export function buildClassificationPrompt(subject, message, customerContext) {
    let prompt = `Classify this customer support ticket.

Subject: ${subject}
Message: ${message}`;
    if (customerContext) {
        prompt += `\n\nCustomer Context:`;
        if (customerContext.name)
            prompt += `\n- Name: ${customerContext.name}`;
        if (customerContext.totalOrders !== undefined)
            prompt += `\n- Total Orders: ${customerContext.totalOrders}`;
        if (customerContext.lifetimeValue !== undefined)
            prompt += `\n- Lifetime Value: $${customerContext.lifetimeValue}`;
        if (customerContext.previousTickets !== undefined)
            prompt += `\n- Previous Tickets: ${customerContext.previousTickets}`;
    }
    prompt += `\n\nRespond with JSON: { "category": "...", "priority": "...", "confidence": 0.0-1.0, "reasoning": "..." }`;
    return prompt;
}
/**
 * JSON schema for classification response validation
 */
export const CLASSIFICATION_RESPONSE_SCHEMA = {
    type: "object",
    properties: {
        category: {
            type: "string",
            enum: TICKET_CATEGORIES,
        },
        priority: {
            type: "string",
            enum: PRIORITY_LEVELS,
        },
        confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
        },
        reasoning: {
            type: "string",
        },
    },
    required: ["category", "priority", "confidence"],
    additionalProperties: false,
};
