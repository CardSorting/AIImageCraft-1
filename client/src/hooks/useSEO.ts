import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: object;
  robots?: string;
}

const defaultSEO: SEOConfig = {
  title: 'Dream Bees Art - AI Art Community & Generator',
  description: 'Create stunning AI-generated artwork with advanced models. Join our community of artists and explore endless creative possibilities with cutting-edge AI image generation technology.',
  keywords: 'AI art generator, artificial intelligence art, AI image creation, digital art, creative AI, art community, machine learning art, neural network art',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
};

export const useSEO = (config?: Partial<SEOConfig>) => {
  const [location] = useLocation();
  
  useEffect(() => {
    const seoConfig = { ...defaultSEO, ...config };
    
    // Update document title
    document.title = seoConfig.title;
    
    // Helper function to update or create meta tags
    const updateMetaTag = (property: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    
    // Update basic meta tags
    updateMetaTag('description', seoConfig.description);
    if (seoConfig.keywords) updateMetaTag('keywords', seoConfig.keywords);
    updateMetaTag('robots', seoConfig.robots || 'index, follow');
    
    // Update Open Graph tags
    updateMetaTag('og:title', seoConfig.ogTitle || seoConfig.title, 'property');
    updateMetaTag('og:description', seoConfig.ogDescription || seoConfig.description, 'property');
    updateMetaTag('og:type', seoConfig.ogType || 'website', 'property');
    updateMetaTag('og:url', window.location.href, 'property');
    
    if (seoConfig.ogImage) {
      updateMetaTag('og:image', seoConfig.ogImage, 'property');
      updateMetaTag('og:image:alt', seoConfig.ogTitle || seoConfig.title, 'property');
    }
    
    // Update Twitter Card tags
    updateMetaTag('twitter:card', seoConfig.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', seoConfig.twitterTitle || seoConfig.title);
    updateMetaTag('twitter:description', seoConfig.twitterDescription || seoConfig.description);
    
    if (seoConfig.twitterImage) {
      updateMetaTag('twitter:image', seoConfig.twitterImage);
    }
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = seoConfig.canonicalUrl || window.location.href;
    
    // Add structured data
    if (seoConfig.structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
      const structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      structuredDataScript.textContent = JSON.stringify(seoConfig.structuredData);
      document.head.appendChild(structuredDataScript);
    }
  }, [config, location]);
};

// SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: 'Dream Bees Art - AI Art Generator & Creative Community',
    description: 'Transform your imagination into stunning AI-generated artwork. Join thousands of artists creating beautiful images with advanced AI models. Free to start, premium features available.',
    keywords: 'AI art generator, create AI art, artificial intelligence artwork, digital art creation, AI image generator, creative AI tools, art community',
    ogImage: '/og-home.jpg',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Dream Bees Art",
      "description": "AI-powered art generation platform",
      "url": "https://dreambeesart.com",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  },
  
  gallery: {
    title: 'AI Art Gallery - Discover Amazing AI-Generated Artwork | Dream Bees Art',
    description: 'Explore thousands of stunning AI-generated artworks created by our community. Find inspiration, discover new styles, and see what\'s possible with AI art generation.',
    keywords: 'AI art gallery, AI generated images, digital art showcase, AI artwork examples, creative AI gallery, art inspiration',
    ogType: 'website',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Dream Bees Art Gallery",
      "description": "Gallery of AI-generated artwork",
      "url": "https://dreambeesart.com/gallery"
    }
  },
  
  generate: {
    title: 'Create AI Art - Free AI Image Generator | Dream Bees Art',
    description: 'Generate stunning AI artwork from text prompts. Use advanced AI models to create unique digital art, illustrations, and images. Start creating for free today.',
    keywords: 'AI image generator, text to image, AI art creation, generate AI art, create digital art, AI artwork generator, free AI art tool',
    ogType: 'website',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": "AI Art Generator",
      "description": "Tool for generating AI artwork from text prompts",
      "url": "https://dreambeesart.com/generate"
    }
  },
  
  models: {
    title: 'AI Art Models - Explore Creative AI Styles | Dream Bees Art',
    description: 'Browse our collection of specialized AI models for different art styles. From photorealistic to anime, abstract to portraits - find the perfect AI model for your creative vision.',
    keywords: 'AI models, AI art styles, machine learning models, AI art generators, creative AI models, art style models',
    ogType: 'website',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "AI Art Models",
      "description": "Collection of AI models for art generation",
      "url": "https://dreambeesart.com/models"
    }
  },
  
  credits: {
    title: 'Dream Credits - Pricing & Plans | Dream Bees Art',
    description: 'Affordable pricing for AI art generation. Choose from flexible credit packages to fuel your creativity. Generate more art with our cost-effective credit system.',
    keywords: 'AI art pricing, dream credits, AI generation credits, art creation plans, affordable AI art',
    ogType: 'website',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Dream Credits",
      "description": "Credits for AI art generation",
      "url": "https://dreambeesart.com/credits"
    }
  }
};