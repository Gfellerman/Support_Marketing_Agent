import { firstNames, lastNames, emailDomains, cities } from "../data/names";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { contacts, segments } from "../../../drizzle/schema";

interface ContactSegment {
  name: string;
  description: string;
  count: number;
  tags: string[];
  totalSpentRange: [number, number];
  orderCountRange: [number, number];
  lastPurchaseDaysAgo: [number, number] | null;
}

const contactSegments: ContactSegment[] = [
  {
    name: "VIP Customers",
    description: "High-value repeat buyers with $1000+ lifetime value",
    count: 15,
    tags: ["vip", "high-value"],
    totalSpentRange: [1200, 3500],
    orderCountRange: [6, 12],
    lastPurchaseDaysAgo: [0, 30]
  },
  {
    name: "Active Shoppers",
    description: "Recent purchasers (last 30 days)",
    count: 25,
    tags: ["active", "recent-buyer"],
    totalSpentRange: [200, 800],
    orderCountRange: [1, 3],
    lastPurchaseDaysAgo: [0, 30]
  },
  {
    name: "Engaged Subscribers",
    description: "Regular email openers who haven't purchased recently",
    count: 30,
    tags: ["engaged", "subscriber"],
    totalSpentRange: [0, 400],
    orderCountRange: [0, 2],
    lastPurchaseDaysAgo: null // Mix of never and 30-90 days
  },
  {
    name: "At-Risk Customers",
    description: "No purchase in 90+ days",
    count: 12,
    tags: ["at-risk", "inactive"],
    totalSpentRange: [300, 1000],
    orderCountRange: [2, 5],
    lastPurchaseDaysAgo: [90, 180]
  },
  {
    name: "Cart Abandoners",
    description: "Added to cart but didn't complete purchase",
    count: 10,
    tags: ["cart-abandoned", "high-intent"],
    totalSpentRange: [0, 300],
    orderCountRange: [0, 1],
    lastPurchaseDaysAgo: null
  },
  {
    name: "Inactive Subscribers",
    description: "No email engagement in 60+ days",
    count: 8,
    tags: ["inactive", "low-engagement"],
    totalSpentRange: [0, 200],
    orderCountRange: [0, 1],
    lastPurchaseDaysAgo: null
  }
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function weightedRandomChoice<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  
  return items[items.length - 1];
}

function generateEmail(firstName: string, lastName: string, existingEmails: Set<string>): string {
  const domain = weightedRandomChoice(emailDomains).domain;
  const formats = [
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@${domain}`,
    () => `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`
  ];
  
  let email: string;
  let attempts = 0;
  
  do {
    const format = randomChoice(formats);
    email = format();
    attempts++;
  } while (existingEmails.has(email) && attempts < 10);
  
  return email;
}

function generatePhone(): string {
  const areaCode = randomInt(200, 999);
  const prefix = randomInt(200, 999);
  const lineNumber = randomInt(1000, 9999);
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export async function generateContacts(db: MySql2Database<any>) {
  console.log("Generating contacts and segments...");
  
  const existingEmails = new Set<string>();
  const generatedContacts: any[] = [];
  
  // Create segments first
  const segmentRecords = await db.insert(segments).values(
    contactSegments.map(seg => ({
      organizationId: 1, // Demo organization
      name: seg.name,
      description: seg.description,
      conditions: {
        tags: seg.tags,
        totalSpent: seg.totalSpentRange,
        orderCount: seg.orderCountRange
      },
      contactCount: seg.count,
      isDynamic: true,
      createdAt: daysAgo(randomInt(30, 180)),
      updatedAt: new Date()
    }))
  );
  
  // Generate contacts for each segment
  for (const segment of contactSegments) {
    for (let i = 0; i < segment.count; i++) {
      const firstName = randomChoice(firstNames);
      const lastName = randomChoice(lastNames);
      const email = generateEmail(firstName, lastName, existingEmails);
      existingEmails.add(email);
      
      const city = randomChoice(cities);
      const totalSpent = randomFloat(segment.totalSpentRange[0], segment.totalSpentRange[1]);
      const orderCount = randomInt(segment.orderCountRange[0], segment.orderCountRange[1]);
      
      let lastPurchaseDate: Date | null = null;
      if (segment.lastPurchaseDaysAgo) {
        const daysAgoValue = randomInt(segment.lastPurchaseDaysAgo[0], segment.lastPurchaseDaysAgo[1]);
        lastPurchaseDate = daysAgo(daysAgoValue);
      } else if (orderCount > 0 && Math.random() > 0.5) {
        lastPurchaseDate = daysAgo(randomInt(30, 120));
      }
      
      const createdDaysAgo = randomInt(90, 540); // 3-18 months ago
      const subscriptionStatus = Math.random() > 0.05 ? "subscribed" : (Math.random() > 0.5 ? "unsubscribed" : "bounced");
      
      generatedContacts.push({
        organizationId: 1, // Demo organization
        email,
        firstName,
        lastName,
        phone: generatePhone(),
        tags: segment.tags,
        customFields: {
          city: city.name,
          state: city.state,
          zipCode: city.zip,
          birthday: `${randomInt(1, 12).toString().padStart(2, '0')}-${randomInt(1, 28).toString().padStart(2, '0')}`
        },
        subscriptionStatus,
        source: randomChoice(["website", "shopify", "woocommerce", "import"]),
        lastOrderDate: lastPurchaseDate,
        totalOrderValue: totalSpent.toFixed(2),
        orderCount,
        createdAt: daysAgo(createdDaysAgo),
        updatedAt: new Date()
      });
    }
  }
  
  // Insert all contacts
  await db.insert(contacts).values(generatedContacts);
  
  console.log(`✓ Created ${generatedContacts.length} contacts across ${contactSegments.length} segments`);
  
  return generatedContacts;
}
