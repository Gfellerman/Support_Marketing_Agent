import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { contacts, organizations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const contactsImportExportRouter = router({
  // Export contacts to CSV format
  export: protectedProcedure
    .input(z.object({
      subscriptionStatus: z.enum(["subscribed", "unsubscribed", "bounced"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization
      const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        return { csv: "email,firstName,lastName,phone,tags,subscriptionStatus,source\n" };
      }

      const organizationId = orgResult[0]!.id;

      // Build where conditions
      const conditions = [eq(contacts.organizationId, organizationId)];
      if (input.subscriptionStatus) {
        conditions.push(eq(contacts.subscriptionStatus, input.subscriptionStatus));
      }

      // Get all matching contacts
      const allContacts = await db
        .select()
        .from(contacts)
        .where(and(...conditions));

      // Convert to CSV
      const csvHeader = "email,firstName,lastName,phone,tags,subscriptionStatus,source,createdAt\n";
      const csvRows = allContacts.map(contact => {
        const tags = (contact.tags as string[] || []).join(";");
        return [
          contact.email,
          contact.firstName || "",
          contact.lastName || "",
          contact.phone || "",
          tags,
          contact.subscriptionStatus,
          contact.source || "",
          new Date(contact.createdAt).toISOString(),
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
      }).join("\n");

      return { csv: csvHeader + csvRows };
    }),

  // Import contacts from CSV
  import: protectedProcedure
    .input(z.object({
      csvData: z.string(),
      skipDuplicates: z.boolean().default(true),
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

      // Parse CSV
      const lines = input.csvData.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("CSV file must contain at least a header row and one data row");
      }

      const header = lines[0]!.toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
      const emailIndex = header.indexOf("email");
      
      if (emailIndex === -1) {
        throw new Error("CSV must contain an 'email' column");
      }

      const firstNameIndex = header.indexOf("firstname");
      const lastNameIndex = header.indexOf("lastname");
      const phoneIndex = header.indexOf("phone");
      const tagsIndex = header.indexOf("tags");
      const statusIndex = header.indexOf("subscriptionstatus");
      const sourceIndex = header.indexOf("source");

      let imported = 0;
      let skipped = 0;
      let errors = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          // Parse CSV row (handle quoted fields)
          const row = lines[i]!.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
          const cleanRow = row.map(field => field.replace(/^"|"$/g, "").replace(/""/g, '"').trim());

          const email = cleanRow[emailIndex];
          if (!email || !email.includes("@")) {
            errors++;
            continue;
          }

          // Check for duplicates
          if (input.skipDuplicates) {
            const existing = await db
              .select()
              .from(contacts)
              .where(and(
                eq(contacts.email, email),
                eq(contacts.organizationId, organizationId)
              ))
              .limit(1);

            if (existing.length > 0) {
              skipped++;
              continue;
            }
          }

          // Parse tags
          const tagsStr = tagsIndex >= 0 ? cleanRow[tagsIndex] : "";
          const tags = tagsStr ? tagsStr.split(";").map(t => t.trim()).filter(Boolean) : [];

          // Parse subscription status
          let subscriptionStatus: "subscribed" | "unsubscribed" | "bounced" = "subscribed";
          if (statusIndex >= 0) {
            const status = cleanRow[statusIndex]?.toLowerCase();
            if (status === "unsubscribed" || status === "bounced") {
              subscriptionStatus = status;
            }
          }

          // Insert contact
          await db.insert(contacts).values({
            organizationId,
            email,
            firstName: firstNameIndex >= 0 ? cleanRow[firstNameIndex] : undefined,
            lastName: lastNameIndex >= 0 ? cleanRow[lastNameIndex] : undefined,
            phone: phoneIndex >= 0 ? cleanRow[phoneIndex] : undefined,
            tags,
            subscriptionStatus,
            source: sourceIndex >= 0 ? cleanRow[sourceIndex] : "csv_import",
          });

          imported++;
        } catch (error) {
          console.error(`Error importing row ${i}:`, error);
          errors++;
        }
      }

      // Update organization contact count
      await db
        .update(organizations)
        .set({
          contactsUsed: (orgResult[0]!.contactsUsed || 0) + imported,
        })
        .where(eq(organizations.id, organizationId));

      return {
        success: true,
        imported,
        skipped,
        errors,
        total: lines.length - 1,
      };
    }),
});
