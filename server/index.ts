import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import trackingRouter from "./email/tracking";
import webhooksRouter from "./email/webhooks";
import apiRouter from "./rest-api";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Request logging middleware to debug 502 errors
  app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
  });

  // Simple health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).send("OK");
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Email tracking routes
  app.use("/api/track", trackingRouter);

  // Email webhooks
  app.use("/api/webhooks", webhooksRouter);

  // REST API for WordPress Plugin
  app.use("/api", apiRouter);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use the PORT provided by Railway, default to 3000
  const port = parseInt(process.env.PORT || "3000", 10);

  // Listen on 0.0.0.0 to accept connections from outside the container
  server.listen(port, "0.0.0.0", () => {
    const address = server.address();
    console.log(`Server running on port ${port}`);
    console.log(`Bound to address:`, address);
  });
}

startServer().catch(console.error);
