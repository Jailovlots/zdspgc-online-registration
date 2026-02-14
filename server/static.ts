import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // In production, vite.config.ts builds to dist/public
  // The server is bundled to dist/index.js, so __dirname is dist/
  const distPath = path.resolve(__dirname, "public");
  
  console.log(`[Static] Looking for static files at: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    console.error(`[Static] ERROR: Build directory not found: ${distPath}`);
    console.error(`[Static] Current directory: ${__dirname}`);
    console.error(`[Static] Files in directory:`, fs.readdirSync(__dirname));
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  console.log(`[Static] Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use((_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
