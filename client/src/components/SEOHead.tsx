import { useEffect } from 'react';

interface SEOHeadProps {
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
  alternateUrls?: Array<{ hreflang: string; href: string }>;
  author?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  alternateUrls,
  author
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
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
    
    // Helper function to create/update link tags
    const updateLinkTag = (rel: string, href: string, attributes: Record<string, string> = {}) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    };
    
    // Basic SEO meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    updateMetaTag('robots', robots);
    if (author) updateMetaTag('author', author);
    
    // Open Graph meta tags
    updateMetaTag('og:title', ogTitle || title, 'property');
    updateMetaTag('og:description', ogDescription || description, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:url', canonicalUrl || window.location.href, 'property');
    updateMetaTag('og:site_name', 'Dream Bees Art', 'property');
    updateMetaTag('og:locale', 'en_US', 'property');
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage, 'property');
      updateMetaTag('og:image:alt', ogTitle || title, 'property');
      updateMetaTag('og:image:width', '1200', 'property');
      updateMetaTag('og:image:height', '630', 'property');
    }
    
    // Twitter Card meta tags
    updateMetaTag('twitter:card', twitterCard);
    updateMetaTag('twitter:site', '@dreambeesart');
    updateMetaTag('twitter:creator', '@dreambeesart');
    updateMetaTag('twitter:title', twitterTitle || ogTitle || title);
    updateMetaTag('twitter:description', twitterDescription || ogDescription || description);
    
    if (twitterImage || ogImage) {
      updateMetaTag('twitter:image', twitterImage || ogImage!);
      updateMetaTag('twitter:image:alt', twitterTitle || ogTitle || title);
    }
    
    // Additional SEO meta tags
    updateMetaTag('theme-color', '#6366f1');
    updateMetaTag('msapplication-TileColor', '#6366f1');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    updateMetaTag('apple-mobile-web-app-title', 'Dream Bees Art');
    
    // Canonical URL
    updateLinkTag('canonical', canonicalUrl || window.location.href);
    
    // Alternate language URLs
    if (alternateUrls) {
      // Remove existing alternate links
      document.querySelectorAll('link[rel="alternate"]').forEach(link => link.remove());
      
      alternateUrls.forEach(({ hreflang, href }) => {
        updateLinkTag('alternate', href, { hreflang });
      });
    }
    
    // Structured Data (JSON-LD)
    if (structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"]#seo-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
      const structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      structuredDataScript.id = 'seo-structured-data';
      structuredDataScript.textContent = JSON.stringify(structuredData);
      document.head.appendChild(structuredDataScript);
    }
    
    // Preconnect to external domains for performance
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.runware.ai'
    ];
    
    preconnectDomains.forEach(domain => {
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        if (domain.includes('gstatic')) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
    
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, ogType, twitterCard, twitterTitle, twitterDescription, twitterImage, structuredData, robots, alternateUrls, author]);

  return null;
};

// Advanced SEO utility functions
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

export const generateImageStructuredData = (image: {
  url: string;
  name: string;
  description: string;
  author?: string;
  dateCreated?: string;
  prompt?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": image.url,
    "name": image.name,
    "description": image.description,
    "creator": image.author ? {
      "@type": "Person",
      "name": image.author
    } : undefined,
    "dateCreated": image.dateCreated,
    "additionalProperty": image.prompt ? {
      "@type": "PropertyValue",
      "name": "AI Prompt",
      "value": image.prompt
    } : undefined
  };
};

export const generateModelStructuredData = (model: {
  name: string;
  description: string;
  category: string;
  provider: string;
  tags: string[];
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": model.name,
    "description": model.description,
    "applicationCategory": "AI Art Generator",
    "applicationSubCategory": model.category,
    "creator": {
      "@type": "Organization",
      "name": model.provider
    },
    "keywords": model.tags.join(', '),
    "url": model.url
  };
};