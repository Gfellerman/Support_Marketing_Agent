/**
 * AI Hooks for Helpdesk Features
 * Provides React Query-powered hooks for AI operations
 */

import { trpc } from "@/lib/trpc";
import { useState, useCallback } from "react";

// Types
export interface ClassificationResult {
  category: string;
  priority: string;
  sentiment: string;
  sentimentScore: number;
  confidence: number;
  processingTimeMs: number;
  urgencyIndicators: string[];
  suggestedActions: string[];
}

export interface AIResponse {
  content: string;
  tone: 'professional' | 'friendly' | 'empathetic';
  confidence: number;
  knowledgeSourcesUsed?: string[];
  processingTimeMs?: number;
}

export interface CustomerContext {
  customerId: string;
  name: string;
  email: string;
  isVIP: boolean;
  lifetimeValue: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  openTickets: number;
  recentTickets: Array<{
    id: number;
    subject: string;
    status: string;
    createdAt: string;
  }>;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

export interface KnowledgeResult {
  document: {
    id: number;
    title: string;
    content: string;
    category: string | null;
    tags: string[] | null;
  };
  score: number;
}

/**
 * Hook for ticket classification
 */
export function useTicketClassification() {
  const classifyByIdMutation = trpc.aiClassification.classifyById.useMutation();
  const classifyContentMutation = trpc.aiClassification.classifyContent.useMutation();
  const analyzeSentimentMutation = trpc.aiClassification.analyzeSentiment.useMutation();
  const batchClassifyMutation = trpc.aiClassification.batchClassify.useMutation();

  const classifyById = useCallback(async (ticketId: number, updateTicket = true) => {
    return classifyByIdMutation.mutateAsync({ ticketId, updateTicket });
  }, [classifyByIdMutation]);

  const classifyContent = useCallback(async (
    subject: string,
    message: string,
    customerContext?: { name?: string; totalOrders?: number; lifetimeValue?: number }
  ) => {
    return classifyContentMutation.mutateAsync({ subject, message, customerContext });
  }, [classifyContentMutation]);

  const analyzeSentiment = useCallback(async (message: string) => {
    return analyzeSentimentMutation.mutateAsync({ message });
  }, [analyzeSentimentMutation]);

  const batchClassify = useCallback(async (ticketIds: number[], updateTickets = true) => {
    return batchClassifyMutation.mutateAsync({ ticketIds, updateTickets });
  }, [batchClassifyMutation]);

  return {
    classifyById,
    classifyContent,
    analyzeSentiment,
    batchClassify,
    isClassifying: classifyByIdMutation.isPending || classifyContentMutation.isPending,
    isAnalyzingSentiment: analyzeSentimentMutation.isPending,
    isBatchClassifying: batchClassifyMutation.isPending,
    error: classifyByIdMutation.error || classifyContentMutation.error,
  };
}

/**
 * Hook for AI response generation
 */
export function useAIResponses() {
  const generateMutation = trpc.ai.responses.generate.useMutation();
  const generateMultipleMutation = trpc.ai.responses.generateMultiple.useMutation();
  const generateWithKnowledgeMutation = trpc.ai.responses.generateWithKnowledge.useMutation();
  const generateMultipleWithKnowledgeMutation = trpc.ai.responses.generateMultipleWithKnowledge.useMutation();

  const generate = useCallback(async (params: {
    ticketId?: string;
    ticketSubject: string;
    ticketContent: string;
    tone?: 'professional' | 'friendly' | 'empathetic';
    customerId?: string;
    orderNumber?: string;
    additionalContext?: string;
  }) => {
    return generateMutation.mutateAsync(params);
  }, [generateMutation]);

  const generateMultiple = useCallback(async (params: {
    ticketId?: string;
    ticketSubject: string;
    ticketContent: string;
    customerId?: string;
    orderNumber?: string;
    additionalContext?: string;
  }) => {
    return generateMultipleMutation.mutateAsync(params);
  }, [generateMultipleMutation]);

  const generateWithKnowledge = useCallback(async (params: {
    ticketId?: string;
    ticketSubject: string;
    ticketContent: string;
    tone?: 'professional' | 'friendly' | 'empathetic';
    customerId?: string;
    orderNumber?: string;
    additionalContext?: string;
    maxKnowledgeArticles?: number;
  }) => {
    return generateWithKnowledgeMutation.mutateAsync(params);
  }, [generateWithKnowledgeMutation]);

  const generateMultipleWithKnowledge = useCallback(async (params: {
    ticketId?: string;
    ticketSubject: string;
    ticketContent: string;
    customerId?: string;
    orderNumber?: string;
    additionalContext?: string;
    maxKnowledgeArticles?: number;
  }) => {
    return generateMultipleWithKnowledgeMutation.mutateAsync(params);
  }, [generateMultipleWithKnowledgeMutation]);

  return {
    generate,
    generateMultiple,
    generateWithKnowledge,
    generateMultipleWithKnowledge,
    isGenerating: generateMutation.isPending || generateWithKnowledgeMutation.isPending,
    isGeneratingMultiple: generateMultipleMutation.isPending || generateMultipleWithKnowledgeMutation.isPending,
    error: generateMutation.error || generateMultipleMutation.error,
  };
}

/**
 * Hook for knowledge base operations
 */
export function useKnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchResults = trpc.ai.responses.searchKnowledge.useQuery(
    { query: searchQuery, topK: 5 },
    { enabled: searchQuery.length > 2 }
  );

  const previewContext = trpc.ai.responses.previewRAGContext.useQuery;
  const refreshIndexMutation = trpc.ai.responses.refreshKnowledgeIndex.useMutation();

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const refreshIndex = useCallback(async () => {
    return refreshIndexMutation.mutateAsync();
  }, [refreshIndexMutation]);

  return {
    search,
    searchQuery,
    searchResults: searchResults.data || [],
    isSearching: searchResults.isLoading,
    previewContext,
    refreshIndex,
    isRefreshing: refreshIndexMutation.isPending,
  };
}

/**
 * Hook for customer context
 */
export function useCustomerContext(customerId: string | null) {
  const query = trpc.ai.responses.getCustomerContext.useQuery(
    { customerId: customerId || '' },
    { enabled: !!customerId }
  );

  return {
    context: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for quick actions
 */
export function useQuickActions(ticketSubject: string, ticketContent: string) {
  const query = trpc.ai.responses.getQuickActions.useQuery(
    { ticketSubject, ticketContent },
    { enabled: !!(ticketSubject || ticketContent) }
  );

  const data = query.data as any;
  return {
    actions: data?.actions || [],
    primaryAction: data?.primaryAction || (data?.actions?.[0] || null),
    isLoading: query.isLoading,
    error: query.error,
  };
}
