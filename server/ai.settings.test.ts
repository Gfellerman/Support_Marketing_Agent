import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { organizations, aiSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("AI Settings - Configuration Management", () => {
  let testOrganizationId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test organization
    const orgResult = await db.insert(organizations).values({
      name: "Test Organization AI Settings",
      slug: "test-org-ai-settings-2",
      ownerId: 1,
      contactsUsed: 0,
      emailsSent: 0,
      workflowsUsed: 0,
    });

    // Get the created organization ID
    const createdOrg = await db.select().from(organizations).where(eq(organizations.slug, "test-org-ai-settings-2")).limit(1);
    testOrganizationId = createdOrg[0]!.id;
  });

  it("should create default AI settings for new organization", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if settings already exist
    const existing = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId)).limit(1);
    
    if (existing.length === 0) {
      // Create default settings
      await db.insert(aiSettings).values({
        organizationId: testOrganizationId,
        minConfidenceThreshold: 70,
        autoResponseThreshold: 90,
        aiEnabled: true,
        autoResponseEnabled: false,
        requireHumanReviewUrgent: true,
        requireHumanReviewNegative: true,
      });
    }

    // Verify settings were created
    const settings = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId)).limit(1);

    expect(settings.length).toBe(1);
    expect(settings[0]!.minConfidenceThreshold).toBe(70);
    expect(settings[0]!.autoResponseThreshold).toBe(90);
    expect(settings[0]!.aiEnabled).toBe(true);
    expect(settings[0]!.autoResponseEnabled).toBe(false);
    expect(settings[0]!.requireHumanReviewUrgent).toBe(true);
    expect(settings[0]!.requireHumanReviewNegative).toBe(true);
  });

  it("should retrieve existing AI settings", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const settings = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId)).limit(1);

    expect(settings.length).toBe(1);
    expect(settings[0]!.organizationId).toBe(testOrganizationId);
    expect(settings[0]!.minConfidenceThreshold).toBeGreaterThanOrEqual(0);
    expect(settings[0]!.minConfidenceThreshold).toBeLessThanOrEqual(100);
  });

  it("should update confidence thresholds", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Update thresholds
    await db.update(aiSettings)
      .set({
        minConfidenceThreshold: 80,
        autoResponseThreshold: 95,
      })
      .where(eq(aiSettings.organizationId, testOrganizationId));

    // Verify update
    const updated = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId)).limit(1);

    expect(updated[0]!.minConfidenceThreshold).toBe(80);
    expect(updated[0]!.autoResponseThreshold).toBe(95);
  });

  it("should update AI enablement flags", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Disable AI
    await db.update(aiSettings)
      .set({
        aiEnabled: false,
        autoResponseEnabled: false,
      })
      .where(eq(aiSettings.organizationId, testOrganizationId));

    // Verify update
    const updated = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId)).limit(1);

    expect(updated[0]!.aiEnabled).toBe(false);
    expect(updated[0]!.autoResponseEnabled).toBe(false);

    // Re-enable AI
    await db.update(aiSettings)
      .set({
        aiEnabled: true,
      })
      .where(eq(aiSettings.organizationId, testOrganizationId));

    const reEnabled = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId)).limit(1);
    expect(reEnabled[0]!.aiEnabled).toBe(true);
  });

  it("should update human review requirements", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Update review requirements
    await db.update(aiSettings)
      .set({
        requireHumanReviewUrgent: false,
        requireHumanReviewNegative: false,
      })
      .where(eq(aiSettings.organizationId, testOrganizationId));

    // Verify update
    const updated = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId)).limit(1);

    expect(updated[0]!.requireHumanReviewUrgent).toBe(false);
    expect(updated[0]!.requireHumanReviewNegative).toBe(false);
  });

  it("should reset settings to defaults", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // First set to non-default values
    await db.update(aiSettings)
      .set({
        minConfidenceThreshold: 50,
        autoResponseThreshold: 80,
        aiEnabled: false,
        autoResponseEnabled: true,
        requireHumanReviewUrgent: false,
        requireHumanReviewNegative: false,
      })
      .where(eq(aiSettings.organizationId, testOrganizationId));

    // Reset to defaults
    await db.update(aiSettings)
      .set({
        minConfidenceThreshold: 70,
        autoResponseThreshold: 90,
        aiEnabled: true,
        autoResponseEnabled: false,
        requireHumanReviewUrgent: true,
        requireHumanReviewNegative: true,
      })
      .where(eq(aiSettings.organizationId, testOrganizationId));

    // Verify reset
    const reset = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId)).limit(1);

    expect(reset[0]!.minConfidenceThreshold).toBe(70);
    expect(reset[0]!.autoResponseThreshold).toBe(90);
    expect(reset[0]!.aiEnabled).toBe(true);
    expect(reset[0]!.autoResponseEnabled).toBe(false);
    expect(reset[0]!.requireHumanReviewUrgent).toBe(true);
    expect(reset[0]!.requireHumanReviewNegative).toBe(true);
  });

  it("should maintain one settings record per organization", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Verify only one settings record exists for the organization
    const settings = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId));
    
    expect(settings.length).toBe(1);
    expect(settings[0]!.organizationId).toBe(testOrganizationId);
  });

  it("should validate threshold ranges", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get current settings
    const current = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, testOrganizationId)).limit(1);

    // Verify thresholds are within valid range
    expect(current[0]!.minConfidenceThreshold).toBeGreaterThanOrEqual(0);
    expect(current[0]!.minConfidenceThreshold).toBeLessThanOrEqual(100);
    expect(current[0]!.autoResponseThreshold).toBeGreaterThanOrEqual(0);
    expect(current[0]!.autoResponseThreshold).toBeLessThanOrEqual(100);
  });
});
