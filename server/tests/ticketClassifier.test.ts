
import { describe, it, expect, vi, beforeEach } from "vitest";
import { classifyTicket } from "../services/ai/ticketClassifier";
import { fastClassify } from "../services/ai/groqService";

// Mock the groqService
vi.mock("../services/ai/groqService", () => ({
  fastClassify: vi.fn(),
}));

describe("TicketClassifier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should correctly classify a ticket and analyze sentiment", async () => {
    // We need to return specific responses for the two parallel calls.
    // However, fastClassify is called with different prompts.
    // We can use mockImplementation to check arguments and return appropriate response.

    (fastClassify as any).mockImplementation((systemPrompt: string) => {
      // Check which prompt is being used by looking at the system prompt content
      if (systemPrompt.includes("classify them accurately")) {
        // This is classification prompt
        return Promise.resolve({
          content: JSON.stringify({
            category: "shipping_issue",
            priority: "medium",
            confidence: 0.9,
            reasoning: "User is asking about delivery",
          }),
        });
      } else {
        // This is sentiment prompt
        // Note: The sentiment prompt in src/services/ai/prompts/sentiment.ts allows "angry"
        // but the test expects "frustrated". However, the SENTIMENT_LABELS only has ["positive", "neutral", "negative", "angry"]
        // So we should return "angry" (which maps closely to frustrated) or "negative".
        // Let's check ticketClassifier.ts types.

        return Promise.resolve({
          content: JSON.stringify({
            label: "angry", // Changed from "frustrated" to "angry" to match schema
            score: -0.8,
            confidence: 0.8,
            urgencyIndicators: ["late"],
            emotionalTriggers: ["waiting"],
          }),
        });
      }
    });

    const result = await classifyTicket(
      "Where is my order?",
      "I have been waiting for 2 weeks! This is unacceptable."
    );

    // AI returned shipping_issue
    expect(result.category).toBe("shipping_issue");
    // Expect "angry" as that matches the schema
    expect(result.sentiment).toBe("angry");

    // Priority should be escalated to high due to "angry" sentiment
    // (medium -> high)
    expect(result.priority).toBe("high");
  });

  it("should handle invalid JSON from AI gracefully", async () => {
    (fastClassify as any).mockResolvedValue({
      content: "Invalid JSON response",
    });

    const result = await classifyTicket("Subject", "Message");

    // Should return defaults
    expect(result.category).toBe("other");
    expect(result.priority).toBe("medium");
    expect(result.sentiment).toBe("neutral");
  });

  it("should adjust priority for VIP customers", async () => {
    // Mock standard response
    (fastClassify as any).mockImplementation((systemPrompt: string) => {
      if (systemPrompt.includes("classify them accurately")) {
        return Promise.resolve({
          content: JSON.stringify({
            category: "order_status",
            priority: "low", // AI says low
            confidence: 0.8,
          }),
        });
      } else {
        return Promise.resolve({
          content: JSON.stringify({
            label: "neutral",
            score: 0,
            confidence: 0.8,
          }),
        });
      }
    });

    const result = await classifyTicket(
      "Hi",
      "Just checking in",
      { lifetimeValue: 1000 } // VIP Context
    );

    // Should be escalated to medium because of LTV > 500
    // (low -> medium)
    expect(result.priority).toBe("medium");
  });
});
