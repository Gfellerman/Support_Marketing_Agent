import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { contacts, organizations } from "../../drizzle/schema";
import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";

export const contactsRouter = router({
  // List contacts with pagination and filtering
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      subscriptionStatus: z.enum(["subscribed", "unsubscribed", "bounced"]).optional(),
      tags: z.array(z.string()).optional(),
      sortBy: z.enum(["createdAt", "email", "firstName", "lastName", "totalOrderValue"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization
      let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      
      if (orgResult.length === 0) {
        // Create organization if doesn't exist
        await db.insert(organizations).values({
          name: `${ctx.user.name}'s Organization`,
          slug: `org-${ctx.user.id}`,
          ownerId: ctx.user.id,
          contactsUsed: 0,
          emailsSent: 0,
          workflowsUsed: 0,
        });
        orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      }

      const organizationId = orgResult[0]!.id;

      // Build where conditions
      const conditions = [eq(contacts.organizationId, organizationId)];

      if (input.search) {
        conditions.push(
          or(
            like(contacts.email, `%${input.search}%`),
            like(contacts.firstName, `%${input.search}%`),
            like(contacts.lastName, `%${input.search}%`)
          )!
        );
      }

      if (input.subscriptionStatus) {
        conditions.push(eq(contacts.subscriptionStatus, input.subscriptionStatus));
      }

      // Build sort order
      const sortColumn = {
        createdAt: contacts.createdAt,
        email: contacts.email,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        totalOrderValue: contacts.totalOrderValue,
      }[input.sortBy];

      const orderBy = input.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(contacts)
        .where(and(...conditions));

      const total = Number(countResult[0]?.count || 0);

      // Get paginated results
      const offset = (input.page - 1) * input.pageSize;
      const results = await db
        .select()
        .from(contacts)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(input.pageSize)
        .offset(offset);

      return {
        contacts: results,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          total,
          totalPages: Math.ceil(total / input.pageSize),
        },
      };
    }),

  // Get single contact by ID
  get: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization
      const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");

      const organizationId = orgResult[0]!.id;

      const contact = await db
        .select()
        .from(contacts)
        .where(and(
          eq(contacts.id, input.id),
          eq(contacts.organizationId, organizationId)
        ))
        .limit(1);

      if (contact.length === 0) {
        throw new Error("Contact not found");
      }

      return contact[0];
    }),

  // Create new contact
  create: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      tags: z.array(z.string()).optional(),
      customFields: z.record(z.string(), z.any()).optional(),
      subscriptionStatus: z.enum(["subscribed", "unsubscribed", "bounced"]).default("subscribed"),
      source: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization
      let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      
      if (orgResult.length === 0) {
        await db.insert(organizations).values({
          name: `${ctx.user.name}'s Organization`,
          slug: `org-${ctx.user.id}`,
          ownerId: ctx.user.id,
          contactsUsed: 0,
          emailsSent: 0,
          workflowsUsed: 0,
        });
        orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      }

      const organizationId = orgResult[0]!.id;

      // Check if contact already exists
      const existing = await db
        .select()
        .from(contacts)
        .where(and(
          eq(contacts.email, input.email),
          eq(contacts.organizationId, organizationId)
        ))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Contact with this email already exists");
      }

      // Create contact
      await db.insert(contacts).values({
        organizationId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        tags: input.tags || [],
        customFields: input.customFields || {},
        subscriptionStatus: input.subscriptionStatus,
        source: input.source || "manual",
      });

      // Update organization contact count
      await db
        .update(organizations)
        .set({
          contactsUsed: sql`${organizations.contactsUsed} + 1`,
        })
        .where(eq(organizations.id, organizationId));

      return { success: true };
    }),

  // Update contact
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      email: z.string().email().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      tags: z.array(z.string()).optional(),
      customFields: z.record(z.string(), z.any()).optional(),
      subscriptionStatus: z.enum(["subscribed", "unsubscribed", "bounced"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization
      const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");

      const organizationId = orgResult[0]!.id;

      // Update contact
      const { id, ...updateData } = input;
      await db
        .update(contacts)
        .set(updateData)
        .where(and(
          eq(contacts.id, id),
          eq(contacts.organizationId, organizationId)
        ));

      return { success: true };
    }),

  // Delete contact(s)
  delete: protectedProcedure
    .input(z.object({
      ids: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization
      const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");

      const organizationId = orgResult[0]!.id;

      // Delete contacts
      for (const id of input.ids) {
        await db
          .delete(contacts)
          .where(and(
            eq(contacts.id, id),
            eq(contacts.organizationId, organizationId)
          )!);
      }

      // Update organization contact count
      await db
        .update(organizations)
        .set({
          contactsUsed: sql`GREATEST(0, ${organizations.contactsUsed} - ${input.ids.length})`,
        })
        .where(eq(organizations.id, organizationId));

      return { success: true, deleted: input.ids.length };
    }),

  // Bulk tag contacts
  bulkTag: protectedProcedure
    .input(z.object({
      ids: z.array(z.number()),
      tags: z.array(z.string()),
      action: z.enum(["add", "remove", "replace"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization
      const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");

      const organizationId = orgResult[0]!.id;

      // Update each contact's tags
      for (const id of input.ids) {
        const contact = await db
          .select()
          .from(contacts)
          .where(and(
            eq(contacts.id, id),
            eq(contacts.organizationId, organizationId)
          )!)
          .limit(1);

        if (contact.length === 0) continue;

        const currentTags = (contact[0].tags as string[]) || [];
        let newTags: string[];

        if (input.action === "add") {
          newTags = Array.from(new Set([...currentTags, ...input.tags]));
        } else if (input.action === "remove") {
          newTags = currentTags.filter(tag => !input.tags.includes(tag));
        } else {
          newTags = input.tags;
        }

        await db
          .update(contacts)
          .set({ tags: newTags })
          .where(eq(contacts.id, id));
      }

      return { success: true, updated: input.ids.length };
    }),

  // Get contact statistics
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization
      const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        return {
          total: 0,
          subscribed: 0,
          unsubscribed: 0,
          bounced: 0,
        };
      }

      const organizationId = orgResult[0]!.id;

      const allContacts = await db
        .select()
        .from(contacts)
        .where(eq(contacts.organizationId, organizationId));

      return {
        total: allContacts.length,
        subscribed: allContacts.filter(c => c.subscriptionStatus === "subscribed").length,
        unsubscribed: allContacts.filter(c => c.subscriptionStatus === "unsubscribed").length,
        bounced: allContacts.filter(c => c.subscriptionStatus === "bounced").length,
      };
    }),
});
