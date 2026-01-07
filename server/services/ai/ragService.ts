/**
 * RAG Service - Retrieval Augmented Generation for knowledge-grounded responses
 * Combines knowledge base search with AI response generation
 */

import { findRelevantKnowledge } from "./knowledgeBase";
import { searchKnowledge, type SearchResult } from "./vectorStore";
import { createCompletion, GROQ_MODELS } from "./groqService";
import { buildCustomerContext, type FullCustomerContext as CustomerContext } from "./contextBuilder";
import { getDb } from "../../db";
import { orders } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Types
export interface RAGContext {
  knowledgeArticles: {
    title: string;
    content: string;
    category?: string | null;
    relevanceScore: number;
  }[];
  totalArticlesFound: number;
  contextUsed: boolean;
}

export interface RAGResponseInput {
  ticketId?: string;
  ticketSubject: string;
  ticketContent: string;
  organizationId: number;
  organizationName: string;
  customerId?: string;
  orderNumber?: string;
  tone?: 'professional' | 'friendly' | 'empathetic';
  additionalContext?: string;
  maxKnowledgeArticles?: number;
}

export interface RAGResponse {
  response: string;
  confidence: number;
  tone: string;
  ragContext: RAGContext;
  metadata: {
    model: string;
    tokensUsed: number;
    latencyMs: number;
    knowledgeSourcesUsed: number;
  };
}

// Build RAG context from knowledge base
export async function buildRAGContext(
  organizationId: number,
  query: string,
  maxArticles = 3,
  minRelevance = 0.15
): Promise<RAGContext> {
  try {
    const results = await searchKnowledge(organizationId, query, maxArticles, minRelevance);

    return {
      knowledgeArticles: results.map(r => ({
        title: r.document.title,
        content: r.document.content,
        category: r.document.category,
        relevanceScore: r.relevanceScore
      })),
      totalArticlesFound: results.length,
      contextUsed: results.length > 0
    };
  } catch (error) {
    console.error("Error building RAG context:", error);
    return {
      knowledgeArticles: [],
      totalArticlesFound: 0,
      contextUsed: false
    };
  }
}

// Format knowledge context for prompt
function formatKnowledgeContext(ragContext: RAGContext): string {
  if (!ragContext.contextUsed || ragContext.knowledgeArticles.length === 0) {
    return "";
  }

  const articles = ragContext.knowledgeArticles
    .map((article, idx) => {
      return `
### Knowledge Article ${idx + 1}: ${article.title}
${article.content}
`;
    })
    .join("\n");

  return `
## RELEVANT KNOWLEDGE BASE ARTICLES
Use the following knowledge base articles to inform your response. Prioritize information from these sources:
${articles}
---`;
}

// Build the RAG-enhanced prompt
function buildRAGPrompt(
  input: RAGResponseInput,
  ragContext: RAGContext,
  customerContext?: CustomerContext | null,
  orderInfo?: any
): string {
  const toneInstructions = {
    professional: "Use a professional, business-like tone. Be clear and concise.",
    friendly: "Use a warm, friendly tone. Be personable and approachable.",
    empathetic: "Use an empathetic, understanding tone. Acknowledge the customer's feelings."
  };

  const tone = input.tone || 'professional';
  const knowledgeContext = formatKnowledgeContext(ragContext);

  let prompt = `You are a helpful customer support agent for ${input.organizationName}. Your goal is to provide accurate, helpful responses to customer inquiries.

## TONE
${toneInstructions[tone]}

## IMPORTANT GUIDELINES
- Use ONLY information from the provided knowledge base articles when available
- If the knowledge base doesn't cover the question, provide a helpful general response
- Never make up information about policies, prices, or specific details
- Be concise but complete in your response
- Include specific action items when relevant
- Always end with an offer to help further

${knowledgeContext}
`;

  // Add customer context if available
  if (customerContext && customerContext.customer) {
    prompt += `
## CUSTOMER CONTEXT
- Customer: ${customerContext.customer.name || 'Unknown'}
- VIP Status: ${customerContext.valueMetrics?.isVip ? "Yes" : "No"}
- Total Orders: ${customerContext.valueMetrics?.totalOrders || 0}
- Lifetime Value: $${(customerContext.valueMetrics?.lifetimeValue || 0).toFixed(2)}
`;
  }

  // Add order context if available
  if (orderInfo) {
    prompt += `
## ORDER INFORMATION
- Order Number: ${orderInfo.orderNumber}
- Status: ${orderInfo.status}
- Total: $${orderInfo.totalPrice}
${orderInfo.trackingNumber ? `- Tracking: ${orderInfo.trackingNumber}` : ""}
`;
  }

  // Add additional context
  if (input.additionalContext) {
    prompt += `
## ADDITIONAL CONTEXT
${input.additionalContext}
`;
  }

  // Add the ticket
  prompt += `
## CUSTOMER TICKET
Subject: ${input.ticketSubject}

Message:
${input.ticketContent}

## YOUR RESPONSE
Write a helpful response to this customer inquiry:`;

  return prompt;
}

// Generate RAG-enhanced response
export async function generateRAGResponse(input: RAGResponseInput): Promise<RAGResponse> {
  const startTime = Date.now();

  // 1. Build RAG context from knowledge base
  const searchQuery = `${input.ticketSubject} ${input.ticketContent}`;
  const ragContext = await buildRAGContext(
    input.organizationId,
    searchQuery,
    input.maxKnowledgeArticles || 3
  );

  // 2. Get customer context if available
  let customerContext: CustomerContext | null = null;
  if (input.customerId) {
    customerContext = await buildCustomerContext(input.customerId, String(input.organizationId));
  }

  // 3. Get order info if order number provided
  let orderInfo = null;
  if (input.orderNumber) {
    const db = await getDb();
    if (db) {
      const orderResults = await db
        .select()
        .from(orders)
        .where(and(
          eq(orders.organizationId, input.organizationId),
          eq(orders.orderNumber, input.orderNumber)
        ))
        .limit(1);
      orderInfo = orderResults[0] || null;
    }
  }

  // 4. Build the enhanced prompt
  const prompt = buildRAGPrompt(input, ragContext, customerContext, orderInfo);

  // 5. Generate response using Groq
  let response: string;
  let tokensUsed = 0;
  let confidence = 0.85;

  try {
    const result = await createCompletion({
      messages: [
        {
          role: "system",
          content: "You are an expert customer support agent. Provide helpful, accurate responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: GROQ_MODELS.DEEP,
      temperature: 0.7,
      maxTokens: 1000
    });

    response = result.content;
    tokensUsed = result.usage?.totalTokens || 0;

    // Adjust confidence based on RAG context usage
    if (ragContext.contextUsed) {
      confidence = Math.min(0.95, 0.85 + (ragContext.totalArticlesFound * 0.03));
    }
  } catch (error) {
    console.error("Error generating RAG response:", error);
    throw new Error("Failed to generate response");
  }

  const latencyMs = Date.now() - startTime;

  return {
    response,
    confidence,
    tone: input.tone || 'professional',
    ragContext,
    metadata: {
      model: "llama-3.3-70b-versatile",
      tokensUsed,
      latencyMs,
      knowledgeSourcesUsed: ragContext.totalArticlesFound
    }
  };
}

// Generate multiple responses with RAG (all tones)
export async function generateMultipleRAGResponses(
  input: Omit<RAGResponseInput, 'tone'>
): Promise<{
  professional: RAGResponse;
  friendly: RAGResponse;
  empathetic: RAGResponse;
  ragContext: RAGContext;
}> {
  // Build RAG context once for all responses
  const searchQuery = `${input.ticketSubject} ${input.ticketContent}`;
  const ragContext = await buildRAGContext(
    input.organizationId,
    searchQuery,
    input.maxKnowledgeArticles || 3
  );

  // Generate responses in parallel
  const [professional, friendly, empathetic] = await Promise.all([
    generateRAGResponse({ ...input, tone: 'professional' }),
    generateRAGResponse({ ...input, tone: 'friendly' }),
    generateRAGResponse({ ...input, tone: 'empathetic' })
  ]);

  return {
    professional,
    friendly,
    empathetic,
    ragContext
  };
}

// Quick check if knowledge base has relevant articles
export async function hasRelevantKnowledge(
  organizationId: number,
  query: string,
  minRelevance = 0.2
): Promise<boolean> {
  const results = await searchKnowledge(organizationId, query, 1, minRelevance);
  return results.length > 0;
}
