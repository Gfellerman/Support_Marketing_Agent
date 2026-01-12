import express from "express";
import { appRouter } from "./routers";
import { createContext } from "./context";

const apiRouter = express.Router();

/**
 * Middleware to validate X-SMA-API-Key
 * For now, we will verify this against a hardcoded value or environment variable
 * In a real production scenario, this should query the database (e.g., organizations table)
 */
const authenticateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.header("X-SMA-API-Key");

  if (!apiKey) {
    return res.status(401).json({ message: "API Key missing" });
  }

  // TODO: Validate against DB
  // For demo/dev purposes, allow any key starting with SMA- or verify a specific env var
  if (apiKey.startsWith("SMA-") || (process.env.SMA_API_KEY && apiKey === process.env.SMA_API_KEY)) {
    return next();
  }

  // If we want to allow the "Get your API key" flow to work with the mock server,
  // we can accept the dummy key provided in docs or just fail open for development if configured.
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  return res.status(403).json({ message: "Invalid API Key" });
};

// Health Check
apiRouter.get("/health", authenticateApiKey, (req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

// Admin Reset Endpoint - Easy access for user via browser
apiRouter.get("/admin/reset", async (req, res) => {
  const key = req.query.key as string;
  const apiKey = req.header("X-SMA-API-Key");

  // Allow if key param is correct OR if valid API header is present
  const isValidKey = key === "SMA-RESET";
  const isValidHeader = apiKey && (apiKey.startsWith("SMA-") || apiKey === process.env.SMA_API_KEY);

  // Only allow in development or with valid key
  if (!isValidKey && !isValidHeader && process.env.NODE_ENV !== 'development') {
    return res.status(403).send("Unauthorized. Use ?key=SMA-RESET");
  }

  try {
    // Create context for tRPC caller
    const ctx = await createContext({ req, res } as any);
    const caller = appRouter.createCaller(ctx);

    // Call the resetAll mutation
    const result = await caller.devReset.resetAll();

    if (result.success) {
      res.send(`
                <html>
                    <body style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; text-align: center;">
                        <h1 style="color: #10b981;">Database Reset Successful</h1>
                        <p>All users and demo data have been cleared.</p>
                        <p>You can now <a href="/" style="color: #2563eb;">return to the homepage</a> to restart the wizard.</p>
                    </body>
                </html>
            `);
    } else {
      res.status(500).send(`Error: ${result.error}`);
    }
  } catch (error: any) {
    console.error("Reset Error:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

// Tickets (Mock Data Reuse)
// Using tRPC caller would be ideal, but for simplicity in this bridge:
apiRouter.get("/tickets", authenticateApiKey, async (req, res) => {
  try {
    const caller = appRouter.createCaller(await createContext({ req, res } as any));
    const result = await caller.tickets.list({ status: "all" });
    res.json(result);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

apiRouter.post("/tickets", authenticateApiKey, async (req, res) => {
  // Mock creation
  res.json({
    id: Math.floor(Math.random() * 1000),
    ticketNumber: "TKT-" + Math.floor(Math.random() * 10000),
    status: "open"
  });
});

export default apiRouter;
