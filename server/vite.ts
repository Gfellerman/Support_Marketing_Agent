import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Server } from "http";
import { nanoid } from "nanoid";

// Handle both CJS (bundled) and ESM (dev) environments
const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));


export async function setupVite(app: Express, server: Server) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await import("../vite.config")).default;

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        currentDir,
        "../client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, we are in dist/index.js (from esbuild)
  // or dist/server/index.js if we keep structure.
  // The original code assumed: import.meta.dirname/../../dist/public
  // If we move to server/vite.ts and bundle to dist/index.js, __dirname will be dist/

  // Let's assume the bundle is placed at dist/index.js
  // Then public is at dist/public
  // So path.resolve(__dirname, 'public') should work if __dirname is dist/

  // However, during development (tsx watch), __dirname is server/
  // So public is at dist/public (after build:client)

  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(currentDir, "../dist/public") // relative to server/
      : path.resolve(currentDir, "public"); // relative to dist/

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
