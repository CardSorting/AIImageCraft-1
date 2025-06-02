/**
 * Comprehensive SEO Optimization Component
 * Implements granular on-page SEO based on detailed audit requirements
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { generateDynamicSEO, generateFAQSchema, generateBreadcrumbs, analyzeKeywordOpportunities } from '@/lib/advancedSEO';

interface ComprehensiveSEOProps {
  pageType: 'home' | 'gallery' | 'generate' | 'models' | 'model-detail' | 'profile';
  pageData?: {
    modelId?: string;
    modelName?: string;
    category?: string;
    imageCount?: number;
  };
  contentKeywords?: string[];
}

export const ComprehensiveSEO: React.FC<ComprehensiveSEOProps> = ({ 
  pageType, 
  pageData = {},
  contentKeywords = []
}) => {
  const [location] = useLocation();
  
  // Get real data from your database for dynamic SEO
  const { data: modelsData } = useQuery({
    queryKey: ['/api/ai-models'],
    enabled: pageType === 'models' || pageType === 'home'
  });
  
  const { data: imagesData } = useQuery({
    queryKey: ['/api/images'],
    enabled: pageType === 'gallery' || pageType === 'home'
  });
  
  const { data: modelDetail } = useQuery({
    queryKey: ['/api/models', pageData.modelId],
    enabled: pageType === 'model-detail' && !!pageData.modelId
  });

  useEffect(() => {
    implementComprehensiveSEO();
  }, [pageType, location, modelsData, imagesData, modelDetail]);

  const implementComprehensiveSEO = () => {
    // 1. Content Architecture & Structure Optimization
    setupContentStructure();
    
    // 2. Advanced Keyword Optimization with real data
    implementKeywordStrategy();
    
    // 3. HTML & Code Optimization
    optimizeHTMLElements();
    
    // 4. User Experience Signals
    enhanceUserExperience();
    
    // 5. Technical Content Elements
    addTechnicalSEOElements();
    
    // 6. Internal Link Architecture
    optimizeInternalLinking();
    
    // 7. Conversion-Focused SEO
    implementConversionOptimization();
  };

  const setupContentStructure = () => {
    // Dynamic content based on real data from your database
    const realData = {
      modelCount: Array.isArray(modelsData) ? modelsData.length : 0,
      imageCount: Array.isArray(imagesData) ? imagesData.length : 0,
      categoryData: (modelDetail as any)?.category || pageData.category
    };
    
    const seoConfig = generateDynamicSEO(pageType, realData);
    
    // Optimize title tag with keyword positioning and emotional triggers
    document.title = seoConfig.title;
    
    // Advanced meta description with CTR optimization
    updateMetaTag('description', seoConfig.description);
    updateMetaTag('keywords', seoConfig.keywords);
    
    // Enhanced robots directive for maximum crawlability
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1');
    
    // Add structured data for rich snippets
    if (seoConfig.structuredData) {
      addStructuredData(seoConfig.structuredData, 'main-content');
    }
  };

  const implementKeywordStrategy = () => {
    // LSI and semantic keyword optimization based on page type
    const semanticKeywords = getSemanticKeywords(pageType);
    const longTailKeywords = generateLongTailKeywords(pageType, modelsData, imagesData);
    
    // Add semantic keyword meta tags
    updateMetaTag('semantic-keywords', semanticKeywords.join(', '));
    
    // Implement entity optimization
    const entities = extractEntities(pageType, modelDetail);
    if (entities.length > 0) {
      updateMetaTag('entities', entities.join(', '));
    }
    
    // Search intent optimization
    const searchIntent = determineSearchIntent(pageType);
    updateMetaTag('search-intent', searchIntent);
  };

  const optimizeHTMLElements = () => {
    // Advanced Open Graph optimization with dynamic content
    const baseUrl = 'https://dreambeesart.com';
    const ogImage = generateDynamicOGImage(pageType, pageData);
    
    updateMetaTag('og:title', document.title, 'property');
    updateMetaTag('og:description', document.querySelector('meta[name="description"]')?.getAttribute('content') || '', 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:image:width', '1200', 'property');
    updateMetaTag('og:image:height', '630', 'property');
    updateMetaTag('og:image:alt', `${document.title} - Dream Bees Art`, 'property');
    updateMetaTag('og:url', `${baseUrl}${location}`, 'property');
    updateMetaTag('og:type', pageType === 'model-detail' ? 'article' : 'website', 'property');
    updateMetaTag('og:site_name', 'Dream Bees Art', 'property');
    
    // Twitter Card optimization with enhanced metadata
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@dreambeesart');
    updateMetaTag('twitter:creator', '@dreambeesart');
    updateMetaTag('twitter:title', document.title);
    updateMetaTag('twitter:description', document.querySelector('meta[name="description"]')?.getAttribute('content') || '');
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:image:alt', `${document.title} - Dream Bees Art`);
    
    // Canonical URL optimization
    updateCanonicalURL(`${baseUrl}${location}`);
    
    // Breadcrumb structured data
    const breadcrumbData = generateBreadcrumbs(location);
    addStructuredData(breadcrumbData.structuredData, 'breadcrumbs');
  };

  const enhanceUserExperience = () => {
    // Core Web Vitals optimization
    addResourceHints();
    
    // Mobile optimization meta tags
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    updateMetaTag('mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    updateMetaTag('apple-mobile-web-app-title', 'Dream Bees Art');
    
    // Theme and branding optimization
    updateMetaTag('theme-color', '#6366f1');
    updateMetaTag('msapplication-TileColor', '#6366f1');
    updateMetaTag('application-name', 'Dream Bees Art');
    
    // Performance optimization meta tags
    updateMetaTag('format-detection', 'telephone=no');
    updateMetaTag('x-dns-prefetch-control', 'on', 'http-equiv');
  };

  const addTechnicalSEOElements = () => {
    // FAQ schema for featured snippets
    const faqSchema = generateFAQSchema(pageType);
    addStructuredData(faqSchema, 'faq-schema');
    
    // Content freshness indicators
    const lastModified = new Date().toISOString();
    updateMetaTag('last-modified', lastModified);
    updateMetaTag('article:modified_time', lastModified, 'property');
    
    // Authority signals and credibility markers
    if (pageType === 'model-detail' && modelDetail) {
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${modelDetail.name} - AI Art Model`,
        "description": modelDetail.description,
        "author": {
          "@type": "Organization",
          "name": "Dream Bees Art",
          "url": "https://dreambeesart.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Dream Bees Art",
          "logo": {
            "@type": "ImageObject",
            "url": "https://dreambeesart.com/logo.png"
          }
        },
        "datePublished": lastModified,
        "dateModified": lastModified,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://dreambeesart.com${location}`
        }
      };
      addStructuredData(articleSchema, 'article-schema');
    }
    
    // Organization schema for brand authority
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Dream Bees Art",
      "url": "https://dreambeesart.com",
      "logo": "https://dreambeesart.com/logo.png",
      "description": "Professional AI art generation platform with advanced machine learning models",
      "sameAs": [
        "https://twitter.com/dreambeesart",
        "https://facebook.com/dreambeesart"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@dreambeesart.com"
      }
    };
    addStructuredData(organizationSchema, 'organization-schema');
  };

  const optimizeInternalLinking = () => {
    // Add contextual internal linking opportunities
    const internalLinks = generateInternalLinkSuggestions(pageType, modelsData);
    
    // Store link suggestions for dynamic insertion
    if (typeof window !== 'undefined') {
      window.dreamBeesInternalLinks = internalLinks;
    }
  };

  const implementConversionOptimization = () => {
    // Add conversion-focused structured data
    if (pageType === 'generate' || pageType === 'home') {
      const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "AI Art Generation",
        "description": "Professional AI-powered artwork creation service",
        "provider": {
          "@type": "Organization",
          "name": "Dream Bees Art"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "priceRange": "Free - $29.99",
          "availability": "https://schema.org/InStock"
        }
      };
      addStructuredData(serviceSchema, 'service-schema');
    }
    
    // Trust signals and social proof
    updateMetaTag('rating', 'general');
    updateMetaTag('distribution', 'global');
    updateMetaTag('classification', 'business');
  };

  // Helper functions
  const updateMetaTag = (name: string, content: string, attribute = 'name') => {
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  const addStructuredData = (data: any, id: string) => {
    const existing = document.querySelector(`script[id="${id}"]`);
    if (existing) existing.remove();
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  };

  const updateCanonicalURL = (url: string) => {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  };

  const addResourceHints = () => {
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
  };

  const getSemanticKeywords = (pageType: string) => {
    const semanticMap = {
      home: ['artificial intelligence art', 'machine learning creativity', 'digital artwork generation', 'creative AI technology', 'automated art creation'],
      gallery: ['AI artwork showcase', 'digital art collection', 'generated masterpieces', 'creative AI gallery', 'artificial art exhibition'],
      generate: ['text to image AI', 'AI art creation', 'automated artwork generation', 'creative AI tools', 'digital art production'],
      models: ['AI model collection', 'machine learning models', 'art generation algorithms', 'AI creativity models', 'digital art engines'],
      'model-detail': ['AI model specifications', 'artwork generation capabilities', 'model performance metrics', 'creative AI features']
    };
    
    return semanticMap[pageType] || semanticMap.home;
  };

  const generateLongTailKeywords = (pageType: string, models: any[], images: any[]) => {
    const modelCount = models?.length || 0;
    const imageCount = images?.length || 0;
    
    const longTailMap = {
      home: [
        `create AI art with ${modelCount} professional models`,
        `generate digital artwork from ${imageCount} style examples`,
        'best AI art generator for professional artists',
        'free AI art creation with premium features'
      ],
      gallery: [
        `browse ${imageCount} AI generated artworks`,
        'trending AI art styles and techniques',
        'community AI artwork showcase gallery'
      ],
      generate: [
        `choose from ${modelCount} AI art models`,
        'instant AI artwork generation in seconds',
        'professional quality AI art creation'
      ],
      models: [
        `compare ${modelCount} AI art generation models`,
        'best AI models for different art styles',
        'professional AI art model directory'
      ]
    };
    
    return longTailMap[pageType] || longTailMap.home;
  };

  const extractEntities = (pageType: string, modelDetail: any) => {
    const entities = ['Dream Bees Art', 'AI Art Generator', 'Digital Art Platform'];
    
    if (modelDetail) {
      entities.push(modelDetail.name, modelDetail.category);
    }
    
    return entities;
  };

  const determineSearchIntent = (pageType: string) => {
    const intentMap = {
      home: 'commercial',
      gallery: 'informational',
      generate: 'transactional',
      models: 'informational',
      'model-detail': 'informational'
    };
    
    return intentMap[pageType] || 'informational';
  };

  const generateDynamicOGImage = (pageType: string, pageData: any) => {
    const baseUrl = 'https://dreambeesart.com';
    
    if (pageType === 'model-detail' && pageData.modelName) {
      return `${baseUrl}/og-model-${pageData.modelId}.jpg`;
    }
    
    const ogImageMap = {
      home: `${baseUrl}/og-home.jpg`,
      gallery: `${baseUrl}/og-gallery.jpg`,
      generate: `${baseUrl}/og-generate.jpg`,
      models: `${baseUrl}/og-models.jpg`
    };
    
    return ogImageMap[pageType] || ogImageMap.home;
  };

  const generateInternalLinkSuggestions = (pageType: string, models: any[]) => {
    const suggestions = [];
    
    if (pageType === 'home') {
      suggestions.push(
        { text: 'explore our AI art gallery', url: '/gallery' },
        { text: 'start creating AI art', url: '/generate' },
        { text: 'browse AI models', url: '/models' }
      );
    }
    
    if (models && models.length > 0) {
      const featuredModels = models.slice(0, 3);
      featuredModels.forEach(model => {
        suggestions.push({
          text: `${model.name} AI model`,
          url: `/model/${model.id}`
        });
      });
    }
    
    return suggestions;
  };

  return null;
};

export default ComprehensiveSEO;