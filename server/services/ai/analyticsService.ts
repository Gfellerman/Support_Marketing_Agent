/**
 * AI Analytics Service
 * Provides metrics, trends, and insights for AI performance optimization
 */

import { getDb } from "../../db";
import { aiInteractions, aiFeedback, aiKnowledge } from "../../../drizzle/schema";
import { eq, and, desc, sql, gte, lte, count, avg, sum } from "drizzle-orm";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DashboardMetrics {
  totalResponses: number;
  responsesUsed: number;
  responsesRejected: number;
  responsesEdited: number;
  usageRate: number;
  positiveRating: number;
  negativeRating: number;
  satisfactionRate: number;
  avgEditDistance: number;
  avgConfidence: number;
  avgLatencyMs: number;
  totalTokensUsed: number;
}

export interface CategoryMetrics {
  category: string;
  totalResponses: number;
  usageRate: number;
  satisfactionRate: number;
  avgConfidence: number;
}

export interface TrendDataPoint {
  date: string;
  totalResponses: number;
  usageRate: number;
  satisfactionRate: number;
  avgConfidence: number;
}

export interface AgentAdoption {
  agentId: number;
  agentName: string;
  totalInteractions: number;
  responsesUsed: number;
  usageRate: number;
}

/**
 * Get dashboard metrics summary
 */
export async function getDashboardMetrics(
  organizationId: number,
  dateRange?: DateRange
): Promise<DashboardMetrics> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Build date conditions
  const conditions = [eq(aiInteractions.organizationId, organizationId)];
  if (dateRange) {
    conditions.push(gte(aiInteractions.createdAt, dateRange.startDate));
    conditions.push(lte(aiInteractions.createdAt, dateRange.endDate));
  }

  // Get interaction metrics
  const interactionStats = await db
    .select({
      total: count(),
      used: sql<number>`SUM(CASE WHEN ${aiInteractions.wasUsed} = true THEN 1 ELSE 0 END)`,
      avgConfidence: avg(aiInteractions.confidenceScore),
      avgLatency: avg(aiInteractions.latencyMs),
      totalInputTokens: sum(aiInteractions.inputTokens),
      totalOutputTokens: sum(aiInteractions.outputTokens),
    })
    .from(aiInteractions)
    .where(and(...conditions));

  // Get feedback metrics
  const feedbackConditions = [eq(aiFeedback.organizationId, organizationId)];
  if (dateRange) {
    feedbackConditions.push(gte(aiFeedback.createdAt, dateRange.startDate));
    feedbackConditions.push(lte(aiFeedback.createdAt, dateRange.endDate));
  }

  const feedbackStats = await db
    .select({
      total: count(),
      positive: sql<number>`SUM(CASE WHEN ${aiFeedback.rating} = 'positive' THEN 1 ELSE 0 END)`,
      negative: sql<number>`SUM(CASE WHEN ${aiFeedback.rating} = 'negative' THEN 1 ELSE 0 END)`,
      edited: sql<number>`SUM(CASE WHEN ${aiFeedback.wasEdited} = true THEN 1 ELSE 0 END)`,
      avgEditDistance: avg(aiFeedback.editDistance),
    })
    .from(aiFeedback)
    .where(and(...feedbackConditions));

  const stats = interactionStats[0];
  const feedback = feedbackStats[0];

  const totalResponses = Number(stats?.total || 0);
  const responsesUsed = Number(stats?.used || 0);
  const responsesEdited = Number(feedback?.edited || 0);
  const responsesRejected = totalResponses - responsesUsed;
  const positiveRating = Number(feedback?.positive || 0);
  const negativeRating = Number(feedback?.negative || 0);
  const totalFeedback = positiveRating + negativeRating;

  return {
    totalResponses,
    responsesUsed,
    responsesRejected,
    responsesEdited,
    usageRate: totalResponses > 0 ? (responsesUsed / totalResponses) * 100 : 0,
    positiveRating,
    negativeRating,
    satisfactionRate: totalFeedback > 0 ? (positiveRating / totalFeedback) * 100 : 0,
    avgEditDistance: Number(feedback?.avgEditDistance || 0),
    avgConfidence: Number(stats?.avgConfidence || 0) * 100,
    avgLatencyMs: Number(stats?.avgLatency || 0),
    totalTokensUsed: Number(stats?.totalInputTokens || 0) + Number(stats?.totalOutputTokens || 0),
  };
}

/**
 * Get metrics broken down by category
 */
export async function getMetricsByCategory(
  organizationId: number,
  dateRange?: DateRange
): Promise<CategoryMetrics[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(aiFeedback.organizationId, organizationId)];
  if (dateRange) {
    conditions.push(gte(aiFeedback.createdAt, dateRange.startDate));
    conditions.push(lte(aiFeedback.createdAt, dateRange.endDate));
  }

  const results = await db
    .select({
      category: aiFeedback.category,
      total: count(),
      used: sql<number>`SUM(CASE WHEN ${aiFeedback.wasUsed} = true THEN 1 ELSE 0 END)`,
      positive: sql<number>`SUM(CASE WHEN ${aiFeedback.rating} = 'positive' THEN 1 ELSE 0 END)`,
    })
    .from(aiFeedback)
    .where(and(...conditions))
    .groupBy(aiFeedback.category);

  return results
    .filter(r => r.category)
    .map(r => ({
      category: r.category || "unknown",
      totalResponses: Number(r.total),
      usageRate: r.total > 0 ? (Number(r.used) / Number(r.total)) * 100 : 0,
      satisfactionRate: r.total > 0 ? (Number(r.positive) / Number(r.total)) * 100 : 0,
      avgConfidence: 0, // Would need join with aiInteractions
    }));
}

/**
 * Get trend data over time
 */
export async function getTrends(
  organizationId: number,
  dateRange: DateRange,
  granularity: "day" | "week" | "month" = "day"
): Promise<TrendDataPoint[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Build date format based on granularity
  const dateFormat = granularity === "day" ? "%Y-%m-%d" 
    : granularity === "week" ? "%Y-%u" 
    : "%Y-%m";

  const results = await db
    .select({
      date: sql<string>`DATE_FORMAT(${aiInteractions.createdAt}, ${dateFormat})`,
      total: count(),
      used: sql<number>`SUM(CASE WHEN ${aiInteractions.wasUsed} = true THEN 1 ELSE 0 END)`,
      avgConfidence: avg(aiInteractions.confidenceScore),
    })
    .from(aiInteractions)
    .where(and(
      eq(aiInteractions.organizationId, organizationId),
      gte(aiInteractions.createdAt, dateRange.startDate),
      lte(aiInteractions.createdAt, dateRange.endDate)
    ))
    .groupBy(sql`DATE_FORMAT(${aiInteractions.createdAt}, ${dateFormat})`)
    .orderBy(sql`DATE_FORMAT(${aiInteractions.createdAt}, ${dateFormat})`);

  // Get feedback trends in parallel
  const feedbackTrends = await db
    .select({
      date: sql<string>`DATE_FORMAT(${aiFeedback.createdAt}, ${dateFormat})`,
      positive: sql<number>`SUM(CASE WHEN ${aiFeedback.rating} = 'positive' THEN 1 ELSE 0 END)`,
      total: count(),
    })
    .from(aiFeedback)
    .where(and(
      eq(aiFeedback.organizationId, organizationId),
      gte(aiFeedback.createdAt, dateRange.startDate),
      lte(aiFeedback.createdAt, dateRange.endDate)
    ))
    .groupBy(sql`DATE_FORMAT(${aiFeedback.createdAt}, ${dateFormat})`);

  // Merge feedback data
  const feedbackMap = new Map(feedbackTrends.map(f => [f.date, f]));

  return results.map(r => {
    const fb = feedbackMap.get(r.date);
    return {
      date: r.date,
      totalResponses: Number(r.total),
      usageRate: r.total > 0 ? (Number(r.used) / Number(r.total)) * 100 : 0,
      satisfactionRate: fb && fb.total > 0 ? (Number(fb.positive) / Number(fb.total)) * 100 : 0,
      avgConfidence: Number(r.avgConfidence || 0) * 100,
    };
  });
}

/**
 * Get agent adoption rates
 */
export async function getAgentAdoption(
  organizationId: number,
  dateRange?: DateRange
): Promise<AgentAdoption[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { users } = await import("../../../drizzle/schema");

  const conditions = [eq(aiFeedback.organizationId, organizationId)];
  if (dateRange) {
    conditions.push(gte(aiFeedback.createdAt, dateRange.startDate));
    conditions.push(lte(aiFeedback.createdAt, dateRange.endDate));
  }

  const results = await db
    .select({
      agentId: aiFeedback.agentId,
      total: count(),
      used: sql<number>`SUM(CASE WHEN ${aiFeedback.wasUsed} = true THEN 1 ELSE 0 END)`,
    })
    .from(aiFeedback)
    .where(and(...conditions))
    .groupBy(aiFeedback.agentId);

  // Get agent names
  const agentIds = results.map(r => r.agentId).filter(Boolean) as number[];
  const agentMap = new Map<number, string>();
  
  if (agentIds.length > 0) {
    const agents = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(sql`${users.id} IN (${agentIds.join(",")})`);
    
    agents.forEach(a => agentMap.set(a.id, a.name || "Unknown"));
  }

  return results
    .filter(r => r.agentId)
    .map(r => ({
      agentId: r.agentId!,
      agentName: agentMap.get(r.agentId!) || "Unknown Agent",
      totalInteractions: Number(r.total),
      responsesUsed: Number(r.used),
      usageRate: r.total > 0 ? (Number(r.used) / Number(r.total)) * 100 : 0,
    }))
    .sort((a, b) => b.totalInteractions - a.totalInteractions);
}

/**
 * Get top performing prompts/templates based on usage and satisfaction
 */
export async function getTopPerformingTemplates(
  organizationId: number,
  limit: number = 10
): Promise<Array<{ tone: string; usageRate: number; satisfactionRate: number; count: number }>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select({
      tone: aiFeedback.tone,
      total: count(),
      used: sql<number>`SUM(CASE WHEN ${aiFeedback.wasUsed} = true THEN 1 ELSE 0 END)`,
      positive: sql<number>`SUM(CASE WHEN ${aiFeedback.rating} = 'positive' THEN 1 ELSE 0 END)`,
    })
    .from(aiFeedback)
    .where(eq(aiFeedback.organizationId, organizationId))
    .groupBy(aiFeedback.tone)
    .limit(limit);

  return results
    .filter(r => r.tone)
    .map(r => ({
      tone: r.tone || "unknown",
      count: Number(r.total),
      usageRate: r.total > 0 ? (Number(r.used) / Number(r.total)) * 100 : 0,
      satisfactionRate: r.total > 0 ? (Number(r.positive) / Number(r.total)) * 100 : 0,
    }))
    .sort((a, b) => b.satisfactionRate - a.satisfactionRate);
}

/**
 * Get knowledge base effectiveness metrics
 */
export async function getKnowledgeBaseMetrics(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Count knowledge articles
  const articleCount = await db
    .select({ count: count() })
    .from(aiKnowledge)
    .where(and(
      eq(aiKnowledge.organizationId, organizationId),
      eq(aiKnowledge.isActive, true)
    ));

  // Get categories
  const categories = await db
    .select({
      category: aiKnowledge.category,
      count: count(),
    })
    .from(aiKnowledge)
    .where(and(
      eq(aiKnowledge.organizationId, organizationId),
      eq(aiKnowledge.isActive, true)
    ))
    .groupBy(aiKnowledge.category);

  return {
    totalArticles: Number(articleCount[0]?.count || 0),
    categories: categories.map(c => ({
      category: c.category || "uncategorized",
      count: Number(c.count),
    })),
  };
}
