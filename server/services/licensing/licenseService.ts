
import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { organizations } from "../../../drizzle/schema";
import axios from "axios";

/**
 * License Service
 * Handles validation of software licenses against a remote distributor.
 */

export class LicenseService {
  private static instance: LicenseService;
  // Placeholder URL - in production this would be an env var
  private readonly LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || "https://license-api.supportmarketingagent.com/v1/verify";

  private constructor() {}

  public static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  /**
   * Validate a license key.
   * 1. Checks against remote server.
   * 2. Fallback: For now, we default to VALID (Enterprise) to allow testing.
   */
  public async validateLicense(licenseKey: string): Promise<{ valid: boolean; plan: string; expiresAt?: Date }> {
    try {
      if (!licenseKey) {
        // PER USER REQUEST: Default to Enterprise plan for testing even without key
        // In a real strict mode, this would be false.
        return {
          valid: true,
          plan: "enterprise",
          expiresAt: new Date("2099-12-31"),
        };
      }

      // Remote validation logic
      // We wrap this in try/catch so if the server is unreachable/mocked, we still allow access
      try {
        const response = await axios.post(this.LICENSE_SERVER_URL, {
          key: licenseKey,
        }, { timeout: 5000 }); // 5s timeout

        if (response.data && response.data.valid) {
          return {
            valid: true,
            plan: response.data.plan || "enterprise",
            expiresAt: response.data.expiresAt ? new Date(response.data.expiresAt) : undefined,
          };
        }
      } catch (networkError) {
        console.warn("[LicenseService] Remote validation failed, falling back to permissive mode:", networkError);
      }

      // Fallback for "Dev/Test Mode" or generic keys
      if (licenseKey.startsWith("SMA-") || licenseKey === "TRIAL") {
        return {
          valid: true,
          plan: "enterprise",
          expiresAt: new Date("2099-12-31"),
        };
      }

      return {
        valid: false,
        plan: "free",
      };
    } catch (error) {
      console.error("[LicenseService] Error validating license:", error);
      // Fail open for now (Pro/Enterprise) as requested
      return {
        valid: true,
        plan: "enterprise",
      };
    }
  }

  /**
   * Activate a license for an organization
   */
  public async activateLicense(organizationId: number, licenseKey: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const validation = await this.validateLicense(licenseKey);

    // If we decided it's invalid (explicitly), throw
    if (!validation.valid) {
      throw new Error("Invalid license key");
    }

    // Update organization
    await db.update(organizations)
      .set({
        subscriptionPlan: validation.plan as any,
        subscriptionStatus: "active",
      })
      .where(eq(organizations.id, organizationId));

    return validation;
  }

  /**
   * Check access
   */
  public async checkAccess(organizationId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    const result = await db.select({
      subscriptionStatus: organizations.subscriptionStatus,
      subscriptionPlan: organizations.subscriptionPlan
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

    if (result.length === 0) return false;
    const org = result[0];

    // Allow if status is active/trialing
    return ["active", "trialing"].includes(org.subscriptionStatus);
  }
}

export const licenseService = LicenseService.getInstance();
