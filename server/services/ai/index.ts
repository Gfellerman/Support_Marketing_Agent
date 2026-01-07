/**
 * AI Services - Index
 */

export * from "./groqService";
export { 
  classifyTicket, 
  analyzeSentiment,
  type TicketClassificationResult,
} from "./ticketClassifier";
export * from "./prompts/classification";
export * from "./prompts/sentiment";
export { 
  buildResponseSystemPrompt, 
  buildResponseUserPrompt, 
  RESPONSE_TEMPLATES,
  type ResponseGenerationContext,
  type OrderContext,
  type KnowledgeArticle,
} from "./prompts/response";

// Phase 2: Response Generation
export {
  generateResponse,
  generateMultipleResponses,
  getQuickActions,
  generateTemplateResponse,
  type GenerateResponseInput,
  type GeneratedResponse,
  type MultipleResponsesResult,
  type ResponseTone,
} from "./responseGenerator";

export {
  buildCustomerContext,
  buildResponseContext,
  buildOrderContext,
  type FullCustomerContext,
  type CustomerValueMetrics,
  type CustomerEngagement,
} from "./contextBuilder";

export {
  ORDER_RESPONSE_TEMPLATES,
  getTemplatesForIssue,
  getTemplateByTone,
  getQuickActionsForIssue,
  hydrateTemplate,
  type OrderIssueType,
  type OrderResponseTemplate,
} from "./prompts/orderResponses";
