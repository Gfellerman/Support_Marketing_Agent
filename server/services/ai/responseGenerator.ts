/**
 * AI Response Generator
 * Generates contextual support responses using Groq/Llama
 */

import { createCompletion, GROQ_MODELS } from "./groqService";
import { buildResponseSystemPrompt, buildResponseUserPrompt, type ResponseGenerationContext, type OrderContext } from "./prompts/response";
import { buildResponseContext } from "./contextBuilder";
import { ORDER_RESPONSE_TEMPLATES, hydrateTemplate, getQuickActionsForIssue, type OrderIssueType } from "./prompts/orderResponses";

export type ResponseTone = 'professional' | 'friendly' | 'empathetic';

export interface GenerateResponseInput {
  ticketId?: string;
  ticketSubject: string;
  ticketContent: string;
  organizationId: string;
  organizationName?: string;
  tone?: ResponseTone;
  customerId?: string;
  orderContext?: OrderContext;
  additionalContext?: string;
}

export interface GeneratedResponse {
  content: string;
  tone: ResponseTone;
  confidence: number;
  suggestedActions: string[];
  tokensUsed: number;
  latencyMs: number;
}

export interface MultipleResponsesResult {
  responses: GeneratedResponse[];
  primaryRecommendation: ResponseTone;
  quickActions: string[];
}

/**
 * Detect order issue type from ticket content
 */
function detectOrderIssue(content: string): OrderIssueType | null {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('damaged') || lowerContent.includes('broken') || lowerContent.includes('defective')) {
    return 'damaged';
  }
  if (lowerContent.includes('wrong item') || lowerContent.includes('wrong product') || lowerContent.includes('not what i ordered')) {
    return 'wrong_item';
  }
  if (lowerContent.includes('missing') || lowerContent.includes('not included')) {
    return 'missing_item';
  }
  if (lowerContent.includes('refund') || lowerContent.includes('money back')) {
    return 'refund_request';
  }
  if (lowerContent.includes('cancel') || lowerContent.includes('cancellation')) {
    return 'cancellation';
  }
  if (lowerContent.includes('track') || lowerContent.includes('where is my order') || lowerContent.includes('shipping status')) {
    return 'tracking';
  }
  if (lowerContent.includes('return') || lowerContent.includes('send back')) {
    return 'return_request';
  }
  if (lowerContent.includes('delay') || lowerContent.includes('late') || lowerContent.includes('hasn\'t arrived') || lowerContent.includes('not received')) {
    return 'delayed';
  }
  if (lowerContent.includes('delivery') || lowerContent.includes('deliver')) {
    return 'delivery_issue';
  }
  
  return null;
}

/**
 * Build tone-specific system prompt additions
 */
function getToneInstructions(tone: ResponseTone): string {
  switch (tone) {
    case 'professional':
      return `\n\nTONE: Professional and formal. Use complete sentences, proper grammar, and maintain a business-appropriate tone. Address customer formally.`;
    case 'friendly':
      return `\n\nTONE: Friendly and conversational. Be warm and approachable while still helpful. Use casual language, contractions, and feel free to add appropriate emoji sparingly.`;
    case 'empathetic':
      return `\n\nTONE: Empathetic and understanding. Acknowledge the customer's feelings first. Show genuine concern and make them feel heard. Prioritize emotional connection before solutions.`;
    default:
      return '';
  }
}

/**
 * Extract suggested actions from AI response or context
 */
function extractSuggestedActions(content: string, issueType: OrderIssueType | null): string[] {
  const actions: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // From detected issue
  if (issueType) {
    actions.push(...getQuickActionsForIssue(issueType));
  }
  
  // From response content
  if (lowerContent.includes('refund')) actions.push('process_refund');
  if (lowerContent.includes('replacement')) actions.push('send_replacement');
  if (lowerContent.includes('return label')) actions.push('generate_return_label');
  if (lowerContent.includes('tracking')) actions.push('share_tracking_link');
  if (lowerContent.includes('discount') || lowerContent.includes('coupon')) actions.push('offer_discount');
  if (lowerContent.includes('escalate') || lowerContent.includes('supervisor')) actions.push('escalate');
  
  // Deduplicate
  return [...new Set(actions)];
}

/**
 * Generate a single response with specified tone
 */
export async function generateResponse(input: GenerateResponseInput): Promise<GeneratedResponse> {
  const tone = input.tone || 'professional';
  
  // Build context
  let context: ResponseGenerationContext = {
    organizationName: input.organizationName,
  };
  
  // Enrich with ticket context if ticketId provided
  if (input.ticketId) {
    const ticketContext = await buildResponseContext(input.ticketId, input.organizationId);
    context = { ...context, ...ticketContext };
  }
  
  // Add order context if provided
  if (input.orderContext) {
    context.recentOrders = [input.orderContext];
  }
  
  // Build prompts
  let systemPrompt = buildResponseSystemPrompt(context);
  systemPrompt += getToneInstructions(tone);
  
  const userPrompt = buildResponseUserPrompt(
    input.ticketSubject,
    input.ticketContent,
    input.additionalContext
  );
  
  // Generate response
  const result = await createCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: GROQ_MODELS.DEEP,
    temperature: 0.7,
    maxTokens: 1024,
  });
  
  const issueType = detectOrderIssue(input.ticketContent);
  const suggestedActions = extractSuggestedActions(result.content, issueType);
  
  return {
    content: result.content.trim(),
    tone,
    confidence: 0.85, // Could be calculated based on context richness
    suggestedActions,
    tokensUsed: result.usage.totalTokens,
    latencyMs: result.latencyMs,
  };
}

/**
 * Generate multiple responses in different tones
 */
export async function generateMultipleResponses(
  input: Omit<GenerateResponseInput, 'tone'>
): Promise<MultipleResponsesResult> {
  const tones: ResponseTone[] = ['professional', 'friendly', 'empathetic'];
  
  // Generate all three in parallel
  const responsePromises = tones.map(tone => 
    generateResponse({ ...input, tone })
  );
  
  const responses = await Promise.all(responsePromises);
  
  // Determine primary recommendation based on sentiment
  let primaryRecommendation: ResponseTone = 'professional';
  
  // Build context to check sentiment
  if (input.ticketId) {
    const context = await buildResponseContext(input.ticketId, input.organizationId);
    if (context.sentiment === 'negative' || context.sentiment === 'frustrated') {
      primaryRecommendation = 'empathetic';
    } else if (context.customer?.isVip) {
      primaryRecommendation = 'friendly';
    }
  }
  
  // Angry/frustrated content detection
  const lowerContent = input.ticketContent.toLowerCase();
  if (lowerContent.includes('angry') || lowerContent.includes('frustrated') || 
      lowerContent.includes('unacceptable') || lowerContent.includes('terrible')) {
    primaryRecommendation = 'empathetic';
  }
  
  // Collect all quick actions
  const quickActions = [...new Set(responses.flatMap(r => r.suggestedActions))];
  
  return {
    responses,
    primaryRecommendation,
    quickActions,
  };
}

/**
 * Get quick actions based on ticket content without generating full response
 */
export async function getQuickActions(input: {
  ticketContent: string;
  ticketSubject: string;
}): Promise<{ actions: string[]; issueType: OrderIssueType | null }> {
  const issueType = detectOrderIssue(input.ticketContent + ' ' + input.ticketSubject);
  const actions = issueType ? getQuickActionsForIssue(issueType) : [];
  
  // Add generic actions
  if (actions.length === 0) {
    actions.push('reply', 'escalate', 'close_ticket');
  }
  
  return { actions, issueType };
}

/**
 * Generate response from template (faster, no AI call)
 */
export function generateTemplateResponse(
  issueType: OrderIssueType,
  tone: ResponseTone,
  order?: OrderContext,
  customerName?: string
): GeneratedResponse | null {
  const templates = ORDER_RESPONSE_TEMPLATES[issueType];
  if (!templates || templates.length === 0) return null;
  
  const template = templates.find(t => t.tone === tone) || templates[0];
  const content = hydrateTemplate(template.template, order, customerName);
  
  return {
    content,
    tone: template.tone,
    confidence: 0.95, // Templates are high confidence
    suggestedActions: template.suggestedActions,
    tokensUsed: 0,
    latencyMs: 0,
  };
}

export default {
  generateResponse,
  generateMultipleResponses,
  getQuickActions,
  generateTemplateResponse,
  detectOrderIssue,
};
