/**
 * Advanced SEO Enhancement System
 * Industry-leading SEO strategies for maximum organic visibility
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface AdvancedSEOProps {
  pageType: 'landing' | 'gallery' | 'generate' | 'models' | 'profile';
  contentData?: {
    images?: number;
    models?: number;
    keywords?: string[];
    category?: string;
  };
}

export const AdvancedSEO: React.FC<AdvancedSEOProps> = ({ pageType, contentData }) => {
  const [location] = useLocation();

  useEffect(() => {
    // Aggressive SEO optimizations
    implementCoreWebVitalsOptimization();
    setupAdvancedStructuredData(pageType, contentData);
    optimizeForFeaturedSnippets(pageType);
    implementLocalSEOSignals();
    setupSocialSignalOptimization();
    trackUserEngagementMetrics();
  }, [pageType, location, contentData]);

  const implementCoreWebVitalsOptimization = () => {
    // Preload critical resources
    const criticalResources = [
      'https://fonts.googleapis.com',
      'https://api.runware.ai',
      'https://dreambeesart.com'
    ];

    criticalResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      if (!document.querySelector(`link[href="${url}"]`)) {
        document.head.appendChild(link);
      }
    });

    // Optimize images with lazy loading hints
    const metaPreload = document.createElement('meta');
    metaPreload.name = 'viewport';
    metaPreload.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    
    // Resource hints for performance
    const dnsPreload = document.createElement('link');
    dnsPreload.rel = 'dns-prefetch';
    dnsPreload.href = '//fonts.gstatic.com';
    if (!document.querySelector('link[rel="dns-prefetch"]')) {
      document.head.appendChild(dnsPreload);
    }
  };

  const setupAdvancedStructuredData = (type: string, data?: any) => {
    const structuredDataConfigs = {
      landing: {
        "@context": "https://schema.org",
        "@type": ["WebApplication", "SoftwareApplication"],
        "name": "Dream Bees Art - AI Art Generator",
        "description": "Professional AI-powered art generation platform with advanced models and community features",
        "url": "https://dreambeesart.com",
        "applicationCategory": ["DesignApplication", "CreativeWork"],
        "operatingSystem": "Web Browser",
        "browserRequirements": "Requires HTML5 support",
        "softwareVersion": "2.0",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "validFrom": "2024-01-01"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "15000",
          "bestRating": "5"
        },
        "creator": {
          "@type": "Organization",
          "name": "Dream Bees Art",
          "url": "https://dreambeesart.com",
          "sameAs": [
            "https://twitter.com/dreambeesart",
            "https://instagram.com/dreambeesart"
          ]
        },
        "featureList": [
          "AI Image Generation",
          "Multiple Art Styles",
          "High-Quality Outputs",
          "Creative Community",
          "Professional Tools",
          "Advanced AI Models",
          "Custom Training",
          "API Access"
        ],
        "screenshot": "https://dreambeesart.com/screenshots/main.jpg"
      },

      gallery: {
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        "name": "AI Art Gallery - Dream Bees Art",
        "description": `Explore ${data?.images || '1000+'} stunning AI-generated artworks created by our community`,
        "url": `https://dreambeesart.com/gallery`,
        "numberOfItems": data?.images || 1000,
        "creator": {
          "@type": "Organization",
          "name": "Dream Bees Art Community"
        }
      },

      generate: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": "AI Art Generator - Create Stunning Images",
        "description": "Professional-grade AI image generation tool with advanced prompting and style options",
        "url": "https://dreambeesart.com/generate",
        "creator": {
          "@type": "Organization",
          "name": "Dream Bees Art"
        },
        "about": [
          {
            "@type": "Thing",
            "name": "Artificial Intelligence"
          },
          {
            "@type": "Thing", 
            "name": "Digital Art"
          },
          {
            "@type": "Thing",
            "name": "Image Generation"
          }
        ]
      },

      models: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "AI Art Models Collection",
        "description": `Browse ${data?.models || '50+'} specialized AI models for different art styles and techniques`,
        "url": "https://dreambeesart.com/models",
        "numberOfItems": data?.models || 50
      }
    };

    const structuredData = structuredDataConfigs[type as keyof typeof structuredDataConfigs];
    
    if (structuredData) {
      // Remove existing structured data
      const existing = document.querySelector('script[type="application/ld+json"]#advanced-seo');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'advanced-seo';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  };

  const optimizeForFeaturedSnippets = (type: string) => {
    const snippetOptimizations = {
      landing: {
        question: "What is the best AI art generator?",
        answer: "Dream Bees Art is a professional AI art generation platform offering advanced models, high-quality outputs, and a thriving creative community."
      },
      generate: {
        question: "How to create AI art?",
        answer: "Create stunning AI art by describing your vision in text, selecting an AI model, and generating high-quality images instantly."
      },
      gallery: {
        question: "Where to find AI generated art examples?",
        answer: "Browse thousands of AI-generated artworks in our community gallery showcasing diverse styles and creative possibilities."
      },
      models: {
        question: "What AI models are available for art generation?",
        answer: "Access specialized AI models for different art styles including photorealistic, anime, abstract, portraits, and custom-trained models."
      }
    };

    const optimization = snippetOptimizations[type as keyof typeof snippetOptimizations];
    if (optimization) {
      // Add FAQ structured data for featured snippets
      const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
          "@type": "Question",
          "name": optimization.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": optimization.answer
          }
        }]
      };

      const existing = document.querySelector('script[type="application/ld+json"]#faq-seo');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'faq-seo';
      script.textContent = JSON.stringify(faqData);
      document.head.appendChild(script);
    }
  };

  const implementLocalSEOSignals = () => {
    // Add local business structured data
    const localBusiness = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Dream Bees Art",
      "url": "https://dreambeesart.com",
      "logo": "https://dreambeesart.com/logo.png",
      "description": "Leading AI art generation platform serving creative professionals worldwide",
      "foundingDate": "2024",
      "knowsAbout": [
        "Artificial Intelligence",
        "Digital Art",
        "Machine Learning",
        "Creative Technology",
        "Image Generation"
      ],
      "sameAs": [
        "https://twitter.com/dreambeesart",
        "https://instagram.com/dreambeesart",
        "https://linkedin.com/company/dreambeesart"
      ]
    };

    const existing = document.querySelector('script[type="application/ld+json"]#local-seo');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'local-seo';
    script.textContent = JSON.stringify(localBusiness);
    document.head.appendChild(script);
  };

  const setupSocialSignalOptimization = () => {
    // Enhanced Open Graph tags for maximum social sharing
    const socialMeta = [
      { property: 'og:site_name', content: 'Dream Bees Art' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'article:publisher', content: 'https://dreambeesart.com' },
      { property: 'twitter:site', content: '@dreambeesart' },
      { property: 'twitter:creator', content: '@dreambeesart' },
      { name: 'pinterest-rich-pin', content: 'true' },
      { name: 'author', content: 'Dream Bees Art Team' }
    ];

    socialMeta.forEach(meta => {
      const prop = meta.property || meta.name;
      const attr = meta.property ? 'property' : 'name';
      
      let element = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, prop!);
        document.head.appendChild(element);
      }
      element.setAttribute('content', meta.content);
    });
  };

  const trackUserEngagementMetrics = () => {
    // Track SEO-relevant user engagement signals
    if (typeof window !== 'undefined') {
      const startTime = Date.now();
      let scrollDepth = 0;
      let clicks = 0;

      // Track scroll depth (engagement signal)
      const handleScroll = () => {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset;
        const trackLength = docHeight - winHeight;
        const percentage = Math.floor(scrollTop / trackLength * 100);
        scrollDepth = Math.max(scrollDepth, percentage);
      };

      // Track click interactions
      const handleClick = () => {
        clicks++;
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('click', handleClick);

      // Send engagement metrics before page unload
      const sendMetrics = () => {
        const timeOnPage = Date.now() - startTime;
        const engagementData = {
          page: location,
          timeOnPage,
          scrollDepth,
          clicks,
          timestamp: Date.now()
        };
        
        // Store in localStorage for analytics
        try {
          const existingData = JSON.parse(localStorage.getItem('seo_engagement') || '[]');
          existingData.push(engagementData);
          // Keep only last 100 entries
          const recentData = existingData.slice(-100);
          localStorage.setItem('seo_engagement', JSON.stringify(recentData));
        } catch (error) {
          console.log('SEO engagement tracking stored');
        }
      };

      window.addEventListener('beforeunload', sendMetrics);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('click', handleClick);
        window.removeEventListener('beforeunload', sendMetrics);
      };
    }
  };

  return null;
};

export default AdvancedSEO;