/**
 * Vector Store Service - TF-IDF based similarity search for knowledge base RAG
 * Uses in-memory vector store for MVP, can be upgraded to proper vector DB later
 */
import { getDb } from "../../db";
import { aiKnowledge } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
// TF-IDF Vector Store Implementation
class TFIDFVectorStore {
    documents = [];
    vocabulary = new Map();
    idf = new Map();
    documentVectors = new Map();
    isInitialized = false;
    lastOrgId = null;
    // Tokenize and normalize text
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 2); // Filter short tokens
    }
    // Calculate term frequency
    calculateTF(tokens) {
        const tf = new Map();
        const tokenCount = tokens.length;
        for (const token of tokens) {
            tf.set(token, (tf.get(token) || 0) + 1);
        }
        // Normalize by document length
        Array.from(tf.entries()).forEach(([token, count]) => {
            tf.set(token, count / tokenCount);
        });
        return tf;
    }
    // Build IDF from all documents
    buildIDF() {
        const docCount = this.documents.length;
        const termDocCounts = new Map();
        // Count documents containing each term
        for (const doc of this.documents) {
            const tokens = new Set(this.tokenize(`${doc.title} ${doc.content}`));
            tokens.forEach(token => {
                termDocCounts.set(token, (termDocCounts.get(token) || 0) + 1);
            });
        }
        // Calculate IDF
        this.vocabulary.clear();
        this.idf.clear();
        let vocabIndex = 0;
        Array.from(termDocCounts.entries()).forEach(([term, docFreq]) => {
            this.vocabulary.set(term, vocabIndex++);
            // IDF with smoothing
            this.idf.set(term, Math.log((docCount + 1) / (docFreq + 1)) + 1);
        });
    }
    // Convert document to TF-IDF vector
    documentToVector(text) {
        const tokens = this.tokenize(text);
        const tf = this.calculateTF(tokens);
        const vector = new Array(this.vocabulary.size).fill(0);
        Array.from(tf.entries()).forEach(([term, tfValue]) => {
            const index = this.vocabulary.get(term);
            const idfValue = this.idf.get(term);
            if (index !== undefined && idfValue !== undefined) {
                vector[index] = tfValue * idfValue;
            }
        });
        return vector;
    }
    // Cosine similarity between two vectors
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }
    // Load documents from database and build index
    async initialize(organizationId, forceRefresh = false) {
        if (this.isInitialized && this.lastOrgId === organizationId && !forceRefresh) {
            return;
        }
        const db = await getDb();
        if (!db)
            throw new Error("Database not available");
        const articles = await db
            .select()
            .from(aiKnowledge)
            .where(and(eq(aiKnowledge.organizationId, organizationId), eq(aiKnowledge.isActive, true)));
        this.documents = articles.map(a => ({
            id: a.id,
            title: a.title,
            content: a.content,
            category: a.category,
            tags: a.tags
        }));
        // Build index
        this.buildIDF();
        // Pre-compute document vectors
        this.documentVectors.clear();
        for (const doc of this.documents) {
            const text = `${doc.title} ${doc.title} ${doc.content}`; // Weight title 2x
            const vector = this.documentToVector(text);
            this.documentVectors.set(doc.id, vector);
        }
        this.isInitialized = true;
        this.lastOrgId = organizationId;
    }
    // Search for similar documents
    async search(query, topK = 3, minScore = 0.1) {
        if (!this.isInitialized || this.documents.length === 0) {
            return [];
        }
        const queryVector = this.documentToVector(query);
        const results = [];
        for (const doc of this.documents) {
            const docVector = this.documentVectors.get(doc.id);
            if (!docVector)
                continue;
            const score = this.cosineSimilarity(queryVector, docVector);
            if (score >= minScore) {
                results.push({
                    document: doc,
                    score,
                    relevanceScore: Math.round(score * 100)
                });
            }
        }
        // Sort by score descending and return top K
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
    // Add document to index (for real-time updates)
    addDocument(doc) {
        this.documents.push(doc);
        this.buildIDF();
        // Rebuild all vectors (needed for new vocabulary terms)
        this.documentVectors.clear();
        for (const d of this.documents) {
            const text = `${d.title} ${d.title} ${d.content}`;
            const vector = this.documentToVector(text);
            this.documentVectors.set(d.id, vector);
        }
    }
    // Remove document from index
    removeDocument(docId) {
        this.documents = this.documents.filter(d => d.id !== docId);
        this.documentVectors.delete(docId);
        this.buildIDF();
        // Rebuild vectors with updated IDF
        for (const doc of this.documents) {
            const text = `${doc.title} ${doc.title} ${doc.content}`;
            const vector = this.documentToVector(text);
            this.documentVectors.set(doc.id, vector);
        }
    }
    // Get document count
    getDocumentCount() {
        return this.documents.length;
    }
    // Force refresh index
    invalidate() {
        this.isInitialized = false;
    }
}
// Singleton instance
let vectorStore = null;
export function getVectorStore() {
    if (!vectorStore) {
        vectorStore = new TFIDFVectorStore();
    }
    return vectorStore;
}
// Export utility functions
export async function searchKnowledge(organizationId, query, topK = 3, minScore = 0.1) {
    const store = getVectorStore();
    await store.initialize(organizationId);
    return store.search(query, topK, minScore);
}
export async function refreshKnowledgeIndex(organizationId) {
    const store = getVectorStore();
    await store.initialize(organizationId, true);
}
export function invalidateKnowledgeIndex() {
    const store = getVectorStore();
    store.invalidate();
}
