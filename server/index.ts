import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { startReminderScheduler } from "./services/scheduler";
import { seedInitialResourcesIfNeeded, scheduleRssFeedRefresh } from "./services/rssFeed";
import url from 'url';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security middleware to protect against esbuild vulnerability (CVE-2023-5108)
app.use((req, res, next) => {
  // Block requests that might be targeting esbuild dev server
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname || '';
  
  // Check for paths that might be trying to exploit esbuild dev server
  const suspiciousPaths = [
    '/__es-build',
    '/__open-in-editor',
    '/esbuild',
    '/node_modules/esbuild'
  ];
  
  if (suspiciousPaths.some(p => path.startsWith(p))) {
    log(`[SECURITY] Blocked suspicious request to ${path}`);
    return res.status(403).json({ 
      error: 'Access Denied',
      message: 'This path is restricted for security reasons'
    });
  }
  
  // Block requests that might be trying to use the vulnerability to access internal content
  const suspiciousParams = [
    'loader=js',
    'loader=ts',
    'loader=jsx',
    'loader=tsx'
  ];
  const queryString = req.url.split('?')[1] || '';
  
  if (suspiciousParams.some(param => queryString.includes(param))) {
    log(`[SECURITY] Blocked suspicious query parameters: ${queryString}`);
    return res.status(403).json({
      error: 'Access Denied',
      message: 'The requested operation is not allowed'
    });
  }
  
  next();
});

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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Start the reminder scheduler for appointment notifications
    if (process.env.SENDGRID_API_KEY || process.env.TWILIO_ACCOUNT_SID) {
      startReminderScheduler();
    } else {
      log('Reminder scheduler not started: required API keys not found');
    }
    
    // Seed initial resources from RSS feeds if needed
    seedInitialResourcesIfNeeded()
      .then(() => {
        // Schedule refresh of RSS feeds every 6 hours
        scheduleRssFeedRefresh(6);
        log('RSS feed service initialized successfully');
      })
      .catch((err) => {
        log('Error initializing RSS feed service: ' + (err as Error).message);
      });
  });
})();
