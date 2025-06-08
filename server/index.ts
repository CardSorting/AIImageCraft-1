import express, { type Request, Response, NextFunction } from "express";
import { auth } from "express-openid-connect";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { 
  requestTimingMiddleware,
  smartCompressionMiddleware,
  requestDeduplicationMiddleware,
  responseCacheMiddleware,
  securityHeadersMiddleware,
  requestSizeLimiter,
  rateLimitMiddleware
} from "./middleware/performance";
import { checkDatabaseHealth } from "./db";

const app = express();

// Apply enterprise-grade performance middleware
app.use(requestTimingMiddleware);
app.use(smartCompressionMiddleware());
app.use(securityHeadersMiddleware);
app.use(requestSizeLimiter(50 * 1024 * 1024)); // 50MB limit
app.use(rateLimitMiddleware(60000, 1000)); // 1000 requests per minute
app.use(requestDeduplicationMiddleware);
app.use(responseCacheMiddleware(300000)); // 5 minute cache

// Auth0 configuration
const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL?.startsWith('http') 
  ? process.env.AUTH0_ISSUER_BASE_URL 
  : `https://${process.env.AUTH0_ISSUER_BASE_URL}`;

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: issuerBaseURL,
  session: {
    rollingDuration: 24 * 60 * 60, // 24 hours
    absoluteDuration: 7 * 24 * 60 * 60 // 7 days
  },
  routes: {
    login: '/login',
    logout: '/logout',
    callback: '/callback'
  }
};

// Debug Auth0 configuration
console.log('Auth0 Environment Variables:');
console.log('AUTH0_SECRET:', process.env.AUTH0_SECRET ? '[PRESENT]' : '[MISSING]');
console.log('AUTH0_BASE_URL:', process.env.AUTH0_BASE_URL);
console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
console.log('AUTH0_ISSUER_BASE_URL:', process.env.AUTH0_ISSUER_BASE_URL);

// Validate Auth0 configuration
if (!config.secret || !config.baseURL || !config.clientID || !config.issuerBaseURL) {
  console.error('Missing required Auth0 environment variables:');
  console.error('AUTH0_SECRET:', !!process.env.AUTH0_SECRET);
  console.error('AUTH0_BASE_URL:', !!process.env.AUTH0_BASE_URL);
  console.error('AUTH0_CLIENT_ID:', !!process.env.AUTH0_CLIENT_ID);
  console.error('AUTH0_ISSUER_BASE_URL:', !!process.env.AUTH0_ISSUER_BASE_URL);
  throw new Error('Auth0 configuration incomplete');
}

// Validate URL formats
try {
  new URL(config.issuerBaseURL);
  new URL(config.baseURL);
} catch (error) {
  console.error('Invalid URL format in Auth0 configuration:');
  console.error('issuerBaseURL:', config.issuerBaseURL);
  console.error('baseURL:', config.baseURL);
  throw new Error('Auth0 URLs must be valid URIs');
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Add debugging middleware to see what's happening with auth
app.use((req, res, next) => {
  if (req.path === '/callback' || req.path === '/login') {
    console.log('Auth Route:', req.path);
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
    console.log('Is Authenticated:', req.oidc?.isAuthenticated());
  }
  next();
});

// For Stripe webhooks, we need raw body
app.use('/webhook/stripe', express.raw({type: 'application/json'}));
app.use('/api/webhook', express.raw({type: 'application/json'}));

// Regular JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add robots.txt route
app.get("/robots.txt", (req, res) => {
  res.set('Content-Type', 'text/plain');
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://dreambeesart.com';
  res.send(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/sitemap.xml`);
});

// Add sitemap route with API prefix to avoid Vite interference
app.get("/api/sitemap.xml", async (req, res) => {
  try {
    res.set('Content-Type', 'application/xml');
    
    // Import storage here to avoid circular dependencies
    const { storage } = await import('./storage');
    
    // Base URL for your site
    const baseUrl = process.env.AUTH0_BASE_URL || 'https://dreambeesart.com';
    
    // Static pages
    const staticPages: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/generate', priority: '0.9', changefreq: 'daily' },
      { url: '/gallery', priority: '0.8', changefreq: 'daily' },
      { url: '/models', priority: '0.8', changefreq: 'weekly' },
      { url: '/credits', priority: '0.6', changefreq: 'monthly' }
    ];
    
    // Get dynamic pages from database
    const models = await storage.getAIModels(100); // Get top 100 models
    const modelPages = models.map(model => ({
      url: `/model/${model.id}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: new Date().toISOString()
    }));
    
    // Combine all pages
    const allPages = [...staticPages, ...modelPages];
    
    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;
    
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap generation failed</error>');
  }
});

// Add Stripe payment endpoint before other middleware
import Stripe from "stripe";

if (process.env.STRIPE_SECRET_KEY) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  app.post("/api/create-payment-intent", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
      console.log("STRIPE PAYMENT REQUEST:", req.body);
      const { amount, packageId } = req.body;
      
      if (!amount || !packageId) {
        return res.status(400).json({ error: "Amount and package ID are required" });
      }

      // Get authenticated user ID
      let userId = 1; // Default for testing
      if (req.oidc && req.oidc.isAuthenticated()) {
        const { getOrCreateUserFromAuth0 } = await import('./routes');
        userId = await getOrCreateUserFromAuth0(req.oidc.user);
      }

      console.log(`Creating payment intent for user ID: ${userId}`);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          packageId,
          userId: userId.toString(), // Store the authenticated user ID
          type: "dreamcredits"
        },
      });
      
      console.log("STRIPE SUCCESS:", paymentIntent.id);
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("STRIPE ERROR:", error.message);
      res.status(500).json({ 
        error: "Error creating payment intent: " + error.message 
      });
    }
  });
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
  });
})();
