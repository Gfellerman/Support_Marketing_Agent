import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { classifyTicket, generateResponse } from "./ai/agent";
import { aiKnowledge, organizations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("AI Assist - Ticket Classification and Response Generation", () => {
  let testOrganizationId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test organization
    const orgResult = await db.insert(organizations).values({
      name: "Test Organization",
      slug: "test-org-ai-assist",
      ownerId: 1,
      contactsUsed: 0,
      emailsSent: 0,
      workflowsUsed: 0,
    });

    // Get the created organization ID
    const createdOrg = await db.select().from(organizations).where(eq(organizations.slug, "test-org-ai-assist")).limit(1);
    testOrganizationId = createdOrg[0]!.id;

    // Seed knowledge base for testing
    await db.insert(aiKnowledge).values([
      {
        organizationId: testOrganizationId,
        title: "Shipping Information",
        content: "Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Free shipping on orders over $50.",
        category: "shipping",
        tags: ["shipping", "delivery"],
        isActive: true,
        createdBy: 1,
      },
      {
        organizationId: testOrganizationId,
        title: "Return Policy",
        content: "We offer 30-day returns on most items. Items must be unused and in original packaging. Refunds processed within 5-7 business days.",
        category: "returns",
        tags: ["returns", "refunds"],
        isActive: true,
        createdBy: 1,
      },
    ]);
  });

  it("should classify a shipping inquiry ticket correctly", async () => {
    const ticketId = 1;
    const subject = "Question about shipping times";
    const message = "Hi, I ordered a product 3 days ago and I'm wondering when it will arrive. Can you provide an estimated delivery date?";

    const classification = await classifyTicket(ticketId, subject, message);

    expect(classification).toBeDefined();
    expect(classification.category).toBe("shipping");
    expect(classification.priority).toMatch(/low|medium|high|urgent/);
    expect(classification.sentiment).toMatch(/positive|neutral|negative/);
    expect(classification.confidence).toBeGreaterThan(0);
    expect(classification.confidence).toBeLessThanOrEqual(1);
  });

  it("should classify a return request ticket correctly", async () => {
    const ticketId = 2;
    const subject = "Product return request";
    const message = "I received my order yesterday but the item doesn't match the description. I would like to return it for a full refund.";

    const classification = await classifyTicket(ticketId, subject, message);

    expect(classification).toBeDefined();
    expect(classification.category).toBe("returns");
    expect(classification.priority).toMatch(/medium|high|urgent/);
    expect(classification.sentiment).toMatch(/neutral|negative/);
  });

  it("should generate a response for a shipping inquiry", async () => {
    const ticketId = 1;
    const subject = "Question about shipping times";
    const message = "Hi, I ordered a product 3 days ago and I'm wondering when it will arrive.";
    const classification = {
      category: "shipping" as const,
      priority: "medium" as const,
      sentiment: "neutral" as const,
      confidence: 0.9,
    };

    const response = await generateResponse(
      ticketId,
      testOrganizationId,
      subject,
      message,
      classification
    );

    expect(response).toBeDefined();
    expect(response.response).toBeTruthy();
    expect(response.response.length).toBeGreaterThan(50);
    expect(response.confidence).toBeGreaterThan(0);
    expect(response.confidence).toBeLessThanOrEqual(1);
    expect(response.shouldHandoff).toBeDefined();
    
    // Response should mention shipping or delivery
    const lowerResponse = response.response.toLowerCase();
    expect(
      lowerResponse.includes("shipping") ||
      lowerResponse.includes("delivery") ||
      lowerResponse.includes("arrive") ||
      lowerResponse.includes("days")
    ).toBe(true);
  });

  it("should generate a response for a return request", { timeout: 10000 }, async () => {
    const ticketId = 2;
    const subject = "Product return request";
    const message = "I received my order but the item doesn't match the description. I would like to return it.";
    const classification = {
      category: "returns" as const,
      priority: "high" as const,
      sentiment: "negative" as const,
      confidence: 0.85,
    };

    const response = await generateResponse(
      ticketId,
      testOrganizationId,
      subject,
      message,
      classification
    );

    expect(response).toBeDefined();
    expect(response.response).toBeTruthy();
    expect(response.response.length).toBeGreaterThan(50);
    
    // Response should mention returns or refund
    const lowerResponse = response.response.toLowerCase();
    expect(
      lowerResponse.includes("return") ||
      lowerResponse.includes("refund") ||
      lowerResponse.includes("30") ||
      lowerResponse.includes("days")
    ).toBe(true);
  });

  it("should flag low confidence responses for human review", { timeout: 10000 }, async () => {
    const ticketId = 3;
    const subject = "Complex technical issue";
    const message = "My account is showing an error code XYZ-123 when I try to access the advanced settings panel.";
    const classification = {
      category: "technical_support" as const,
      priority: "high" as const,
      sentiment: "neutral" as const,
      confidence: 0.5, // Low confidence
    };

    const response = await generateResponse(
      ticketId,
      testOrganizationId,
      subject,
      message,
      classification
    );

    expect(response).toBeDefined();
    // Low confidence should trigger human review
    expect(response.shouldHandoff).toBe(true);
  });

  it("should handle high confidence responses without human review", async () => {
    const ticketId = 4;
    const subject = "Shipping time question";
    const message = "How long does standard shipping take?";
    const classification = {
      category: "shipping" as const,
      priority: "low" as const,
      sentiment: "neutral" as const,
      confidence: 0.95, // High confidence
    };

    const response = await generateResponse(
      ticketId,
      testOrganizationId,
      subject,
      message,
      classification
    );

    expect(response).toBeDefined();
    expect(response.shouldHandoff).toBe(false);
    expect(response.confidence).toBeGreaterThanOrEqual(0.7);
  });
});
