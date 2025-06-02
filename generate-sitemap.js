/**
 * Static Sitemap Generator Script
 * Generates sitemap.xml file for search engines
 */

import { storage } from './server/storage.ts';
import fs from 'fs';
import path from 'path';

async function generateSitemap() {
  try {
    // Base URL for your site
    const baseUrl = process.env.AUTH0_BASE_URL || 'https://dreambeesart.com';
    
    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/generate', priority: '0.9', changefreq: 'daily' },
      { url: '/gallery', priority: '0.8', changefreq: 'daily' },
      { url: '/models', priority: '0.8', changefreq: 'weekly' },
      { url: '/credits', priority: '0.6', changefreq: 'monthly' }
    ];
    
    // Get dynamic pages from database
    const models = await storage.getAIModels(100);
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
    
    // Write sitemap to public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    
    // Enhanced robots.txt with crawl optimization
    const robotsTxt = `User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for better performance
Crawl-delay: 1

# Priority paths for crawlers
Allow: /generate
Allow: /gallery
Allow: /models
Allow: /model/`;
    
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
    
    // Copy to client public for development
    const clientPublicDir = path.join(process.cwd(), 'client', 'public');
    if (!fs.existsSync(clientPublicDir)) {
      fs.mkdirSync(clientPublicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(clientPublicDir, 'sitemap.xml'), sitemap);
    fs.writeFileSync(path.join(clientPublicDir, 'robots.txt'), robotsTxt);
    
    console.log('Sitemap generated successfully!');
    console.log(`Generated ${allPages.length} pages in sitemap.xml`);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();