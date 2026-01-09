import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { integrations, organizations } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { ShopifyClient, SHOPIFY_SCOPES, SHOPIFY_WEBHOOK_TOPICS } from '../integrations/shopify';
import { WooCommerceClient, WOOCOMMERCE_WEBHOOK_TOPICS } from '../integrations/woocommerce';
import { SyncEngine } from '../integrations/syncEngine';
import crypto from 'crypto';

/**
 * Get or create organization for user
 */
async function getOrganizationId(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Check if user has an organization
  const orgs = await db.select().from(organizations).where(eq(organizations.ownerId, userId)).limit(1);
  
  if (orgs.length > 0) {
    return orgs[0].id;
  }

  // Create default organization
  const [newOrg] = await db.insert(organizations).values({
    name: 'My Organization',
    slug: `org-${userId}-${Date.now()}`,
    ownerId: userId,
  }).$returningId();

  return newOrg.id;
}

/**
 * Integrations Router
 * Handles Shopify and WooCommerce connections and sync
 */
export const integrationsRouter = router({
  /**
   * List all integrations for the organization
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const organizationId = await getOrganizationId(ctx.user.id);

    // For prototype, return mock data
    return [
      {
        id: 1,
        platform: 'shopify',
        name: 'My Shopify Store',
        status: 'connected',
        lastSyncAt: new Date(Date.now() - 3600000),
        syncedContacts: 2847,
        syncedOrders: 1456,
      },
      {
        id: 2,
        platform: 'woocommerce',
        name: 'WooCommerce Site',
        status: 'disconnected',
        lastSyncAt: null,
        syncedContacts: 0,
        syncedOrders: 0,
      },
    ];
  }),

  /**
   * Initiate Shopify OAuth flow
   */
  shopifyConnect: protectedProcedure
    .input(
      z.object({
        shop: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const organizationId = await getOrganizationId(ctx.user.id);

      // Generate state for CSRF protection
      const state = crypto.randomBytes(32).toString('hex');

      const config = {
        clientId: process.env.SHOPIFY_CLIENT_ID || 'demo-client-id',
        clientSecret: process.env.SHOPIFY_CLIENT_SECRET || 'demo-secret',
        scopes: SHOPIFY_SCOPES as unknown as string[],
        redirectUri: `${process.env.APP_URL || 'http://localhost:3000'}/api/integrations/shopify/callback`,
      };

      const authUrl = ShopifyClient.getAuthorizationUrl(config, input.shop, state);

      return {
        authUrl,
        state,
      };
    }),

  /**
   * Handle Shopify OAuth callback
   */
  shopifyCallback: protectedProcedure
    .input(
      z.object({
        shop: z.string(),
        code: z.string(),
        state: z.string(),
        hmac: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const organizationId = await getOrganizationId(ctx.user.id);

      // Verify HMAC
      const config = {
        clientId: process.env.SHOPIFY_CLIENT_ID || 'demo-client-id',
        clientSecret: process.env.SHOPIFY_CLIENT_SECRET || 'demo-secret',
        scopes: SHOPIFY_SCOPES as unknown as string[],
        redirectUri: `${process.env.APP_URL || 'http://localhost:3000'}/api/integrations/shopify/callback`,
      };

      const isValid = ShopifyClient.verifyHmac(
        {
          shop: input.shop,
          code: input.code,
          state: input.state,
          hmac: input.hmac,
        },
        config.clientSecret
      );

      if (!isValid) {
        throw new Error('Invalid HMAC signature');
      }

      // Exchange code for access token
      const tokenData = await ShopifyClient.exchangeCodeForToken(
        input.shop,
        input.code,
        config
      );

      // Get shop info
      const client = new ShopifyClient(input.shop, tokenData.accessToken);
      const shopInfo = await client.getShopInfo();

      // Save integration
      const [integration] = await db
        .insert(integrations)
        .values({
          organizationId,
          type: 'shopify',
          credentials: {
            shop: input.shop,
            accessToken: tokenData.accessToken,
            scope: tokenData.scope,
            name: shopInfo.name || input.shop,
          },
          status: 'active',
          config: {
            shopInfo,
          },
        })
        .$returningId();

      // Register webhooks
      for (const topic of Object.values(SHOPIFY_WEBHOOK_TOPICS)) {
        try {
          await client.createWebhook(
            topic,
            `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/shopify`
          );
        } catch (error) {
          console.error(`Failed to create webhook for ${topic}:`, error);
        }
      }

      return {
        success: true,
        integrationId: integration.id,
      };
    }),

  /**
   * Connect WooCommerce store
   */
  woocommerceConnect: protectedProcedure
    .input(
      z.object({
        storeUrl: z.string().url(),
        consumerKey: z.string().min(1),
        consumerSecret: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const organizationId = await getOrganizationId(ctx.user.id);

      // Test connection
      const client = new WooCommerceClient({
        storeUrl: input.storeUrl,
        consumerKey: input.consumerKey,
        consumerSecret: input.consumerSecret,
      });

      const testResult = await client.testConnection();

      if (!testResult.success) {
        throw new Error(`Connection failed: ${testResult.error}`);
      }

      // Save integration
      const [integration] = await db
        .insert(integrations)
        .values({
          organizationId,
          type: 'woocommerce',
          credentials: {
            storeUrl: input.storeUrl,
            consumerKey: input.consumerKey,
            consumerSecret: input.consumerSecret,
            name: new URL(input.storeUrl).hostname,
          },
          status: 'active',
          config: {
            storeInfo: testResult.storeInfo,
          },
        })
        .$returningId();

      // Register webhooks
      for (const topic of Object.values(WOOCOMMERCE_WEBHOOK_TOPICS)) {
        try {
          await client.createWebhook(
            topic,
            `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/woocommerce`
          );
        } catch (error) {
          console.error(`Failed to create webhook for ${topic}:`, error);
        }
      }

      return {
        success: true,
        integrationId: integration.id,
      };
    }),

  /**
   * Trigger manual sync
   */
  sync: protectedProcedure
    .input(
      z.object({
        integrationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const organizationId = await getOrganizationId(ctx.user.id);

      // Get integration
      const [integration] = await db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.id, input.integrationId),
            eq(integrations.organizationId, organizationId)
          )
        )
        .limit(1);

      if (!integration) {
        throw new Error('Integration not found');
      }

      const syncEngine = new SyncEngine(organizationId, integration.id);

      let result;

      if (integration.type === 'shopify') {
        const credentials = integration.credentials as any;
        result = await syncEngine.fullShopifySync(
          credentials.accessToken,
          credentials.shop
        );
      } else if (integration.type === 'woocommerce') {
        const credentials = integration.credentials as any;
        result = await syncEngine.fullWooCommerceSync(
          credentials.storeUrl,
          credentials.consumerKey,
          credentials.consumerSecret
        );
      } else {
        throw new Error('Unsupported platform');
      }

      return {
        success: true,
        customers: result.customers,
        orders: result.orders,
      };
    }),

  /**
   * Disconnect integration
   */
  disconnect: protectedProcedure
    .input(
      z.object({
        integrationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const organizationId = await getOrganizationId(ctx.user.id);

      await db
        .update(integrations)
        .set({
          status: 'inactive',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(integrations.id, input.integrationId),
            eq(integrations.organizationId, organizationId)
          )
        );

      return {
        success: true,
      };
    }),

  /**
   * Get sync history for an integration
   */
  syncHistory: protectedProcedure
    .input(
      z.object({
        integrationId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      // For prototype, return mock data
      return [
        {
          id: 1,
          timestamp: new Date(Date.now() - 3600000),
          type: 'full',
          status: 'completed',
          customersSynced: 2847,
          ordersSynced: 1456,
          duration: 45,
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 7200000),
          type: 'incremental',
          status: 'completed',
          customersSynced: 12,
          ordersSynced: 34,
          duration: 8,
        },
      ];
    }),
});
