/**
 * Production-only server entry point.
 * This file is specifically designed for Railway deployment,
 * avoiding any development dependencies (Vite, TailwindCSS, etc.)
 */
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./context";
import trackingRouter from "./email/tracking";
import webhooksRouter from "./email/webhooks";
import apiRouter from "./rest-api";

// In production bundle, __dirname is the bundle directory (dist/)
const distDir = typeof __dirname !== 'undefined'
    ? __dirname
    : process.cwd();

const publicDir = path.join(distDir, "public");

console.log("[STARTUP] Production server initializing...");
console.log(`[STARTUP] distDir: ${distDir}`);
console.log(`[STARTUP] publicDir: ${publicDir}`);
console.log(`[STARTUP] publicDir exists: ${fs.existsSync(publicDir)}`);

async function startServer() {
    console.log("[STARTUP] startServer() called at", new Date().toISOString());

    // Heartbeat to verify process is alive
    let heartbeatCount = 0;
    setInterval(() => {
        heartbeatCount++;
        console.log(`[HEARTBEAT] Process alive - count: ${heartbeatCount}, memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    }, 10000);

    const app = express();
    const server = createServer(app);

    // Global error handler for uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.error('[FATAL] Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Request logging - FIRST middleware
    app.use((req, res, next) => {
        console.log(`[REQUEST] ${req.method} ${req.url}`);
        next();
    });

    // Health check - Railway requires this
    app.get("/health", (_req, res) => {
        res.status(200).send("OK");
    });

    // Simple root test endpoint (before static files)
    app.get("/api/ping", (_req, res) => {
        res.json({ status: "pong", timestamp: new Date().toISOString() });
    });

    // Body parsers
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    // API routes
    app.use("/api/track", trackingRouter);
    app.use("/api/webhooks", webhooksRouter);
    app.use("/api", apiRouter);

    // tRPC API
    app.use(
        "/api/trpc",
        createExpressMiddleware({
            router: appRouter,
            createContext,
        })
    );

    // Static file serving (production only)
    if (fs.existsSync(publicDir)) {
        console.log(`[STATIC] Serving static files from: ${publicDir}`);
        app.use(express.static(publicDir));

        // SPA fallback - send index.html for all non-API routes
        const indexPath = path.join(publicDir, "index.html");
        if (fs.existsSync(indexPath)) {
            app.get("*", (_req, res) => {
                res.sendFile(indexPath);
            });
        } else {
            console.warn(`[STATIC] index.html not found at: ${indexPath}`);
        }
    } else {
        console.error(`[STATIC] Public directory not found: ${publicDir}`);
        // Fallback: send a simple message
        app.get("*", (_req, res) => {
            res.status(503).send("Server is starting, static files not found.");
        });
    }

    // Error handling middleware
    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error('[EXPRESS_ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    // Railway target port is configured to 3000
    const port = 3000;

    server.listen(port, "0.0.0.0", () => {
        console.log(`[SERVER] Running on http://0.0.0.0:${port}`);
        console.log(`[SERVER] Health check: http://0.0.0.0:${port}/health`);
    });

    server.on("error", (error) => {
        console.error("[SERVER_ERROR]", error);
    });
}

startServer().catch((error) => {
    console.error("[STARTUP_ERROR] Failed to start server:", error);
    process.exit(1);
});
