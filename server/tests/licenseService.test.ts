
import { describe, it, expect, vi, beforeEach } from "vitest";
import { licenseService } from "../services/licensing/licenseService";
import { getDb } from "../db";
import axios from "axios";

// Mock dependencies
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

vi.mock("axios");

describe("LicenseService", () => {
  const mockUpdate = vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn().mockResolvedValue(true),
    })),
  }));

  const mockSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockLimit = vi.fn();
    const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });
    mockLimit.mockResolvedValue([]);

    (getDb as any).mockResolvedValue({
      update: mockUpdate,
      select: mockSelect,
    });
  });

  it("should validate remotely valid license", async () => {
    // Mock successful remote check
    (axios.post as any).mockResolvedValue({
      data: { valid: true, plan: "enterprise" }
    });

    const result = await licenseService.validateLicense("REMOTE-VALID-KEY");
    expect(result.valid).toBe(true);
    expect(result.plan).toBe("enterprise");
    expect(axios.post).toHaveBeenCalled();
  });

  it("should fail gracefully and fallback to enterprise (dev mode)", async () => {
    // Mock network error
    (axios.post as any).mockRejectedValue(new Error("Network Error"));

    // Should fallback to local check
    const result = await licenseService.validateLicense("SMA-LOCAL-KEY");

    expect(result.valid).toBe(true);
    expect(result.plan).toBe("enterprise");
  });

  it("should return enterprise for empty key (per user request)", async () => {
    const result = await licenseService.validateLicense("");
    expect(result.valid).toBe(true);
    expect(result.plan).toBe("enterprise");
  });
});
