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
