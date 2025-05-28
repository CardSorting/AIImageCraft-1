/**
 * Advanced SEO Optimization Utilities
 * Industry-leading SEO strategies for maximum organic visibility
 */

export interface SEOAnalytics {
  pageViews: number;
  bounceRate: number;
  avgTimeOnPage: number;
  searchQueries: string[];
}

export interface SEOPerformanceMetrics {
  coreWebVitals: {
    LCP: number; // Largest Contentful Paint
    FID: number; // First Input Delay
    CLS: number; // Cumulative Layout Shift
  };
  seoScore: number;
  rankingKeywords: string[];
}

// Advanced keyword optimization
export const generateSEOKeywords = (content: string, category: string): string[] => {
  const baseKeywords = {
    ai_art: [
      'AI art generator', 'artificial intelligence art', 'AI image creation',
      'machine learning art', 'neural network art', 'AI artwork generator',
      'digital art AI', 'creative AI tools', 'AI art community'
    ],
    gallery: [
      'AI art gallery', 'AI generated images', 'digital art showcase',
      'AI artwork examples', 'creative AI gallery', 'art inspiration',
      'AI art collection', 'generated artwork display'
    ],
    models: [
      'AI models', 'AI art styles', 'machine learning models',
      'AI art generators', 'creative AI models', 'art style models',
      'AI training models', 'specialized AI art'
    ],
    generate: [
      'create AI art', 'generate AI images', 'text to image',
      'AI art creation', 'make AI artwork', 'AI image generator',
      'prompt to art', 'AI art maker'
    ]
  };

  const categoryKeywords = baseKeywords[category as keyof typeof baseKeywords] || [];
  
  // Extract relevant keywords from content
  const contentKeywords = content
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5);

  return [...categoryKeywords, ...contentKeywords].slice(0, 15);
};

// Generate structured data for different content types
export const generateArticleStructuredData = (article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  imageUrl?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "datePublished": article.datePublished,
  "publisher": {
    "@type": "Organization",
    "name": "Dream Bees Art",
    "logo": {
      "@type": "ImageObject",
      "url": "https://dreambeesart.com/logo.png"
    }
  },
  "image": article.imageUrl ? {
    "@type": "ImageObject",
    "url": article.imageUrl
  } : undefined
});

// Advanced meta tag optimization
export const optimizeMetaTags = (pageData: {
  title: string;
  description: string;
  keywords: string[];
  category: string;
}) => {
  const { title, description, keywords, category } = pageData;
  
  // Title optimization (55-60 characters ideal)
  const optimizedTitle = title.length > 60 
    ? `${title.substring(0, 57)}...` 
    : title;

  // Description optimization (150-160 characters ideal)
  const optimizedDescription = description.length > 160
    ? `${description.substring(0, 157)}...`
    : description;

  // Long-tail keyword generation
  const longTailKeywords = generateLongTailKeywords(keywords, category);

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: [...keywords, ...longTailKeywords].join(', '),
    canonicalUrl: window.location.href,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1'
  };
};

const generateLongTailKeywords = (baseKeywords: string[], category: string): string[] => {
  const modifiers = {
    ai_art: ['free', 'online', 'best', 'professional', 'high quality'],
    gallery: ['stunning', 'amazing', 'beautiful', 'creative', 'inspiring'],
    models: ['advanced', 'specialized', 'powerful', 'cutting-edge', 'innovative'],
    generate: ['easy', 'fast', 'instant', 'professional', 'high-resolution']
  };

  const categoryModifiers = modifiers[category as keyof typeof modifiers] || ['best', 'free'];
  
  return baseKeywords
    .slice(0, 3)
    .flatMap(keyword => 
      categoryModifiers.map(modifier => `${modifier} ${keyword}`)
    )
    .slice(0, 8);
};

// SEO performance tracking
export const trackSEOMetrics = (pageType: string, userInteraction: string) => {
  // Track user engagement for SEO signals
  if (typeof window !== 'undefined') {
    const startTime = performance.now();
    
    // Track time on page
    window.addEventListener('beforeunload', () => {
      const timeOnPage = performance.now() - startTime;
      console.log(`SEO Metrics - ${pageType}: ${timeOnPage}ms`);
    });

    // Track scroll depth for engagement
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercent);
    });
  }
};

// FAQ structured data for rich snippets
export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Breadcrumb optimization
export const generateBreadcrumbs = (path: string) => {
  const pathSegments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', url: '/' }];
  
  let currentPath = '';
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ name, url: currentPath });
  });
  
  return breadcrumbs;
};

export default {
  generateSEOKeywords,
  optimizeMetaTags,
  trackSEOMetrics,
  generateFAQStructuredData,
  generateBreadcrumbs,
  generateArticleStructuredData
};