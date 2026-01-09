import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import apiRouter from "./rest-api";

// Mock tRPC router context
vi.mock("../routers", () => ({
  appRouter: {
    createCaller: () => ({
      tickets: {
        list: async () => [{ id: 1, title: "Test Ticket" }],
      },
    }),
  },
}));

// Mock Context
vi.mock("./_core/context", () => ({
  createContext: () => ({}),
}));

const app = express();
app.use(express.json());
app.use("/api", apiRouter);

describe("REST API", () => {
  it("should return 401 if API Key is missing", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(401);
  });

  it("should return 200 for health check with valid key", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("X-SMA-API-Key", "SMA-TEST");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", version: "1.0.0" });
  });

  it("should return tickets with valid key", async () => {
    const response = await request(app)
      .get("/api/tickets")
      .set("X-SMA-API-Key", "SMA-TEST");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
