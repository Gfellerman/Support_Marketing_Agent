/**
 * Knowledge Base Service - CRUD operations and search for knowledge articles
 * Integrates with vector store for semantic search
 */

import { getDb } from "../../db";
import { aiKnowledge } from "../../../drizzle/schema";
import { eq, and, desc, like, or, sql } from "drizzle-orm";
import { searchKnowledge, refreshKnowledgeIndex, invalidateKnowledgeIndex, type SearchResult } from "./vectorStore";

// Types
export interface KnowledgeArticle {
  id: number;
  organizationId: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface SearchOptions {
  topK?: number;
  minScore?: number;
  category?: string;
  includeInactive?: boolean;
}

// Knowledge Base Service Class
class KnowledgeBaseService {
  // Create a new knowledge article
  async create(
    organizationId: number,
    createdBy: number,
    input: CreateArticleInput
  ): Promise<KnowledgeArticle> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(aiKnowledge).values({
      organizationId,
      title: input.title,
      content: input.content,
      category: input.category,
      tags: input.tags,
      isActive: input.isActive ?? true,
      createdBy
    });

    // Refresh vector index
    invalidateKnowledgeIndex();

    // Get the created article
    const insertId = result[0].insertId;
    const articles = await db
      .select()
      .from(aiKnowledge)
      .where(eq(aiKnowledge.id, insertId))
      .limit(1);

    return articles[0] as KnowledgeArticle;
  }

  // Update an existing article
  async update(
    articleId: number,
    organizationId: number,
    input: UpdateArticleInput
  ): Promise<KnowledgeArticle> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(aiKnowledge)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(and(
        eq(aiKnowledge.id, articleId),
        eq(aiKnowledge.organizationId, organizationId)
      ));

    // Refresh vector index
    invalidateKnowledgeIndex();

    // Get updated article
    const articles = await db
      .select()
      .from(aiKnowledge)
      .where(eq(aiKnowledge.id, articleId))
      .limit(1);

    if (!articles[0]) {
      throw new Error("Article not found");
    }

    return articles[0] as KnowledgeArticle;
  }

  // Delete an article
  async delete(articleId: number, organizationId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(aiKnowledge)
      .where(and(
        eq(aiKnowledge.id, articleId),
        eq(aiKnowledge.organizationId, organizationId)
      ));

    // Refresh vector index
    invalidateKnowledgeIndex();
  }

  // Get article by ID
  async getById(articleId: number, organizationId: number): Promise<KnowledgeArticle | null> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const articles = await db
      .select()
      .from(aiKnowledge)
      .where(and(
        eq(aiKnowledge.id, articleId),
        eq(aiKnowledge.organizationId, organizationId)
      ))
      .limit(1);

    return (articles[0] as KnowledgeArticle) || null;
  }

  // List all articles for an organization
  async list(
    organizationId: number,
    options: { category?: string; isActive?: boolean; limit?: number; offset?: number } = {}
  ): Promise<KnowledgeArticle[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const conditions = [eq(aiKnowledge.organizationId, organizationId)];

    if (options.category) {
      conditions.push(eq(aiKnowledge.category, options.category));
    }

    if (options.isActive !== undefined) {
      conditions.push(eq(aiKnowledge.isActive, options.isActive));
    }

    const articles = await db
      .select()
      .from(aiKnowledge)
      .where(and(...conditions))
      .orderBy(desc(aiKnowledge.updatedAt))
      .limit(options.limit || 100)
      .offset(options.offset || 0);

    return articles as KnowledgeArticle[];
  }

  // Semantic search using vector store
  async semanticSearch(
    organizationId: number,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const results = await searchKnowledge(
      organizationId,
      query,
      options.topK || 3,
      options.minScore || 0.1
    );

    // Filter by category if specified
    if (options.category) {
      return results.filter(r => r.document.category === options.category);
    }

    return results;
  }

  // Keyword search (fallback/alternative to semantic search)
  async keywordSearch(
    organizationId: number,
    query: string,
    limit = 5
  ): Promise<KnowledgeArticle[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const searchPattern = `%${query}%`;

    const articles = await db
      .select()
      .from(aiKnowledge)
      .where(and(
        eq(aiKnowledge.organizationId, organizationId),
        eq(aiKnowledge.isActive, true),
        or(
          like(aiKnowledge.title, searchPattern),
          like(aiKnowledge.content, searchPattern)
        )
      ))
      .limit(limit);

    return articles as KnowledgeArticle[];
  }

  // Get articles by category
  async getByCategory(organizationId: number, category: string): Promise<KnowledgeArticle[]> {
    return this.list(organizationId, { category, isActive: true });
  }

  // Get all unique categories
  async getCategories(organizationId: number): Promise<string[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const articles = await db
      .select({ category: aiKnowledge.category })
      .from(aiKnowledge)
      .where(and(
        eq(aiKnowledge.organizationId, organizationId),
        eq(aiKnowledge.isActive, true)
      ));

    const categories = new Set<string>();
    for (const article of articles) {
      if (article.category) {
        categories.add(article.category);
      }
    }

    return Array.from(categories).sort();
  }

  // Count articles
  async count(organizationId: number, isActive?: boolean): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const conditions = [eq(aiKnowledge.organizationId, organizationId)];
    if (isActive !== undefined) {
      conditions.push(eq(aiKnowledge.isActive, isActive));
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiKnowledge)
      .where(and(...conditions));

    return Number(result[0]?.count || 0);
  }

  // Bulk import articles
  async bulkImport(
    organizationId: number,
    createdBy: number,
    articles: CreateArticleInput[]
  ): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const values = articles.map(article => ({
      organizationId,
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags,
      isActive: article.isActive ?? true,
      createdBy
    }));

    if (values.length > 0) {
      await db.insert(aiKnowledge).values(values);
      invalidateKnowledgeIndex();
    }

    return values.length;
  }

  // Refresh the vector index
  async refreshIndex(organizationId: number): Promise<void> {
    await refreshKnowledgeIndex(organizationId);
  }
}

// Export singleton instance
export const knowledgeBaseService = new KnowledgeBaseService();

// Export convenience functions
export async function findRelevantKnowledge(
  organizationId: number,
  query: string,
  topK = 3
): Promise<SearchResult[]> {
  return knowledgeBaseService.semanticSearch(organizationId, query, { topK });
}
