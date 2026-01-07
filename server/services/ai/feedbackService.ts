/**
 * AI Feedback Service
 * Records and manages feedback on AI-generated responses for continuous improvement
 */

import { getDb } from "../../db";
import { aiFeedback, aiInteractions } from "../../../drizzle/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export type FeedbackRating = "positive" | "negative";

export interface SubmitFeedbackInput {
  organizationId: number;
  interactionId: number;
  agentId?: number;
  rating: FeedbackRating;
  wasUsed?: boolean;
  wasEdited?: boolean;
  originalResponse?: string;
  finalResponse?: string;
  category?: string;
  tone?: string;
  comment?: string;
}

export interface TrackUsageInput {
  organizationId: number;
  interactionId: number;
  agentId?: number;
  wasUsed: boolean;
  wasEdited: boolean;
  originalResponse?: string;
  finalResponse?: string;
}

/**
 * Calculate Levenshtein edit distance between two strings
 */
export function calculateEditDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create 2D array for DP
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Submit feedback (thumbs up/down) on an AI response
 */
export async function submitFeedback(input: SubmitFeedbackInput): Promise<{ success: boolean; feedbackId: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate edit distance if both original and final responses provided
  let editDistance: number | undefined;
  if (input.originalResponse && input.finalResponse) {
    editDistance = calculateEditDistance(input.originalResponse, input.finalResponse);
  }

  const result = await db.insert(aiFeedback).values({
    organizationId: input.organizationId,
    interactionId: input.interactionId,
    agentId: input.agentId,
    rating: input.rating,
    wasUsed: input.wasUsed ?? false,
    wasEdited: input.wasEdited ?? false,
    editDistance,
    originalResponse: input.originalResponse,
    finalResponse: input.finalResponse,
    category: input.category,
    tone: input.tone,
    comment: input.comment,
  });

  // Also update the aiInteractions table
  await db.update(aiInteractions)
    .set({
      wasUsed: input.wasUsed ?? false,
      feedback: input.rating === "positive" ? "positive" : (input.wasEdited ? "edited" : "negative"),
    })
    .where(eq(aiInteractions.id, input.interactionId));

  return { success: true, feedbackId: Number(result.insertId) };
}

/**
 * Track usage of an AI response (used/edited/rejected)
 */
export async function trackUsage(input: TrackUsageInput): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate edit distance if edited
  let editDistance: number | undefined;
  if (input.wasEdited && input.originalResponse && input.finalResponse) {
    editDistance = calculateEditDistance(input.originalResponse, input.finalResponse);
  }

  // Check if feedback already exists for this interaction
  const existing = await db.select()
    .from(aiFeedback)
    .where(eq(aiFeedback.interactionId, input.interactionId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing feedback
    await db.update(aiFeedback)
      .set({
        wasUsed: input.wasUsed,
        wasEdited: input.wasEdited,
        editDistance,
        finalResponse: input.finalResponse,
      })
      .where(eq(aiFeedback.interactionId, input.interactionId));
  } else {
    // Create new feedback entry (neutral - no rating yet)
    await db.insert(aiFeedback).values({
      organizationId: input.organizationId,
      interactionId: input.interactionId,
      agentId: input.agentId,
      rating: input.wasUsed ? "positive" : "negative", // Implicit rating based on usage
      wasUsed: input.wasUsed,
      wasEdited: input.wasEdited,
      editDistance,
      originalResponse: input.originalResponse,
      finalResponse: input.finalResponse,
    });
  }

  // Update aiInteractions table
  await db.update(aiInteractions)
    .set({
      wasUsed: input.wasUsed,
      feedback: input.wasEdited ? "edited" : (input.wasUsed ? "positive" : "negative"),
    })
    .where(eq(aiInteractions.id, input.interactionId));

  return { success: true };
}

/**
 * Get feedback for a specific interaction
 */
export async function getFeedbackByInteraction(interactionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(aiFeedback)
    .where(eq(aiFeedback.interactionId, interactionId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get recent feedback for an organization
 */
export async function getRecentFeedback(organizationId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(aiFeedback)
    .where(eq(aiFeedback.organizationId, organizationId))
    .orderBy(desc(aiFeedback.createdAt))
    .limit(limit);

  return result;
}
