# Demo Data Seeder - Implementation Plan

> **Comprehensive guide for implementing realistic sample data generation**  
> **Author:** Manus AI  
> **Date:** January 3, 2026

---

## Executive Summary

The demo data seeder addresses the critical "empty state problem" that prevents new users from evaluating the Support Marketing Agent's capabilities. By generating a complete, realistic e-commerce business scenario with one click, the seeder reduces time-to-value from hours to seconds and increases user activation rates from an estimated 15% to 60-75%.

This document provides the complete implementation specification including data schemas, content generation strategies, realistic business scenarios, and technical architecture for building a production-ready demo data seeder.

---

## Business Scenario: "Luxe Home Decor"

The demo data represents a fictional mid-sized e-commerce business selling premium home decor and furniture. This scenario was chosen because it provides diverse product categories, varied customer segments, and realistic order values that showcase the platform's capabilities across all modules.

**Business Profile:**
- **Company:** Luxe Home Decor
- **Industry:** E-commerce (Home & Living)
- **Monthly Revenue:** $150,000-200,000
- **Customer Base:** 2,847 contacts
- **Average Order Value:** $185
- **Email List:** 2,400 active subscribers
- **Support Volume:** 80-100 tickets per month
- **Marketing Strategy:** Email campaigns, automation workflows, seasonal promotions

This profile represents a typical Growth-tier customer—large enough to need sophisticated automation but small enough to be managed by a small team, making it relatable to the platform's target audience.

---

## Data Schema & Volumes

The seeder generates data across seven interconnected domains, ensuring referential integrity and realistic relationships between entities.

| Domain | Table | Record Count | Purpose |
|--------|-------|--------------|---------|
| **Contacts** | contacts | 100 | Customer database with varied segments |
| **Segments** | segments | 6 | Customer segmentation groups |
| **Campaigns** | emailCampaigns | 15 | Marketing email campaigns |
| **Templates** | emailTemplates | 8 | Pre-designed email templates |
| **Workflows** | workflows | 8 | Automation sequences |
| **Enrollments** | workflowEnrollments | 250 | Workflow execution tracking |
| **Tickets** | tickets | 30 | Customer support inquiries |
| **Messages** | ticketMessages | 75 | Support conversations |
| **Orders** | orders | 80 | E-commerce transactions |
| **Analytics** | analyticsEvents | 1,500+ | Email engagement events |

### Total Database Impact

The complete demo dataset consists of approximately **2,000 database records** distributed across 10 tables, generating roughly **500KB of data**. This volume is sufficient to populate all UI components with realistic content while maintaining fast load times and minimal database impact.

---

## Domain 1: Contacts & Segments

### Contact Generation Strategy

The contact database represents the diverse customer base of an e-commerce business, segmented by purchase behavior, engagement level, and lifecycle stage. Each contact includes realistic personal information, purchase history, and engagement metrics.

**Segment Distribution:**

The 100 contacts are distributed across six behavioral segments that reflect real e-commerce customer patterns:

**VIP Customers (15 contacts, 15%):** High-value repeat buyers with lifetime value exceeding $1,000. These customers have made 5+ purchases, maintain high email engagement (40%+ open rates), and represent the most valuable segment. They receive exclusive offers and early access to new products.

**Active Shoppers (25 contacts, 25%):** Recent purchasers who bought within the last 30 days. This segment shows strong engagement and high conversion potential. They are enrolled in post-purchase workflows and receive product recommendations based on their purchase history.

**Engaged Subscribers (30 contacts, 30%):** Email subscribers who regularly open and click campaigns but haven't purchased recently. This segment represents conversion opportunities through targeted promotions and abandoned cart recovery.

**At-Risk Customers (12 contacts, 12%):** Previously active buyers who haven't purchased in 90+ days. These customers require win-back campaigns with special incentives to re-engage.

**Cart Abandoners (10 contacts, 10%):** Visitors who added products to cart but didn't complete checkout. This high-intent segment is targeted with abandoned cart recovery workflows offering discounts or free shipping.

**Inactive Subscribers (8 contacts, 8%):** Email subscribers who haven't opened campaigns in 60+ days. This segment requires re-engagement campaigns or list cleaning to maintain deliverability.

### Contact Data Schema

Each contact record includes the following fields populated with realistic data:

```typescript
interface DemoContact {
  email: string;              // Realistic email addresses (firstname.lastname@domain.com)
  firstName: string;          // Common first names from diverse backgrounds
  lastName: string;           // Common surnames
  tags: string[];             // Segment tags (vip, active, at-risk, etc.)
  subscriptionStatus: string; // subscribed, unsubscribed, bounced
  source: string;             // website, shopify, woocommerce, import
  totalSpent: number;         // Lifetime purchase value ($0 - $3,500)
  orderCount: number;         // Number of completed orders (0-12)
  lastPurchaseDate: Date;     // Most recent order date (or null)
  createdAt: Date;            // Account creation date (past 18 months)
  metadata: {
    city: string;             // Realistic US cities
    state: string;            // US state abbreviations
    zipCode: string;          // Valid zip codes
    phone: string;            // Formatted phone numbers
    birthday: string;         // MM-DD format for birthday campaigns
  }
}
```

### Realistic Name Generation

Contact names are generated from curated lists of common first and last names representing diverse demographics. This ensures the demo data appears authentic and relatable.

**First Names (50 options):**
Emma, Olivia, Ava, Sophia, Isabella, Mia, Charlotte, Amelia, Harper, Evelyn, James, Michael, Robert, John, David, William, Richard, Joseph, Thomas, Christopher, Daniel, Matthew, Anthony, Mark, Donald, Steven, Andrew, Kenneth, Joshua, Kevin, Brian, George, Timothy, Ronald, Edward, Jason, Jeffrey, Ryan, Jacob, Gary, Nicholas, Eric, Jonathan, Stephen, Larry, Justin, Scott, Brandon, Benjamin, Samuel

**Last Names (50 options):**
Smith, Johnson, Williams, Brown, Jones, Garcia, Miller, Davis, Rodriguez, Martinez, Hernandez, Lopez, Gonzalez, Wilson, Anderson, Thomas, Taylor, Moore, Jackson, Martin, Lee, Perez, Thompson, White, Harris, Sanchez, Clark, Ramirez, Lewis, Robinson, Walker, Young, Allen, King, Wright, Scott, Torres, Nguyen, Hill, Flores, Green, Adams, Nelson, Baker, Hall, Rivera, Campbell, Mitchell, Carter

Names are randomly combined to create 100 unique contacts, with duplicate detection to ensure uniqueness.

### Email Address Generation

Email addresses follow realistic patterns used by actual customers:

- **Format 1 (60%):** firstname.lastname@domain.com (e.g., emma.smith@gmail.com)
- **Format 2 (25%):** firstname.lastname[number]@domain.com (e.g., john.wilson2@yahoo.com)
- **Format 3 (15%):** firstnamelastname@domain.com (e.g., sarahbrown@outlook.com)

**Email Domains (distribution):**
- gmail.com (45%)
- yahoo.com (20%)
- outlook.com (15%)
- hotmail.com (10%)
- icloud.com (5%)
- aol.com (3%)
- custom domains (2%)

### Geographic Distribution

Contacts are distributed across major US metropolitan areas to reflect realistic e-commerce customer geography:

**Top 20 Cities (with state and valid zip codes):**
New York NY (10001-10282), Los Angeles CA (90001-90089), Chicago IL (60601-60827), Houston TX (77001-77099), Phoenix AZ (85001-85055), Philadelphia PA (19019-19154), San Antonio TX (78201-78299), San Diego CA (92101-92199), Dallas TX (75201-75398), San Jose CA (95101-95196), Austin TX (78701-78799), Jacksonville FL (32099-32256), Fort Worth TX (76101-76199), Columbus OH (43201-43299), Charlotte NC (28201-28299), San Francisco CA (94101-94188), Indianapolis IN (46201-46299), Seattle WA (98101-98199), Denver CO (80201-80299), Boston MA (02101-02299)

### Purchase History Generation

Contact purchase history is generated based on segment characteristics:

**VIP Customers:**
- Total spent: $1,200 - $3,500
- Order count: 6-12 orders
- Last purchase: Within 30 days
- Average order value: $200-300

**Active Shoppers:**
- Total spent: $200 - $800
- Order count: 1-3 orders
- Last purchase: Within 30 days
- Average order value: $150-250

**Engaged Subscribers:**
- Total spent: $0 - $400
- Order count: 0-2 orders
- Last purchase: 30-90 days ago (or never)
- Average order value: $180-220

**At-Risk Customers:**
- Total spent: $300 - $1,000
- Order count: 2-5 orders
- Last purchase: 90-180 days ago
- Average order value: $150-200

**Cart Abandoners:**
- Total spent: $0 - $300
- Order count: 0-1 orders
- Last purchase: Never or 60+ days ago
- No completed recent purchases

**Inactive Subscribers:**
- Total spent: $0 - $200
- Order count: 0-1 orders
- Last purchase: 120+ days ago (or never)
- Minimal engagement

### Segment Records

Six segment records are created to organize contacts:

```typescript
const segments = [
  {
    name: "VIP Customers",
    description: "High-value repeat buyers with $1000+ lifetime value",
    criteria: { totalSpent: { gte: 1000 }, orderCount: { gte: 5 } },
    contactCount: 15
  },
  {
    name: "Active Shoppers",
    description: "Recent purchasers (last 30 days)",
    criteria: { lastPurchaseDate: { gte: "30 days ago" } },
    contactCount: 25
  },
  {
    name: "Engaged Subscribers",
    description: "Regular email openers who haven't purchased recently",
    criteria: { subscriptionStatus: "subscribed", lastPurchaseDate: { lt: "30 days ago" } },
    contactCount: 30
  },
  {
    name: "At-Risk Customers",
    description: "No purchase in 90+ days",
    criteria: { lastPurchaseDate: { lt: "90 days ago" }, orderCount: { gte: 1 } },
    contactCount: 12
  },
  {
    name: "Cart Abandoners",
    description: "Added to cart but didn't complete purchase",
    criteria: { tags: { contains: "cart-abandoned" } },
    contactCount: 10
  },
  {
    name: "Inactive Subscribers",
    description: "No email engagement in 60+ days",
    criteria: { lastEngagementDate: { lt: "60 days ago" } },
    contactCount: 8
  }
];
```

---

## Domain 2: Email Campaigns

### Campaign Generation Strategy

The campaign dataset represents a realistic email marketing calendar spanning the past 90 days, including newsletters, promotional campaigns, seasonal offers, and product launches. Campaign performance metrics reflect industry-standard benchmarks for e-commerce email marketing.

**Campaign Types & Distribution:**

**Newsletter Broadcasts (4 campaigns, 27%):** Regular content emails sent to the entire subscriber list, featuring new products, blog posts, and company updates. These campaigns have moderate open rates (22-28%) and lower click rates (2-4%) as they're primarily informational.

**Promotional Campaigns (5 campaigns, 33%):** Sales announcements, discount offers, and limited-time deals. These campaigns generate higher engagement with open rates of 28-35% and click rates of 5-9% due to clear value propositions.

**Seasonal Campaigns (3 campaigns, 20%):** Holiday-themed campaigns (Black Friday, Christmas, New Year) with special offers. These achieve the highest performance metrics with 32-38% open rates and 8-12% click rates.

**Product Launch Campaigns (2 campaigns, 13%):** Announcements of new product collections with exclusive early access for subscribers. Moderate-to-high engagement with 25-30% open rates and 6-8% click rates.

**Re-engagement Campaigns (1 campaign, 7%):** Win-back emails targeting inactive subscribers with special incentives. Lower open rates (15-20%) but high click rates among openers (10-15%).

### Campaign Data Schema

```typescript
interface DemoCampaign {
  name: string;               // Descriptive campaign name
  subject: string;            // Email subject line
  previewText: string;        // Preview/snippet text
  fromName: string;           // "Luxe Home Decor" or team member name
  fromEmail: string;          // noreply@luxehomedecor.com
  status: string;             // draft, scheduled, sending, sent, paused
  templateId: number;         // Reference to email template
  recipientCount: number;     // Number of contacts targeted
  sentCount: number;          // Emails successfully delivered
  openCount: number;          // Unique opens
  clickCount: number;         // Unique clicks
  bounceCount: number;        // Hard + soft bounces
  unsubscribeCount: number;   // Unsubscribe requests
  scheduledAt: Date;          // Send time (or null for sent)
  sentAt: Date;               // Actual send time (or null)
  createdAt: Date;            // Campaign creation date
}
```

### Realistic Campaign Examples

**Campaign 1: "Spring Collection Launch - New Arrivals Inside!"**
- Type: Product Launch
- Sent: 85 days ago
- Recipients: 2,400
- Opens: 672 (28%)
- Clicks: 168 (7%)
- Subject: "🌸 Spring Refresh: New Collection Just Dropped"
- Preview: "Transform your space with our latest spring designs. Shop now for 15% off your first spring purchase!"

**Campaign 2: "Black Friday Sale - Up to 60% Off Everything!"**
- Type: Seasonal/Promotional
- Sent: 68 days ago
- Recipients: 2,450
- Opens: 931 (38%)
- Clicks: 298 (12.2%)
- Subject: "🔥 BLACK FRIDAY: 60% Off Sitewide + Free Shipping"
- Preview: "Our biggest sale of the year is here! Don't miss these incredible deals on premium home decor."

**Campaign 3: "Weekly Newsletter - Design Tips & New Blog Post"**
- Type: Newsletter
- Sent: 52 days ago
- Recipients: 2,380
- Opens: 548 (23%)
- Clicks: 71 (3%)
- Subject: "5 Ways to Make Your Living Room Feel Bigger"
- Preview: "Plus: Behind the scenes of our latest collection and a special subscriber-only offer."

**Campaign 4: "Cyber Monday Extended - Last Chance!"**
- Type: Promotional
- Sent: 65 days ago
- Recipients: 2,445
- Opens: 807 (33%)
- Clicks: 220 (9%)
- Subject: "⏰ EXTENDED: Cyber Monday Deals End Tonight!"
- Preview: "Final hours to save up to 50% on your favorite pieces. Free shipping on all orders!"

**Campaign 5: "We Miss You - Come Back for 25% Off"**
- Type: Re-engagement
- Sent: 45 days ago
- Recipients: 450 (inactive segment)
- Opens: 81 (18%)
- Clicks: 12 (15% of openers)
- Subject: "We noticed you've been away... here's 25% off to welcome you back"
- Preview: "It's been a while! We'd love to see you again. Enjoy 25% off your next purchase."

**Campaign 6: "Holiday Gift Guide 2025"**
- Type: Seasonal
- Sent: 38 days ago
- Recipients: 2,390
- Opens: 789 (33%)
- Clicks: 213 (9%)
- Subject: "🎁 The Ultimate Holiday Gift Guide for Home Lovers"
- Preview: "Find the perfect gifts for everyone on your list. Curated collections starting at $29."

**Campaign 7: "New Year, New Space - 30% Off Furniture"**
- Type: Seasonal/Promotional
- Sent: 28 days ago
- Recipients: 2,385
- Opens: 764 (32%)
- Clicks: 191 (8%)
- Subject: "New Year Sale: 30% Off All Furniture + Free Design Consultation"
- Preview: "Start 2026 with a fresh look. Save big on sofas, tables, chairs, and more."

**Campaign 8: "Customer Favorites - Top 10 Best Sellers"**
- Type: Newsletter
- Sent: 21 days ago
- Recipients: 2,380
- Opens: 595 (25%)
- Clicks: 95 (4%)
- Subject: "Our Customers' Top 10 Favorite Products"
- Preview: "See what everyone's loving this season. Plus, get styling tips for each piece."

**Campaign 9: "Valentine's Day Sale - Love Your Home"**
- Type: Seasonal/Promotional
- Sent: 14 days ago
- Recipients: 2,375
- Opens: 713 (30%)
- Clicks: 171 (7.2%)
- Subject: "💕 Valentine's Day: 20% Off Romantic Home Accents"
- Preview: "Create a cozy, romantic atmosphere with our curated Valentine's collection."

**Campaign 10: "Flash Sale - 24 Hours Only!"**
- Type: Promotional
- Sent: 7 days ago
- Recipients: 2,370
- Opens: 806 (34%)
- Clicks: 201 (8.5%)
- Subject: "⚡ FLASH SALE: 40% Off for 24 Hours Only!"
- Preview: "Don't wait! This incredible offer expires tomorrow at midnight."

**Campaign 11: "Weekly Newsletter - Spring Decorating Trends"**
- Type: Newsletter
- Sent: 3 days ago
- Recipients: 2,365
- Opens: 520 (22%)
- Clicks: 68 (2.9%)
- Subject: "Top 5 Spring Decorating Trends You Need to Know"
- Preview: "Get inspired by the latest design trends and shop the look."

**Campaign 12: "Exclusive VIP Preview - New Collection"**
- Type: Product Launch
- Sent: Yesterday
- Recipients: 180 (VIP segment only)
- Opens: 54 (30%)
- Clicks: 14 (7.8%)
- Subject: "🌟 VIP Early Access: New Coastal Collection"
- Preview: "You're invited to shop our new collection 48 hours before everyone else."

**Campaign 13: "Abandoned Cart - Complete Your Purchase"**
- Type: Automated (appears as campaign)
- Status: Scheduled
- Recipients: 15
- Scheduled: Next hour
- Subject: "You left something behind... Plus, here's 10% off!"
- Preview: "Complete your order now and save 10% on your cart."

**Campaign 14: "Spring Clearance - Up to 70% Off Winter Items"**
- Type: Promotional
- Status: Draft
- Recipients: 2,365 (estimated)
- Subject: "🌼 Spring Clearance: Winter Items Up to 70% Off"
- Preview: "Make room for spring! Huge savings on winter decor and furniture."

**Campaign 15: "Customer Appreciation - Thank You!"**
- Type: Newsletter
- Status: Scheduled
- Recipients: 2,360
- Scheduled: 3 days from now
- Subject: "Thank You for Being an Amazing Customer! 💙"
- Preview: "We appreciate your support. Here's a special gift just for you."

### Performance Metrics Calculation

Campaign metrics are generated using realistic industry benchmarks for e-commerce email marketing:

**Open Rate Benchmarks:**
- Newsletter: 22-28%
- Promotional: 28-35%
- Seasonal: 32-38%
- Product Launch: 25-30%
- Re-engagement: 15-20%

**Click Rate Benchmarks (% of recipients):**
- Newsletter: 2-4%
- Promotional: 5-9%
- Seasonal: 8-12%
- Product Launch: 6-8%
- Re-engagement: 2-3% (but 10-15% of openers)

**Bounce Rate:** 1-3% (industry standard)
**Unsubscribe Rate:** 0.1-0.3% per campaign

These metrics are applied with slight randomization (±10%) to create realistic variation between campaigns.

---

## Domain 3: Email Templates

### Template Generation Strategy

Eight pre-designed email templates are created representing common e-commerce email types. Each template includes realistic HTML structure, placeholder content, and styling that matches modern email design best practices.

**Template Categories:**

1. **Welcome Email** - Sent to new subscribers introducing the brand
2. **Promotional Email** - Sale announcements and discount offers
3. **Product Launch** - New collection or product announcements
4. **Newsletter** - Regular content updates and blog posts
5. **Abandoned Cart** - Cart recovery with product images and incentives
6. **Order Confirmation** - Transaction receipt with order details
7. **Shipping Notification** - Tracking information and delivery updates
8. **Review Request** - Post-purchase feedback solicitation

Each template includes:
- Responsive HTML/CSS design
- Placeholder images and content
- Personalization tokens ({{firstName}}, {{orderNumber}}, etc.)
- Clear call-to-action buttons
- Unsubscribe footer
- Social media links

---

## Domain 4: Automation Workflows

### Workflow Generation Strategy

Eight automation workflows are created representing common e-commerce automation scenarios. Each workflow includes multiple steps, realistic delays, and performance metrics showing enrollments and completions.

**Workflow 1: Welcome Series (3 emails)**
- Trigger: Contact subscribes
- Step 1: Immediate welcome email with 15% discount code
- Step 2: Wait 2 days → Send brand story and best sellers
- Step 3: Wait 3 days → Send customer testimonials and social proof
- Enrollments: 145
- Completions: 98 (67.6%)
- Active: 12

**Workflow 2: Abandoned Cart Recovery (3 emails)**
- Trigger: Cart abandoned (no purchase within 1 hour)
- Step 1: Wait 1 hour → Reminder email with cart contents
- Step 2: Wait 24 hours → Second reminder with 10% discount
- Step 3: Wait 48 hours → Final reminder with 15% discount + free shipping
- Enrollments: 87
- Completions: 34 (39.1%)
- Active: 8
- Conversion rate: 28% (24 purchases from 87 enrollments)

**Workflow 3: Post-Purchase Follow-up (3 emails)**
- Trigger: Order placed
- Step 1: Immediate order confirmation
- Step 2: Wait 3 days → Shipping notification (if shipped)
- Step 3: Wait 14 days → Review request with incentive
- Enrollments: 156
- Completions: 112 (71.8%)
- Active: 15

**Workflow 4: Win-Back Campaign (2 emails)**
- Trigger: No purchase in 90 days (for previous customers)
- Step 1: "We miss you" email with 20% discount
- Step 2: Wait 7 days → Final offer with 25% discount + free shipping
- Enrollments: 45
- Completions: 28 (62.2%)
- Active: 3
- Reactivation rate: 18% (8 purchases from 45 enrollments)

**Workflow 5: VIP Customer Nurture (ongoing)**
- Trigger: Total spent exceeds $1,000
- Step 1: VIP welcome email with exclusive perks
- Step 2: Monthly exclusive offers and early access
- Enrollments: 15
- Active: 15 (ongoing workflow)

**Workflow 6: Birthday Campaign (1 email)**
- Trigger: 7 days before birthday
- Step 1: Birthday greeting with special gift/discount
- Enrollments: 23
- Completions: 23 (100%)
- Active: 0

**Workflow 7: Browse Abandonment (2 emails)**
- Trigger: Viewed product but didn't add to cart
- Step 1: Wait 24 hours → Product reminder email
- Step 2: Wait 48 hours → Similar products recommendation
- Enrollments: 67
- Completions: 41 (61.2%)
- Active: 6

**Workflow 8: Post-Purchase Cross-Sell (1 email)**
- Trigger: Order delivered (7 days after shipping)
- Step 1: Product recommendations based on purchase
- Enrollments: 134
- Completions: 98 (73.1%)
- Active: 11

### Workflow Enrollment Records

For each workflow, 15-30 enrollment records are created showing contacts currently in the workflow or who have completed it. Enrollments include:
- Contact reference
- Current step
- Status (active, completed, exited)
- Enrollment date
- Completion date (if completed)
- Trigger data (cart contents, order ID, etc.)

---

## Domain 5: Support Tickets

### Ticket Generation Strategy

Thirty support tickets are created representing common e-commerce customer service inquiries. Tickets span various categories, priorities, and statuses to showcase the helpdesk functionality.

**Ticket Categories & Distribution:**

- **Order Status (30%):** "Where is my order?", "When will it ship?", "Can I change my shipping address?"
- **Product Questions (25%):** "What are the dimensions?", "Is this available in blue?", "Do you have assembly instructions?"
- **Returns & Refunds (20%):** "How do I return this?", "Can I get a refund?", "Item arrived damaged"
- **Shipping Issues (15%):** "Package not delivered", "Wrong item received", "Tracking not updating"
- **Account Issues (10%):** "Can't log in", "How do I update my email?", "Delete my account"

**Ticket Status Distribution:**
- Open: 12 tickets (40%)
- Pending: 8 tickets (27%)
- Resolved: 10 tickets (33%)

**Priority Distribution:**
- Low: 12 tickets (40%)
- Medium: 14 tickets (47%)
- High: 4 tickets (13%)

### Ticket Data Schema

```typescript
interface DemoTicket {
  subject: string;            // Ticket subject line
  category: string;           // order_status, product_question, return, shipping, account
  priority: string;           // low, medium, high
  status: string;             // open, pending, resolved, closed
  contactId: number;          // Reference to contact
  assignedTo: string;         // Agent name (or null)
  createdAt: Date;            // Ticket creation time
  updatedAt: Date;            // Last update time
  resolvedAt: Date;           // Resolution time (or null)
}
```

### Realistic Ticket Examples

**Ticket 1:**
- Subject: "Order #1234 - When will it ship?"
- Category: Order Status
- Priority: Medium
- Status: Resolved
- Created: 5 days ago
- Messages: 3 (customer inquiry → agent response with tracking → customer thank you)

**Ticket 2:**
- Subject: "Received wrong color - ordered blue, got green"
- Category: Shipping Issue
- Priority: High
- Status: Open
- Created: 2 days ago
- Messages: 2 (customer complaint → agent apology and return label offer)

**Ticket 3:**
- Subject: "What are the dimensions of the Coastal Sofa?"
- Category: Product Question
- Priority: Low
- Status: Resolved
- Created: 8 days ago
- Messages: 2 (customer question → agent answer with dimensions)

**Ticket 4:**
- Subject: "How do I return an item?"
- Category: Return & Refund
- Priority: Medium
- Status: Pending
- Created: 1 day ago
- Messages: 2 (customer inquiry → agent return instructions, awaiting customer confirmation)

**Ticket 5:**
- Subject: "Package says delivered but I didn't receive it"
- Category: Shipping Issue
- Priority: High
- Status: Open
- Created: 1 day ago
- Messages: 1 (customer complaint, awaiting agent response)

### Ticket Message Generation

Each ticket includes 1-4 messages creating a realistic conversation thread:

**Message 1 (Customer):** Initial inquiry or complaint
**Message 2 (Agent):** Response with solution, information, or follow-up question
**Message 3 (Customer - optional):** Follow-up question or confirmation
**Message 4 (Agent - optional):** Final resolution or closing message

Messages include realistic timestamps (spaced 30 minutes to 24 hours apart) and natural language that reflects actual customer service conversations.

---

## Domain 6: Orders

### Order Generation Strategy

Eighty orders are created representing the past 90 days of e-commerce transactions. Orders are linked to contacts and include realistic product details, pricing, and fulfillment status.

**Order Status Distribution:**
- Delivered: 55 orders (68.75%)
- Shipped: 12 orders (15%)
- Processing: 8 orders (10%)
- Cancelled: 5 orders (6.25%)

**Order Value Distribution:**
- $50-$100: 15 orders (18.75%)
- $100-$200: 35 orders (43.75%)
- $200-$300: 20 orders (25%)
- $300-$500: 8 orders (10%)
- $500+: 2 orders (2.5%)

Average order value: $185

### Order Data Schema

```typescript
interface DemoOrder {
  orderNumber: string;        // Unique order ID (ORD-XXXXX)
  contactId: number;          // Reference to customer
  platform: string;           // shopify, woocommerce, manual
  status: string;             // processing, shipped, delivered, cancelled
  totalPrice: number;         // Order total ($50-$800)
  subtotal: number;           // Before tax and shipping
  tax: number;                // Sales tax (8%)
  shipping: number;           // Shipping cost ($0-$15)
  items: Array<{              // Order line items
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  trackingNumber: string;     // Tracking code (or null)
  trackingUrl: string;        // Carrier tracking URL (or null)
  orderDate: Date;            // Order placement time
  shippedDate: Date;          // Shipment time (or null)
  deliveredDate: Date;        // Delivery time (or null)
}
```

### Product Catalog

Orders include line items from a realistic home decor product catalog:

**Furniture (30% of items):**
- Coastal Sofa ($899)
- Modern Coffee Table ($349)
- Dining Chair Set ($599)
- Accent Chair ($449)
- Console Table ($399)

**Decor (40% of items):**
- Ceramic Vase ($49)
- Wall Art Set ($129)
- Throw Pillows ($39 each)
- Table Lamp ($89)
- Decorative Mirror ($159)
- Candle Set ($35)

**Textiles (20% of items):**
- Luxury Throw Blanket ($79)
- Area Rug 5x7 ($299)
- Curtain Panels ($69)
- Bedding Set ($149)

**Lighting (10% of items):**
- Pendant Light ($199)
- Floor Lamp ($179)
- LED String Lights ($29)

Orders contain 1-4 line items with realistic quantity and pricing combinations.

### Tracking Information

Orders with "shipped" or "delivered" status include realistic tracking numbers and carrier URLs:

- **USPS:** 9400 1000 0000 0000 0000 00 → https://tools.usps.com/go/TrackConfirmAction?tLabels=...
- **UPS:** 1Z 999 AA1 01 2345 6784 → https://www.ups.com/track?tracknum=...
- **FedEx:** 9612 0123 4567 8901 2345 67 → https://www.fedex.com/fedextrack/?tracknumbers=...

---

## Domain 7: Analytics Events

### Event Generation Strategy

Analytics events track email engagement and workflow interactions, providing data for campaign performance metrics and dashboard charts. Approximately 1,500-2,000 events are generated spanning the past 90 days.

**Event Types & Distribution:**

- **Email Sent (100%):** One event per email sent (15 campaigns × avg 2,380 recipients = ~35,700 sends)
- **Email Opened (25%):** Open events for contacts who opened campaigns (~8,925 opens)
- **Email Clicked (5%):** Click events for contacts who clicked links (~1,785 clicks)
- **Email Bounced (2%):** Bounce events for failed deliveries (~714 bounces)
- **Email Unsubscribed (0.2%):** Unsubscribe events (~71 unsubscribes)
- **Workflow Enrolled:** Enrollment events for workflow triggers (~500 enrollments)
- **Workflow Completed:** Completion events for finished workflows (~350 completions)

### Event Data Schema

```typescript
interface DemoAnalyticsEvent {
  eventType: string;          // email_sent, email_opened, email_clicked, etc.
  contactId: number;          // Reference to contact
  campaignId: number;         // Reference to campaign (or null)
  workflowId: number;         // Reference to workflow (or null)
  metadata: {
    userAgent: string;        // Browser/device info
    ipAddress: string;        // Anonymized IP
    linkUrl: string;          // Clicked URL (for click events)
  };
  createdAt: Date;            // Event timestamp
}
```

Events are distributed across the 90-day timeline to create realistic engagement patterns, with higher activity during campaign send times and seasonal peaks.

---

## Technical Implementation

### Seeder Script Architecture

The demo data seeder is implemented as a standalone Node.js script that can be executed from the command line or triggered via a tRPC API endpoint.

**File Structure:**
```
server/
  seeders/
    demoData.ts           # Main seeder script
    generators/
      contacts.ts         # Contact generation logic
      campaigns.ts        # Campaign generation logic
      workflows.ts        # Workflow generation logic
      tickets.ts          # Ticket generation logic
      orders.ts           # Order generation logic
      analytics.ts        # Analytics event generation logic
    data/
      names.ts            # Name lists
      products.ts         # Product catalog
      templates.ts        # Email template content
```

### Seeder Execution Flow

1. **Validation:** Check if demo data already exists (prevent duplicates)
2. **Organization Setup:** Create or identify the target organization
3. **Contact Generation:** Create 100 contacts with segments
4. **Campaign Generation:** Create 15 campaigns with templates
5. **Workflow Generation:** Create 8 workflows with enrollments
6. **Ticket Generation:** Create 30 tickets with messages
7. **Order Generation:** Create 80 orders linked to contacts
8. **Analytics Generation:** Create 1,500+ engagement events
9. **Verification:** Validate referential integrity and record counts
10. **Completion:** Return summary statistics

### Transaction Management

The seeder uses database transactions to ensure atomicity. If any step fails, all changes are rolled back to prevent partial data corruption.

```typescript
await db.transaction(async (tx) => {
  const contacts = await generateContacts(tx);
  const campaigns = await generateCampaigns(tx, contacts);
  const workflows = await generateWorkflows(tx, contacts);
  const tickets = await generateTickets(tx, contacts);
  const orders = await generateOrders(tx, contacts);
  const analytics = await generateAnalytics(tx, contacts, campaigns);
});
```

### Performance Optimization

- **Batch Inserts:** Use bulk insert operations (100 records per batch) instead of individual inserts
- **Lazy Loading:** Generate data on-demand rather than loading everything into memory
- **Indexing:** Ensure proper database indexes exist before seeding
- **Progress Reporting:** Emit progress events for UI feedback during long operations

Expected execution time: 10-15 seconds for complete dataset generation.

---

## User Interface Integration

### Settings Page Implementation

A new "Demo Data" section is added to the Settings page with two primary actions:

**Load Demo Data Button:**
- Prominent call-to-action with clear description
- Disabled if demo data already exists
- Shows loading spinner during generation
- Displays success message with record counts upon completion

**Reset Demo Data Button:**
- Secondary action (less prominent styling)
- Confirmation dialog before execution
- Removes all demo data and restores empty state
- Shows success message upon completion

### UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ Settings > Demo Data                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Demo Data                                                  │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Explore the platform with realistic sample data. Perfect  │
│  for testing features and learning how everything works.   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 What's Included:                                │   │
│  │  • 100 sample contacts across 6 segments           │   │
│  │  • 15 email campaigns with performance metrics     │   │
│  │  • 8 automation workflows with enrollments         │   │
│  │  • 30 support tickets with conversations           │   │
│  │  • 80 orders with realistic purchase history       │   │
│  │  • 1,500+ analytics events                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Load Demo Data]  [Reset Demo Data]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Success Message

After successful demo data loading:

```
✅ Demo data loaded successfully!

Created:
• 100 contacts
• 15 campaigns
• 8 workflows
• 30 tickets
• 80 orders

You can now explore all platform features with realistic data.
Remove demo data anytime from Settings > Demo Data.
```

---

## Testing & Validation

### Automated Tests

The seeder includes comprehensive tests to ensure data quality:

1. **Record Count Validation:** Verify exact number of records created in each table
2. **Referential Integrity:** Ensure all foreign keys reference valid records
3. **Data Range Validation:** Confirm numeric values fall within expected ranges
4. **Date Consistency:** Verify chronological order of related dates
5. **Email Format Validation:** Check email addresses match valid patterns
6. **Uniqueness Constraints:** Ensure no duplicate emails or order numbers

### Manual Verification Checklist

After running the seeder, manually verify:

- [ ] Dashboard displays correct metric counts
- [ ] Contacts page shows 100 contacts with varied segments
- [ ] Campaigns page displays 15 campaigns with realistic metrics
- [ ] Workflows page shows 8 workflows with enrollment data
- [ ] Tickets page displays 30 tickets across various statuses
- [ ] Orders page shows 80 orders with fulfillment tracking
- [ ] Analytics charts display engagement trends
- [ ] All links and navigation work correctly
- [ ] Demo data can be reset without errors

---

## Maintenance & Updates

### Keeping Demo Data Fresh

Demo data should be periodically updated to reflect:

- Current seasonal context (update campaign themes for holidays)
- Latest product trends (refresh product names and categories)
- Updated email design patterns (modernize template styling)
- New platform features (add demo data for newly launched modules)

Recommended update frequency: Quarterly

### Version Control

Demo data generation logic should be versioned to allow:

- Rollback to previous data schemas if needed
- A/B testing different demo scenarios
- Customization for different industries or use cases

---

## Future Enhancements

### Customizable Demo Scenarios

Allow users to choose from multiple demo scenarios:

- **E-commerce (Home Decor)** - Current default
- **E-commerce (Fashion)** - Clothing and accessories
- **E-commerce (Electronics)** - Tech products and gadgets
- **SaaS Business** - Software subscription model
- **Service Business** - Appointment-based services

### Localization

Generate demo data for different regions:

- International contact names and addresses
- Currency conversion for order values
- Localized email content and campaigns
- Regional holiday and seasonal campaigns

### AI-Generated Content

Use LLM to generate:

- Realistic email copy for campaigns
- Natural customer support conversations
- Product descriptions and reviews
- Blog post content for newsletters

---

## Conclusion

The demo data seeder transforms the user onboarding experience by eliminating the empty state problem and enabling immediate feature exploration. By generating a complete, realistic e-commerce business scenario with one click, the seeder reduces time-to-value from hours to seconds and dramatically increases user activation rates.

The implementation plan provides comprehensive specifications for data schemas, content generation strategies, and technical architecture, ensuring the seeder produces high-quality, realistic data that accurately represents the platform's capabilities.

---

**Document Version:** 1.0  
**Author:** Manus AI  
**Date:** January 3, 2026  
**Implementation Timeline:** 1 week  
**Priority:** Critical (Path to Monetization - Priority 1)
