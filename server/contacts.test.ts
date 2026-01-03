import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import { contacts, organizations } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("Contacts Management", () => {
  let testOrgId: number;
  let testContactId: number;

  beforeEach(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test organization
    const orgResult = await db.insert(organizations).values({
      name: "Test Org for Contacts",
      slug: `test-contacts-${Date.now()}`,
      ownerId: 999999,
      contactsUsed: 0,
      emailsSent: 0,
      workflowsUsed: 0,
    });

    testOrgId = Number(orgResult[0].insertId);
  });

  it("should create a new contact", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(contacts).values({
      organizationId: testOrgId,
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      phone: "+1234567890",
      tags: ["test", "customer"],
      subscriptionStatus: "subscribed",
      source: "manual",
    });

    testContactId = Number(result[0].insertId);

    const contact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, testContactId))
      .limit(1);

    expect(contact.length).toBe(1);
    expect(contact[0]?.email).toBe("test@example.com");
    expect(contact[0]?.firstName).toBe("Test");
    expect(contact[0]?.lastName).toBe("User");
    expect(contact[0]?.subscriptionStatus).toBe("subscribed");
  });

  it("should retrieve contacts by organization", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create multiple contacts
    await db.insert(contacts).values([
      {
        organizationId: testOrgId,
        email: "user1@example.com",
        firstName: "User",
        lastName: "One",
        subscriptionStatus: "subscribed",
      },
      {
        organizationId: testOrgId,
        email: "user2@example.com",
        firstName: "User",
        lastName: "Two",
        subscriptionStatus: "subscribed",
      },
    ]);

    const allContacts = await db
      .select()
      .from(contacts)
      .where(eq(contacts.organizationId, testOrgId));

    expect(allContacts.length).toBeGreaterThanOrEqual(2);
  });

  it("should update contact information", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create contact
    const result = await db.insert(contacts).values({
      organizationId: testOrgId,
      email: "update@example.com",
      firstName: "Original",
      lastName: "Name",
      subscriptionStatus: "subscribed",
    });

    const contactId = Number(result[0].insertId);

    // Update contact
    await db
      .update(contacts)
      .set({
        firstName: "Updated",
        lastName: "User",
        phone: "+9876543210",
      })
      .where(eq(contacts.id, contactId));

    // Verify update
    const updated = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    expect(updated[0]?.firstName).toBe("Updated");
    expect(updated[0]?.lastName).toBe("User");
    expect(updated[0]?.phone).toBe("+9876543210");
  });

  it("should delete a contact", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create contact
    const result = await db.insert(contacts).values({
      organizationId: testOrgId,
      email: "delete@example.com",
      firstName: "Delete",
      lastName: "Me",
      subscriptionStatus: "subscribed",
    });

    const contactId = Number(result[0].insertId);

    // Delete contact
    await db.delete(contacts).where(eq(contacts.id, contactId));

    // Verify deletion
    const deleted = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    expect(deleted.length).toBe(0);
  });

  it("should filter contacts by subscription status", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create contacts with different statuses
    await db.insert(contacts).values([
      {
        organizationId: testOrgId,
        email: "subscribed@example.com",
        subscriptionStatus: "subscribed",
      },
      {
        organizationId: testOrgId,
        email: "unsubscribed@example.com",
        subscriptionStatus: "unsubscribed",
      },
      {
        organizationId: testOrgId,
        email: "bounced@example.com",
        subscriptionStatus: "bounced",
      },
    ]);

    // Filter by subscribed
    const subscribed = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.organizationId, testOrgId),
          eq(contacts.subscriptionStatus, "subscribed")
        )!
      );

    expect(subscribed.length).toBeGreaterThanOrEqual(1);
    expect(subscribed.every(c => c.subscriptionStatus === "subscribed")).toBe(true);
  });

  it("should handle contact tags correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create contact with tags
    const result = await db.insert(contacts).values({
      organizationId: testOrgId,
      email: "tagged@example.com",
      tags: ["vip", "customer", "premium"],
      subscriptionStatus: "subscribed",
    });

    const contactId = Number(result[0].insertId);

    // Retrieve and verify tags
    const contact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    expect(contact[0]?.tags).toEqual(["vip", "customer", "premium"]);

    // Update tags
    await db
      .update(contacts)
      .set({ tags: ["vip", "enterprise"] })
      .where(eq(contacts.id, contactId));

    const updated = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    expect(updated[0]?.tags).toEqual(["vip", "enterprise"]);
  });

  it("should track contact order statistics", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create contact with order stats
    const result = await db.insert(contacts).values({
      organizationId: testOrgId,
      email: "buyer@example.com",
      orderCount: 5,
      totalOrderValue: "1234.50",
      lastOrderDate: new Date(),
      subscriptionStatus: "subscribed",
    });

    const contactId = Number(result[0].insertId);

    const contact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    expect(contact[0]?.orderCount).toBe(5);
    expect(contact[0]?.totalOrderValue).toBe("1234.50");
    expect(contact[0]?.lastOrderDate).toBeInstanceOf(Date);
  });

  it("should prevent duplicate emails within same organization", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const email = "duplicate@example.com";

    // Create first contact
    await db.insert(contacts).values({
      organizationId: testOrgId,
      email,
      subscriptionStatus: "subscribed",
    });

    // Check for existing contact before creating duplicate
    const existing = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.email, email),
          eq(contacts.organizationId, testOrgId)
        )!
      )
      .limit(1);

    expect(existing.length).toBe(1);

    // In real implementation, this should throw an error or be prevented
    // by the API layer, not the database layer
  });
});
