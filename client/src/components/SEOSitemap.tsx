/**
 * Dynamic SEO Sitemap & Meta Optimization System
 * Aggressive SEO strategies for maximum search visibility
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SEOSitemapProps {
  enableDynamicSitemap?: boolean;
  enableRichSnippets?: boolean;
}

export const SEOSitemap: React.FC<SEOSitemapProps> = ({ 
  enableDynamicSitemap = true, 
  enableRichSnippets = true 
}) => {
  const { data: modelsData } = useQuery({
    queryKey: ['/api/v1/models/catalog'],
    enabled: enableDynamicSitemap
  });

  const { data: imagesData } = useQuery({
    queryKey: ['/api/images'],
    enabled: enableDynamicSitemap
  });

  useEffect(() => {
    if (enableDynamicSitemap) {
      generateDynamicSitemap();
    }
    
    if (enableRichSnippets) {
      implementRichSnippets();
    }

    setupAdvancedMetaTags();
    implementCriticalResourceHints();
    optimizeForVoiceSearch();
  }, [modelsData, imagesData, enableDynamicSitemap, enableRichSnippets]);

  const generateDynamicSitemap = () => {
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'weekly' },
      { url: '/generate', priority: 0.9, changefreq: 'daily' },
      { url: '/gallery', priority: 0.8, changefreq: 'daily' },
      { url: '/models', priority: 0.8, changefreq: 'weekly' },
      { url: '/credits', priority: 0.6, changefreq: 'monthly' }
    ];

    const dynamicPages = [];

    // Add model pages
    if (modelsData?.length) {
      modelsData.forEach((model: any) => {
        dynamicPages.push({
          url: `/model/${model.id}`,
          priority: 0.7,
          changefreq: 'weekly',
          lastmod: new Date().toISOString()
        });
      });
    }

    const sitemapData = {
      static: staticPages,
      dynamic: dynamicPages,
      total: staticPages.length + dynamicPages.length,
      generated: new Date().toISOString()
    };

    // Store sitemap data for server-side generation
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('seo_sitemap_data', JSON.stringify(sitemapData));
      } catch (error) {
        console.log('Sitemap data prepared for SEO optimization');
      }
    }
  };

  const implementRichSnippets = () => {
    const richSnippetSchemas = [
      // Website schema
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Dream Bees Art",
        "url": "https://dreambeesart.com",
        "description": "Professional AI art generation platform with advanced models and creative community",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://dreambeesart.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Dream Bees Art",
          "logo": {
            "@type": "ImageObject",
            "url": "https://dreambeesart.com/logo.png"
          }
        }
      },
      
      // Service schema
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "AI Art Generation Service",
        "description": "Professional AI-powered image generation with multiple artistic styles and high-quality outputs",
        "provider": {
          "@type": "Organization",
          "name": "Dream Bees Art"
        },
        "serviceType": "Digital Art Creation",
        "areaServed": "Worldwide",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "AI Art Models",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Photorealistic AI Art"
              }
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "Anime Style AI Art"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service", 
                "name": "Abstract AI Art"
              }
            }
          ]
        }
      },

      // How-to schema for featured snippets
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Create AI Art with Dream Bees Art",
        "description": "Step-by-step guide to generating stunning AI artwork using advanced AI models",
        "image": "https://dreambeesart.com/how-to-guide.jpg",
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": "0"
        },
        "supply": [
          {
            "@type": "HowToSupply",
            "name": "Creative imagination"
          },
          {
            "@type": "HowToSupply", 
            "name": "Text prompt describing your vision"
          }
        ],
        "step": [
          {
            "@type": "HowToStep",
            "name": "Write Your Prompt",
            "text": "Describe your artistic vision in detail using descriptive language",
            "image": "https://dreambeesart.com/step1.jpg"
          },
          {
            "@type": "HowToStep",
            "name": "Select AI Model",
            "text": "Choose from specialized AI models for different art styles",
            "image": "https://dreambeesart.com/step2.jpg"
          },
          {
            "@type": "HowToStep",
            "name": "Generate Artwork",
            "text": "Click generate and watch your AI artwork come to life",
            "image": "https://dreambeesart.com/step3.jpg"
          }
        ]
      }
    ];

    // Add rich snippet schemas
    richSnippetSchemas.forEach((schema, index) => {
      const existing = document.querySelector(`script[type="application/ld+json"]#rich-snippet-${index}`);
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `rich-snippet-${index}`;
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  };

  const setupAdvancedMetaTags = () => {
    const advancedMeta = [
      // Enhanced SEO meta tags
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1' },
      { name: 'bingbot', content: 'index, follow' },
      
      // Mobile optimization
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Dream Bees Art' },
      
      // Performance hints
      { 'http-equiv': 'x-dns-prefetch-control', content: 'on' },
      { name: 'format-detection', content: 'telephone=no' },
      
      // Security headers
      { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
      { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
      
      // Rich media
      { name: 'application-name', content: 'Dream Bees Art' },
      { name: 'msapplication-TileColor', content: '#6366f1' },
      { name: 'theme-color', content: '#6366f1' },
      
      // Geographic targeting
      { name: 'geo.region', content: 'US' },
      { name: 'geo.placename', content: 'United States' },
      { name: 'ICBM', content: '40.7589, -73.9851' },
      
      // Content classification
      { name: 'rating', content: 'general' },
      { name: 'distribution', content: 'global' },
      { name: 'language', content: 'en' },
      { name: 'revisit-after', content: '1 days' }
    ];

    advancedMeta.forEach(meta => {
      const attr = meta['http-equiv'] ? 'http-equiv' : 'name';
      const value = meta['http-equiv'] || meta.name;
      
      let element = document.querySelector(`meta[${attr}="${value}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value!);
        document.head.appendChild(element);
      }
      element.setAttribute('content', meta.content);
    });
  };

  const implementCriticalResourceHints = () => {
    const resourceHints = [
      // DNS prefetch for external domains
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
      { rel: 'dns-prefetch', href: '//api.runware.ai' },
      
      // Preconnect to critical origins
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      
      // Preload critical resources
      { rel: 'preload', href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
      { rel: 'preload', href: '/images/hero-bg.webp', as: 'image' }
    ];

    resourceHints.forEach(hint => {
      const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.as) link.setAttribute('as', hint.as);
        if (hint.type) link.type = hint.type;
        if (hint.crossorigin) link.crossOrigin = hint.crossorigin === true ? 'anonymous' : hint.crossorigin;
        document.head.appendChild(link);
      }
    });
  };

  const optimizeForVoiceSearch = () => {
    // Voice search optimization with natural language patterns
    const voiceSearchSchemas = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I create AI art?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "To create AI art, simply describe your vision in the prompt box, select an AI model, and click generate. Dream Bees Art will create stunning artwork in seconds."
          }
        },
        {
          "@type": "Question", 
          "name": "What is the best AI art generator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dream Bees Art is a leading AI art generator offering professional-grade models, high-quality outputs, and an active creative community."
          }
        },
        {
          "@type": "Question",
          "name": "Is AI art generation free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Dream Bees Art offers free AI art generation with credits. Additional premium features and models are available with subscription plans."
          }
        },
        {
          "@type": "Question",
          "name": "How long does AI art generation take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI art generation typically takes 10-30 seconds depending on the complexity and model selected. Most images are ready in under a minute."
          }
        }
      ]
    };

    const existing = document.querySelector('script[type="application/ld+json"]#voice-search-faq');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'voice-search-faq';
    script.textContent = JSON.stringify(voiceSearchSchemas);
    document.head.appendChild(script);
  };

  return null;
};

export default SEOSitemap;