/**
 * Customer Context Builder
 * Aggregates customer data for AI response generation
 */

import { getDb } from "../../db";
import { eq, desc, and, gte } from "drizzle-orm";
import { contacts, orders, tickets } from "../../../drizzle/schema";
import type { CustomerContext, OrderContext, ResponseGenerationContext } from "./prompts/response";

export interface CustomerValueMetrics {
  totalOrders: number;
  lifetimeValue: number;
  avgOrderValue: number;
  daysSinceLastOrder: number;
  isVip: boolean;
  vipReason?: string;
}

export interface CustomerEngagement {
  totalTickets: number;
  openTickets: number;
  avgResolutionTime?: number;
  emailsReceived: number;
  emailsOpened: number;
  openRate: number;
}

export interface FullCustomerContext {
  customer: CustomerContext;
  orders: OrderContext[];
  valueMetrics: CustomerValueMetrics;
  engagement: CustomerEngagement;
  previousTicketSummaries: string[];
}

// VIP thresholds
const VIP_THRESHOLDS = {
  minOrders: 5,
  minLifetimeValue: 500,
  minAvgOrderValue: 100,
};

/**
 * Calculate if customer is VIP based on metrics
 */
function calculateVipStatus(metrics: Omit<CustomerValueMetrics, 'isVip' | 'vipReason'>): { isVip: boolean; reason?: string } {
  if (metrics.lifetimeValue >= VIP_THRESHOLDS.minLifetimeValue) {
    return { isVip: true, reason: `Lifetime value $${metrics.lifetimeValue.toFixed(2)}` };
  }
  if (metrics.totalOrders >= VIP_THRESHOLDS.minOrders && metrics.avgOrderValue >= VIP_THRESHOLDS.minAvgOrderValue) {
    return { isVip: true, reason: `${metrics.totalOrders} orders, avg $${metrics.avgOrderValue.toFixed(2)}` };
  }
  return { isVip: false };
}

/**
 * Build customer context from database
 */
export async function buildCustomerContext(
  customerId: string,
  organizationId: string
): Promise<FullCustomerContext | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    // Fetch customer (contacts table)
    const customerResults = await db.select().from(contacts)
      .where(and(
        eq(contacts.id, parseInt(customerId)),
        eq(contacts.organizationId, organizationId)
      ))
      .limit(1);

    const customer = customerResults[0];
    if (!customer) return null;

    // Fetch orders (last 10)
    const customerOrders = await db.select().from(orders)
      .where(and(
        eq(orders.contactId, parseInt(customerId)),
        eq(orders.organizationId, organizationId)
      ))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Fetch tickets (last 5)
    const customerTickets = await db.select().from(tickets)
      .where(and(
        eq(tickets.contactId, parseInt(customerId)),
        eq(tickets.organizationId, organizationId)
      ))
      .orderBy(desc(tickets.createdAt))
      .limit(5);

    // Email engagement - simplified (no emailLogs table)
    const emails: any[] = [];

    // Calculate metrics
    const totalValue = customerOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const avgOrderValue = customerOrders.length > 0 ? totalValue / customerOrders.length : 0;
    const lastOrderDate = customerOrders[0]?.createdAt;
    const daysSinceLastOrder = lastOrderDate 
      ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
      : -1;

    const baseMetrics = {
      totalOrders: customerOrders.length,
      lifetimeValue: totalValue,
      avgOrderValue,
      daysSinceLastOrder,
    };

    const vipStatus = calculateVipStatus(baseMetrics);

    const valueMetrics: CustomerValueMetrics = {
      ...baseMetrics,
      isVip: vipStatus.isVip,
      vipReason: vipStatus.reason,
    };

    // Email engagement
    const emailsOpened = emails.filter(e => e.opened).length;
    const engagement: CustomerEngagement = {
      totalTickets: customerTickets.length,
      openTickets: customerTickets.filter(t => t.status === 'open' || t.status === 'pending').length,
      emailsReceived: emails.length,
      emailsOpened,
      openRate: emails.length > 0 ? (emailsOpened / emails.length) * 100 : 0,
    };

    // Build order contexts
    const orderContexts: OrderContext[] = customerOrders.map(o => ({
      orderNumber: o.orderNumber || o.id,
      status: o.status || 'unknown',
      trackingNumber: o.trackingNumber || undefined,
      carrier: o.carrier || undefined,
      estimatedDelivery: o.estimatedDelivery ? new Date(o.estimatedDelivery).toLocaleDateString() : undefined,
      items: o.items ? (typeof o.items === 'string' ? JSON.parse(o.items) : o.items) : undefined,
      totalPrice: Number(o.totalAmount || 0),
    }));

    // Build ticket summaries
    const ticketSummaries = customerTickets.map(t => 
      `[${t.status}] ${t.subject}: ${(t as any).aiCategory || 'uncategorized'} - ${(t as any).aiSentiment || 'unknown'} sentiment`
    );

    return {
      customer: {
        name: customer.name || undefined,
        email: customer.email,
        totalOrders: valueMetrics.totalOrders,
        lifetimeValue: valueMetrics.lifetimeValue,
        lastOrderDate: lastOrderDate ? new Date(lastOrderDate) : undefined,
        isVip: valueMetrics.isVip,
      },
      orders: orderContexts,
      valueMetrics,
      engagement,
      previousTicketSummaries: ticketSummaries,
    };
  } catch (error) {
    console.error('[ContextBuilder] Error building customer context:', error);
    return null;
  }
}

/**
 * Build context for response generation from ticket
 */
export async function buildResponseContext(
  ticketId: string,
  organizationId: string
): Promise<ResponseGenerationContext> {
  try {
    const db = await getDb();
    if (!db) return {};

    // Fetch ticket
    const ticketResults = await db.select().from(tickets)
      .where(and(
        eq(tickets.id, parseInt(ticketId)),
        eq(tickets.organizationId, organizationId)
      ))
      .limit(1);

    const ticket = ticketResults[0];
    if (!ticket) {
      return {};
    }

    const context: ResponseGenerationContext = {
      ticketCategory: (ticket as any).aiCategory as any,
      ticketPriority: (ticket as any).aiPriority as any,
      sentiment: (ticket as any).aiSentiment as any,
    };

    // Build customer context if available
    if (ticket.contactId) {
      const fullContext = await buildCustomerContext(String(ticket.contactId), organizationId);
      if (fullContext) {
        context.customer = fullContext.customer;
        context.recentOrders = fullContext.orders.slice(0, 3);
      }
    }

    return context;
  } catch (error) {
    console.error('[ContextBuilder] Error building response context:', error);
    return {};
  }
}

/**
 * Quick context builder for known order number
 */
export async function buildOrderContext(
  orderNumber: string,
  organizationId: string
): Promise<OrderContext | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const orderResults = await db.select().from(orders)
      .where(and(
        eq(orders.orderNumber, orderNumber),
        eq(orders.organizationId, organizationId)
      ))
      .limit(1);

    const order = orderResults[0];
    if (!order) return null;

    return {
      orderNumber: order.orderNumber || String(order.id),
      status: order.status || 'unknown',
      trackingNumber: order.trackingNumber || undefined,
      carrier: order.carrier || undefined,
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : undefined,
      items: order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : undefined,
      totalPrice: Number(order.totalAmount || 0),
    };
  } catch (error) {
    console.error('[ContextBuilder] Error building order context:', error);
    return null;
  }
}

export default {
  buildCustomerContext,
  buildResponseContext,
  buildOrderContext,
};
