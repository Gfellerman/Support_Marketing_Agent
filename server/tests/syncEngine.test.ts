
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SyncEngine } from "../integrations/syncEngine";
import { ShopifyClient } from "../integrations/shopify";
import { getDb } from "../db";

// Mock database
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

// Mock Shopify Client
vi.mock("../integrations/shopify");

describe("SyncEngine", () => {
  let engine: SyncEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new SyncEngine(1, 1);
  });

  describe("syncShopifyCustomers", () => {
    it("should sync customers successfully", async () => {
      // Mock DB
      const mockInsert = vi.fn();
      const mockUpdate = vi.fn();
      const mockSet = vi.fn(() => ({ where: mockUpdate }));

      const mockDb = {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue([]), // No existing contact
            })),
          })),
        })),
        insert: vi.fn(() => ({ values: mockInsert })),
        update: vi.fn(() => ({ set: mockSet })),
      };

      (getDb as any).mockResolvedValue(mockDb);

      // Mock Client
      // The logic in syncEngine loops until customers.length < limit (250).
      // If we return 1 customer (which is < 250), it should STOP immediately after the first call.
      const mockClient = {
        getCustomers: vi.fn()
          .mockResolvedValueOnce([
            { id: 101, email: "new@example.com", firstName: "New", lastName: "User", ordersCount: 0, totalSpent: "0.00" }
          ]),
      } as any;

      const result = await engine.syncShopifyCustomers(mockClient);

      expect(result.success).toBe(true);
      expect(result.synced).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockClient.getCustomers).toHaveBeenCalledTimes(1); // Should be called ONCE because 1 < 250
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should handle existing customers by updating", async () => {
      // Mock DB to return existing contact
      const mockUpdate = vi.fn();
      const mockSet = vi.fn(() => ({ where: mockUpdate }));

      const mockDb = {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue([{ id: 5 }]), // Existing contact ID 5
            })),
          })),
        })),
        update: vi.fn(() => ({ set: mockSet })),
      };

      (getDb as any).mockResolvedValue(mockDb);

      const mockClient = {
        getCustomers: vi.fn()
          .mockResolvedValueOnce([
            { id: 102, email: "existing@example.com", firstName: "Existing", lastName: "User", ordersCount: 5, totalSpent: "500.00" }
          ]),
      } as any;

      const result = await engine.syncShopifyCustomers(mockClient);

      expect(result.synced).toBe(1);
      expect(mockUpdate).toHaveBeenCalled(); // Should update, not insert
    });
  });
});
