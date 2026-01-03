import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { workflows, organizations } from "../../drizzle/schema";
import { workflowTemplates as workflowTemplatesTable } from "../../drizzle/schema";
import { 
  workflowTemplates as builtInTemplates,
  getTemplatesByCategory,
  getTemplateById as getBuiltInTemplateById,
  searchTemplatesByTags,
  getAllCategories,
  getAllTags,
} from "../workflows/templates";
import { eq, and, or, desc } from "drizzle-orm";

/**
 * Templates Router
 * 
 * Manages workflow templates - both built-in and user-saved
 */
export const templatesRouter = router({
  /**
   * List all templates (built-in + user-saved)
   */
  list: protectedProcedure
    .input(z.object({
      category: z.enum(['ecommerce', 'saas', 'retail', 'services', 'general', 'custom', 'all']).optional(),
      tags: z.array(z.string()).optional(),
      includeBuiltIn: z.boolean().default(true),
      includeUserSaved: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results: any[] = [];

      // Add built-in templates
      if (input.includeBuiltIn) {
        let templates = builtInTemplates;

        // Filter by category
        if (input.category && input.category !== 'all' && input.category !== 'custom') {
          templates = getTemplatesByCategory(input.category as 'ecommerce' | 'saas' | 'retail' | 'services' | 'general');
        }

        // Filter by tags
        if (input.tags && input.tags.length > 0) {
          templates = searchTemplatesByTags(input.tags);
        }

        results.push(...templates.map(t => ({
          ...t,
          isBuiltIn: true,
          isPublic: true,
          usageCount: 0,
          createdBy: null,
          organizationId: null,
        })));
      }

      // Add user-saved templates
      if (input.includeUserSaved) {
        // Get organization ID for the user
        const orgs = await db.select().from(organizations)
          .where(eq(organizations.ownerId, ctx.user.id))
          .limit(1);

        if (orgs.length > 0) {
          const orgId = orgs[0].id;

          let query = db.select().from(workflowTemplatesTable)
            .where(
              or(
                eq(workflowTemplatesTable.organizationId, orgId),
                eq(workflowTemplatesTable.isPublic, true)
              )
            )
            .orderBy(desc(workflowTemplatesTable.createdAt));

          const userTemplates = await query;

          results.push(...userTemplates.map(t => ({
            ...t,
            isBuiltIn: false,
          })));
        }
      }

      return results;
    }),

  /**
   * Get template by ID (built-in or user-saved)
   */
  getById: protectedProcedure
    .input(z.object({
      id: z.union([z.string(), z.number()]),
      isBuiltIn: z.boolean(),
    }))
    .query(async ({ ctx, input }) => {
      if (input.isBuiltIn) {
        const template = getBuiltInTemplateById(String(input.id));
        if (!template) throw new Error("Template not found");
        return {
          ...template,
          isBuiltIn: true,
          isPublic: true,
          usageCount: 0,
          createdBy: null,
          organizationId: null,
        };
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const templateResults = await db.select().from(workflowTemplatesTable)
        .where(eq(workflowTemplatesTable.id, Number(input.id)))
        .limit(1);
      
      const template = templateResults[0];

      if (!template) throw new Error("Template not found");

      return {
        ...template,
        isBuiltIn: false,
      };
    }),

  /**
   * Save workflow data directly as template (without needing existing workflow ID)
   */
  save: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum(['ecommerce', 'saas', 'retail', 'services', 'general', 'custom']) as z.ZodType<'ecommerce' | 'saas' | 'retail' | 'services' | 'general' | 'custom'>,
      tags: z.array(z.string()).optional(),
      icon: z.string().max(10).optional(),
      triggerType: z.enum(['welcome', 'abandoned_cart', 'order_confirmation', 'shipping', 'custom']),
      steps: z.any(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization ID
      const orgs = await db.select().from(organizations)
        .where(eq(organizations.ownerId, ctx.user.id))
        .limit(1);

      if (orgs.length === 0) {
        throw new Error("Organization not found");
      }

      const orgId = orgs[0].id;

      // Create template
      const [template] = await db.insert(workflowTemplatesTable).values({
        organizationId: orgId,
        name: input.name,
        description: input.description || null,
        category: input.category,
        tags: input.tags || null,
        icon: input.icon || "📋",
        triggerType: input.triggerType,
        steps: input.steps,
        isPublic: input.isPublic,
        usageCount: 0,
        createdBy: ctx.user.id,
      });

      return {
        success: true,
        templateId: template.insertId,
      };
    }),

  /**
   * Save current workflow as template
   */
  saveAsTemplate: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum(['ecommerce', 'saas', 'retail', 'services', 'general', 'custom']) as z.ZodType<'ecommerce' | 'saas' | 'retail' | 'services' | 'general' | 'custom'>,
      tags: z.array(z.string()).optional(),
      icon: z.string().max(10).optional(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization ID
      const orgs = await db.select().from(organizations)
        .where(eq(organizations.ownerId, ctx.user.id))
        .limit(1);

      if (orgs.length === 0) {
        throw new Error("Organization not found");
      }

      const orgId = orgs[0].id;

      // Get the workflow
      const workflowResults = await db.select().from(workflows)
        .where(eq(workflows.id, input.workflowId))
        .limit(1);
      
      const workflow = workflowResults[0];

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      // Create template
      const [template] = await db.insert(workflowTemplatesTable).values({
        organizationId: orgId,
        name: input.name,
        description: input.description || null,
        category: input.category,
        tags: input.tags || null,
        icon: input.icon || "📋",
        triggerType: workflow.triggerType,
        steps: workflow.steps || [],
        isPublic: input.isPublic,
        usageCount: 0,
        createdBy: ctx.user.id,
      });

      return {
        success: true,
        templateId: template.insertId,
      };
    }),

  /**
   * Clone template to create new workflow
   */
  cloneTemplate: protectedProcedure
    .input(z.object({
      templateId: z.union([z.string(), z.number()]),
      isBuiltIn: z.boolean(),
      name: z.string().min(1).max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization ID
      const orgs = await db.select().from(organizations)
        .where(eq(organizations.ownerId, ctx.user.id))
        .limit(1);

      if (orgs.length === 0) {
        throw new Error("Organization not found");
      }

      const orgId = orgs[0].id;

      // Get template
      let template: any;
      if (input.isBuiltIn) {
        template = getBuiltInTemplateById(String(input.templateId));
        if (!template) throw new Error("Template not found");
      } else {
        const templateResults = await db.select().from(workflowTemplatesTable)
          .where(eq(workflowTemplatesTable.id, Number(input.templateId)))
          .limit(1);
        template = templateResults[0];
        if (!template) throw new Error("Template not found");
      }

      // Create workflow from template
      const workflowName = input.name || `${template.name} (Copy)`;

      const [workflow] = await db.insert(workflows).values({
        organizationId: orgId,
        name: workflowName,
        description: template.description || null,
        triggerType: template.triggerType,
        triggerConfig: null,
        steps: template.steps,
        status: "draft",
        createdBy: ctx.user.id,
      });

      // Increment usage count for user-saved templates
      if (!input.isBuiltIn) {
        await db.update(workflowTemplatesTable)
          .set({
            usageCount: (template.usageCount || 0) + 1,
          })
          .where(eq(workflowTemplatesTable.id, Number(input.templateId)));
      }

      return {
        success: true,
        workflowId: workflow.insertId,
      };
    }),

  /**
   * Delete user-saved template
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get organization ID
      const orgs = await db.select().from(organizations)
        .where(eq(organizations.ownerId, ctx.user.id))
        .limit(1);

      if (orgs.length === 0) {
        throw new Error("Organization not found");
      }

      const orgId = orgs[0].id;

      // Delete template (only if it belongs to the user's organization)
      await db.delete(workflowTemplatesTable)
        .where(
          and(
            eq(workflowTemplatesTable.id, input.id),
            eq(workflowTemplatesTable.organizationId, orgId)
          )
        );

      return { success: true };
    }),

  /**
   * Get all categories
   */
  getCategories: protectedProcedure.query(() => {
    return getAllCategories();
  }),

  /**
   * Get all tags
   */
  getTags: protectedProcedure.query(() => {
    return getAllTags();
  }),
});
