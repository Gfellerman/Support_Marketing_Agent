
import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { organizations } from "../../../drizzle/schema";

const REMOTE_LICENSE_SERVER = 'https://swisswpsecure.com/api/validate-license';

export class LicenseService {
  private static instance: LicenseService;

  private constructor() {}

  public static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  public async validateLicense(licenseKey: string): Promise<{ valid: boolean; plan: string; expiresAt?: Date }> {
    try {
      const response = await fetch(REMOTE_LICENSE_SERVER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey,
          product: 'support-marketing-agent'
        })
      });

      const data = await response.json();

      if (data.valid) {
        return {
          valid: true,
          plan: data.plan, // 'enterprise', 'pro', 'starter'
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
        };
      }

      return { valid: false, plan: "free" };
    } catch (error) {
      console.error('License validation error:', error);
      // Dev fallback
      if (process.env.NODE_ENV === 'development') {
        return { valid: true, plan: 'enterprise' };
      }
      return { valid: false, plan: "free" };
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
