/**
 * Response Generation Prompt Templates
 * Used for AI-suggested responses with e-commerce context
 */
/**
 * Build the system prompt for response generation
 */
export function buildResponseSystemPrompt(context) {
    const orgName = context.organizationName || "our store";
    let prompt = `You are a helpful and professional e-commerce support agent for ${orgName}.

GUIDELINES:
- Be friendly, professional, and empathetic
- Reference specific order details when relevant
- Offer concrete solutions, not generic responses
- Keep responses concise but complete (2-4 paragraphs max)
- If uncertain, acknowledge and offer to escalate
- Never make promises you can't keep (refunds, delivery dates) without verification
- Always offer further assistance at the end

GUARDRAILS:
- Never promise refunds without verification from the system
- Never share internal policies or discount codes unless authorized
- Never make up information about orders or products
- If you don't have order details, ask for the order number
- For legal threats, acknowledge and offer to escalate to a supervisor`;
    // Add customer context if available
    if (context.customer) {
        const c = context.customer;
        prompt += `\n\nCUSTOMER CONTEXT:`;
        if (c.name)
            prompt += `\n- Name: ${c.name}`;
        if (c.totalOrders !== undefined)
            prompt += `\n- Total Orders: ${c.totalOrders}`;
        if (c.lifetimeValue !== undefined)
            prompt += `\n- Lifetime Value: $${c.lifetimeValue.toFixed(2)}`;
        if (c.isVip)
            prompt += `\n- VIP Status: Yes (prioritize satisfaction)`;
        if (c.lastOrderDate)
            prompt += `\n- Last Order: ${c.lastOrderDate.toLocaleDateString()}`;
    }
    // Add order context if available
    if (context.recentOrders && context.recentOrders.length > 0) {
        prompt += `\n\nRECENT ORDERS:`;
        for (const order of context.recentOrders.slice(0, 3)) {
            prompt += `\n- Order #${order.orderNumber}: ${order.status}`;
            if (order.trackingNumber)
                prompt += ` (Tracking: ${order.trackingNumber})`;
            if (order.estimatedDelivery)
                prompt += ` - ETA: ${order.estimatedDelivery}`;
            if (order.items && order.items.length > 0) {
                prompt += `\n  Items: ${order.items.map(i => i.name).join(", ")}`;
            }
        }
    }
    // Add knowledge base context if available
    if (context.relevantArticles && context.relevantArticles.length > 0) {
        prompt += `\n\nRELEVANT KNOWLEDGE BASE:`;
        for (const article of context.relevantArticles.slice(0, 3)) {
            prompt += `\n\n[${article.title}]:\n${article.content.substring(0, 500)}${article.content.length > 500 ? "..." : ""}`;
        }
    }
    // Add ticket context
    if (context.ticketCategory || context.ticketPriority || context.sentiment) {
        prompt += `\n\nTICKET CONTEXT:`;
        if (context.ticketCategory)
            prompt += `\n- Category: ${context.ticketCategory}`;
        if (context.ticketPriority)
            prompt += `\n- Priority: ${context.ticketPriority}`;
        if (context.sentiment) {
            prompt += `\n- Customer Sentiment: ${context.sentiment}`;
            if (context.sentiment === "angry" || context.sentiment === "negative") {
                prompt += " (be extra empathetic and apologetic)";
            }
        }
    }
    return prompt;
}
/**
 * Build the user prompt for response generation
 */
export function buildResponseUserPrompt(subject, message, conversationHistory) {
    let prompt = `Subject: ${subject}\n`;
    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
        prompt += `\nConversation History:\n`;
        for (const msg of conversationHistory.slice(-5)) { // Last 5 messages
            prompt += `${msg.role === "customer" ? "Customer" : "Agent"}: ${msg.content}\n`;
        }
        prompt += `\n`;
    }
    prompt += `Latest Customer Message: ${message}\n\nGenerate a helpful, professional response to address the customer's concerns.`;
    return prompt;
}
/**
 * Response templates for common scenarios
 */
export const RESPONSE_TEMPLATES = {
    orderStatus: (orderNumber, status, tracking) => `I can see your order #${orderNumber} is currently ${status}.${tracking ? ` You can track it using: ${tracking}` : ""} Is there anything else I can help you with?`,
    refundInitiated: (orderNumber, amount, timeframe) => `I've initiated a refund of ${amount} for order #${orderNumber}. You should see this reflected in your account within ${timeframe}. Is there anything else I can help you with?`,
    escalation: () => `I understand this is an important matter. I'm going to escalate this to a senior team member who can better assist you. They'll be in touch within 24 hours. Is there anything else I can help with in the meantime?`,
    needsMoreInfo: (infoNeeded) => `To better assist you, could you please provide ${infoNeeded}? This will help me resolve your issue more quickly.`,
};
