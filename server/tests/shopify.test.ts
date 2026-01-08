
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShopifyClient } from "../integrations/shopify";
import axios from "axios";

// Mock axios
vi.mock("axios");

describe("ShopifyClient", () => {
  const shop = "test-shop.myshopify.com";
  const accessToken = "shpat_test_token";
  let client: ShopifyClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ShopifyClient(shop, accessToken);
  });

  describe("getCustomers", () => {
    it("should fetch customers correctly", async () => {
      const mockCustomers = [
        { id: 1, email: "test@example.com", firstName: "Test", lastName: "User" }
      ];

      (axios as any).mockResolvedValue({
        data: { customers: mockCustomers }
      });

      const customers = await client.getCustomers();

      expect(customers).toEqual(mockCustomers);
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        url: `https://${shop}/admin/api/2024-01/customers.json?limit=250`,
        headers: expect.objectContaining({
          "X-Shopify-Access-Token": accessToken
        })
      }));
    });
  });

  describe("verifyHmac", () => {
    it("should return false if hmac is missing", () => {
      expect(ShopifyClient.verifyHmac({}, "secret")).toBe(false);
    });
  });
});
