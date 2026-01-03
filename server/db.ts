import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  organizations,
  contacts,
  emailCampaigns,
  workflows,
  tickets,
  orders,
  integrations,
  analyticsEvents
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Organization queries
export async function getOrganizationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Contact queries
export async function getContactsByOrganization(organizationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(contacts)
    .where(eq(contacts.organizationId, organizationId))
    .orderBy(desc(contacts.createdAt))
    .limit(limit);
}

// Email campaign queries
export async function getCampaignsByOrganization(organizationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(emailCampaigns)
    .where(eq(emailCampaigns.organizationId, organizationId))
    .orderBy(desc(emailCampaigns.createdAt))
    .limit(limit);
}

// Workflow queries
export async function getWorkflowsByOrganization(organizationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(workflows)
    .where(eq(workflows.organizationId, organizationId))
    .orderBy(desc(workflows.createdAt))
    .limit(limit);
}

// Ticket queries
export async function getTicketsByOrganization(organizationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tickets)
    .where(eq(tickets.organizationId, organizationId))
    .orderBy(desc(tickets.createdAt))
    .limit(limit);
}

// Order queries
export async function getOrdersByOrganization(organizationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orders)
    .where(eq(orders.organizationId, organizationId))
    .orderBy(desc(orders.orderDate))
    .limit(limit);
}

// Integration queries
export async function getIntegrationsByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(integrations)
    .where(eq(integrations.organizationId, organizationId))
    .orderBy(desc(integrations.createdAt));
}

// Analytics queries
export async function getAnalyticsEventsByOrganization(
  organizationId: number, 
  eventType?: string,
  limit = 100
) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(analyticsEvents.organizationId, organizationId)];
  if (eventType) {
    conditions.push(sql`${analyticsEvents.eventType} = ${eventType}`);
  }
  
  return db.select().from(analyticsEvents)
    .where(and(...conditions))
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(limit);
}

// Dashboard stats
export async function getDashboardStats(organizationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [contactsCount] = await db.select({ count: sql<number>`count(*)` })
    .from(contacts)
    .where(eq(contacts.organizationId, organizationId));
    
  const [campaignsCount] = await db.select({ count: sql<number>`count(*)` })
    .from(emailCampaigns)
    .where(eq(emailCampaigns.organizationId, organizationId));
    
  const [ticketsCount] = await db.select({ count: sql<number>`count(*)` })
    .from(tickets)
    .where(and(
      eq(tickets.organizationId, organizationId),
      eq(tickets.status, 'open')
    ));
    
  const [ordersCount] = await db.select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.organizationId, organizationId));
  
  return {
    totalContacts: contactsCount?.count || 0,
    totalCampaigns: campaignsCount?.count || 0,
    openTickets: ticketsCount?.count || 0,
    totalOrders: ordersCount?.count || 0,
  };
}
