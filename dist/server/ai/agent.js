import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { aiKnowledge, tickets, ticketMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
/**
 * Classify a support ticket using AI
 */
export async function classifyTicket(ticketId, subject, message) {
    try {
        const prompt = `Analyze this customer support ticket and classify it.

Subject: ${subject}
Message: ${message}

Provide a JSON response with:
1. category: one of [order_status, shipping, returns, product_inquiry, technical_support, billing, general]
2. priority: one of [low, medium, high, urgent]
3. sentiment: one of [positive, neutral, negative]
4. confidence: a number between 0 and 1

Consider urgency indicators like "urgent", "asap", "immediately" for priority.
Consider emotional language for sentiment analysis.`;
        const response = await invokeLLM({
            messages: [
                { role: "system", content: "You are an expert customer service ticket classifier. Always respond with valid JSON only." },
                { role: "user", content: prompt }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "ticket_classification",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            category: {
                                type: "string",
                                enum: ["order_status", "shipping", "returns", "product_inquiry", "technical_support", "billing", "general"]
                            },
                            priority: {
                                type: "string",
                                enum: ["low", "medium", "high", "urgent"]
                            },
                            sentiment: {
                                type: "string",
                                enum: ["positive", "neutral", "negative"]
                            },
                            confidence: {
                                type: "number",
                                minimum: 0,
                                maximum: 1
                            }
                        },
                        required: ["category", "priority", "sentiment", "confidence"],
                        additionalProperties: false
                    }
                }
            }
        });
        const contentRaw = response.choices[0]?.message?.content;
        if (!contentRaw) {
            throw new Error("No classification response from AI");
        }
        // Extract text from response (handle both string and array formats)
        const content = typeof contentRaw === "string"
            ? contentRaw
            : JSON.stringify(contentRaw);
        const classification = JSON.parse(content);
        return classification;
    }
    catch (error) {
        console.error("[AI Agent] Classification error:", error);
        // Return default classification on error
        return {
            category: "general",
            priority: "medium",
            sentiment: "neutral",
            confidence: 0.5
        };
    }
}
/**
 * Generate an automatic response to a support ticket using knowledge base
 */
export async function generateResponse(ticketId, organizationId, subject, message, classification, conversationHistory = []) {
    try {
        const db = await getDb();
        if (!db) {
            throw new Error("Database not available");
        }
        // Fetch relevant knowledge base articles
        const knowledgeArticles = await db
            .select()
            .from(aiKnowledge)
            .where(and(eq(aiKnowledge.organizationId, organizationId), eq(aiKnowledge.isActive, true)))
            .limit(10);
        // Build context from knowledge base
        const knowledgeContext = knowledgeArticles
            .map((article) => `Title: ${article.title}\nContent: ${article.content}`)
            .join("\n\n---\n\n");
        // Build conversation history
        const conversationContext = conversationHistory
            .map((msg) => `${msg.role === "user" ? "Customer" : "Agent"}: ${msg.content}`)
            .join("\n");
        const systemPrompt = `You are a helpful customer service agent for an e-commerce platform.
Your goal is to provide accurate, friendly, and professional responses to customer inquiries.

Use the following knowledge base to answer questions:

${knowledgeContext}

Guidelines:
- Be friendly, professional, and empathetic
- Provide clear, concise answers
- If you don't have enough information, acknowledge it and suggest next steps
- For order-specific questions, ask for order number if not provided
- For shipping questions, provide tracking information if available
- For returns, explain the return policy clearly
- Always end with an offer to help further

Classification: ${classification.category} (${classification.sentiment} sentiment, ${classification.priority} priority)`;
        const userPrompt = `Subject: ${subject}

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ""}New message: ${message}

Please provide a helpful response to this customer.`;
        const response = await invokeLLM({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });
        const aiResponseContent = response.choices[0]?.message?.content;
        if (!aiResponseContent) {
            throw new Error("No response from AI");
        }
        // Extract text from response (handle both string and array formats)
        const aiResponse = typeof aiResponseContent === "string"
            ? aiResponseContent
            : JSON.stringify(aiResponseContent);
        // Calculate confidence based on classification confidence and response quality
        const confidence = classification.confidence * 0.8; // Slightly lower confidence for generated responses
        // Determine if human handoff is needed
        const shouldHandoff = confidence < 0.6 ||
            classification.priority === "urgent" ||
            classification.sentiment === "negative" ||
            aiResponse.toLowerCase().includes("i don't have") ||
            aiResponse.toLowerCase().includes("i'm not sure");
        let handoffReason;
        if (shouldHandoff) {
            if (confidence < 0.6)
                handoffReason = "Low confidence in response";
            else if (classification.priority === "urgent")
                handoffReason = "Urgent priority requires human attention";
            else if (classification.sentiment === "negative")
                handoffReason = "Negative sentiment detected";
            else
                handoffReason = "AI unable to provide definitive answer";
        }
        return {
            response: aiResponse,
            confidence,
            knowledgeUsed: knowledgeArticles.map((a) => a.title),
            shouldHandoff,
            handoffReason
        };
    }
    catch (error) {
        console.error("[AI Agent] Response generation error:", error);
        return {
            response: "I apologize, but I'm having trouble processing your request right now. A human agent will assist you shortly.",
            confidence: 0,
            knowledgeUsed: [],
            shouldHandoff: true,
            handoffReason: "AI service error"
        };
    }
}
/**
 * Process a ticket with AI agent
 * Returns the AI response and updates ticket status if auto-responding
 */
export async function processTicketWithAI(ticketId, organizationId, autoRespond = false, confidenceThreshold = 0.7) {
    try {
        const db = await getDb();
        if (!db) {
            throw new Error("Database not available");
        }
        // Fetch ticket details
        const ticket = await db
            .select()
            .from(tickets)
            .where(eq(tickets.id, ticketId))
            .limit(1);
        if (!ticket[0]) {
            throw new Error("Ticket not found");
        }
        const ticketData = ticket[0];
        // Fetch conversation history
        const messages = await db
            .select()
            .from(ticketMessages)
            .where(eq(ticketMessages.ticketId, ticketId))
            .orderBy(desc(ticketMessages.createdAt))
            .limit(10);
        const conversationHistory = messages.reverse().map((msg) => ({
            role: (msg.senderType === "customer" ? "user" : "agent"),
            content: msg.content
        }));
        // Get the latest customer message
        const latestMessage = messages.find((m) => m.senderType === "customer");
        if (!latestMessage) {
            throw new Error("No customer message found");
        }
        // Classify the ticket
        const classification = await classifyTicket(ticketId, ticketData.subject, latestMessage.content);
        // Generate AI response
        const aiResponse = await generateResponse(ticketId, organizationId, ticketData.subject, latestMessage.content, classification, conversationHistory);
        // Auto-respond if enabled, confidence is high enough, and no handoff needed
        let responded = false;
        if (autoRespond && aiResponse.confidence >= confidenceThreshold && !aiResponse.shouldHandoff) {
            // Insert AI response as a ticket message
            await db.insert(ticketMessages).values({
                ticketId,
                senderId: null,
                senderType: "ai",
                content: aiResponse.response,
                isInternal: false,
                createdAt: new Date()
            });
            // Update ticket status to "pending" if it was "open"
            if (ticketData.status === "open") {
                await db
                    .update(tickets)
                    .set({ status: "pending", updatedAt: new Date() })
                    .where(eq(tickets.id, ticketId));
            }
            responded = true;
        }
        return {
            classification,
            aiResponse,
            responded
        };
    }
    catch (error) {
        console.error("[AI Agent] Ticket processing error:", error);
        throw error;
    }
}
