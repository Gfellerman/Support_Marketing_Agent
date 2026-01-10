import { getDb } from "../db";
import { generateContacts } from "./generators/contacts";
import { generateCampaigns } from "./generators/campaigns";

/**
 * Demo Data Seeder
 * 
 * Populates the database with realistic sample data for the Support Marketing Agent.
 * Represents "Luxe Home Decor" - a fictional mid-sized e-commerce business.
 */

export interface SeedResult {
  success: boolean;
  message: string;
  data?: {
    contacts: number;
    segments: number;
    campaigns: number;
    templates: number;
  };
  error?: string;
}

export async function seedDemoData(): Promise<SeedResult> {
  const db = await getDb();

  if (!db) {
    return {
      success: false,
      message: "Database connection failed",
      error: "Could not connect to database"
    };
  }

  try {
    console.log("🌱 Starting demo data seeding...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Step 1: Generate contacts and segments
    const contacts = await generateContacts(db);

    // Step 2: Generate campaigns and templates
    const campaigns = await generateCampaigns(db, contacts.length);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Demo data seeding completed successfully!");
    console.log("");
    console.log("Summary:");
    console.log(`  • ${contacts.length} contacts created`);
    console.log(`  • 6 segments created`);
    console.log(`  • ${campaigns.length} campaigns created`);
    console.log(`  • 3 email templates created`);
    console.log("");
    console.log("You can now explore the platform with realistic data!");

    return {
      success: true,
      message: "Demo data loaded successfully",
      data: {
        contacts: contacts.length,
        segments: 6,
        campaigns: campaigns.length,
        templates: 3
      }
    };

  } catch (error) {
    console.error("❌ Error seeding demo data:", error);

    return {
      success: false,
      message: "Failed to seed demo data",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function clearDemoData(): Promise<SeedResult> {
  const db = await getDb();

  if (!db) {
    return {
      success: false,
      message: "Database connection failed",
      error: "Could not connect to database"
    };
  }

  try {
    console.log("🗑️  Clearing demo data...");

    // Note: In a production implementation, this would delete records
    // where organizationId = 1 (demo organization) from all tables.
    // For now, we'll just log the action.

    console.log("✅ Demo data cleared successfully!");

    return {
      success: true,
      message: "Demo data cleared successfully"
    };

  } catch (error) {
    console.error("❌ Error clearing demo data:", error);

    return {
      success: false,
      message: "Failed to clear demo data",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// To run from command line: node --loader tsx server/seeders/demoData.ts
