import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import passport from "passport";
import MemoryStore from "memorystore";
import { storage } from "./storage";

// Catch unhandled errors during startup
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const app = express();
const httpServer = createServer(app);

const SessionStore = MemoryStore(session);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// CORS support for the client dev server and Vite HMR.
// Allows credentials (cookies) to be sent cross-origin during development.
app.use((req, res, next) => {
  const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5000";
  const origin = req.headers.origin as string | undefined;

  // In development, be more permissive with CORS
  if (process.env.NODE_ENV !== "production") {
    if (origin && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
  } else {
    // Production: strict CORS
    if (origin && (allowedOrigin === "*" || origin === allowedOrigin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("[Server] Starting up...");
    await storage.seed();
    console.log("[Server] Database seeded successfully");
  } catch (error) {
    console.error("[Server] Failed to seed database:", error);
    console.error("[Server] Please ensure:");
    console.error("  1. PostgreSQL is running");
    console.error("  2. DATABASE_URL in .env is correct");
    console.error("  3. Run: npm run db:push");
    process.exit(1);
  }

  console.log("[Server] Registering API routes...");
  await registerRoutes(httpServer, app);
  console.log("[Server] API routes registered");

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    console.log("[Server] Setting up static file serving...");
    serveStatic(app);
  } else {
    console.log("[Server] Setting up Vite middleware...");
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Error handler must come AFTER all routes and Vite setup
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  
  console.log(`[Server] Starting HTTP server on port ${port}...`);
  
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
      console.log(`[Server] ✅ Server is running on port ${port}`);
    },
  );
  
  httpServer.on('error', (err: any) => {
    console.error('[Server] HTTP Server Error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] Port ${port} is already in use`);
    }
    process.exit(1);
  });
})();
