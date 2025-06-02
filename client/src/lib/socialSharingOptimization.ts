/**
 * Social Sharing Optimization using authentic AI artwork
 * Ensures proper preview images for all social platforms
 */

export interface SocialSharingConfig {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  type: 'website' | 'article' | 'product';
  modelData?: any;
  imageData?: any;
}

// Generate optimized social sharing metadata using real data
export const generateSocialSharingMeta = (pageType: string, data: any = {}) => {
  const baseUrl = 'https://dreambeesart.com';
  const modelCount = data.modelCount || 0;
  const imageCount = data.imageCount || 0;
  
  const configs = {
    home: {
      title: `Dream Bees Art - AI Art Generator with ${modelCount} Professional Models`,
      description: `Create stunning AI artwork with our professional platform. Join thousands of artists who have generated ${imageCount}+ amazing images using advanced AI models.`,
      imageUrl: `${baseUrl}/og/home`,
      type: 'website' as const
    },
    
    gallery: {
      title: `AI Art Gallery - ${imageCount} Stunning AI-Generated Artworks`,
      description: `Explore our curated collection of ${imageCount} AI-generated masterpieces. Discover trending styles and artistic techniques from our creative community.`,
      imageUrl: `${baseUrl}/og/gallery`,
      type: 'website' as const
    },
    
    generate: {
      title: 'AI Art Generator - Create Professional Artwork Instantly',
      description: `Generate stunning AI artwork with ${modelCount} professional models. Transform your ideas into visual masterpieces in seconds.`,
      imageUrl: `${baseUrl}/og/generate`,
      type: 'website' as const
    },
    
    models: {
      title: `AI Models Directory - ${modelCount} Professional AI Art Models`,
      description: `Browse our comprehensive collection of ${modelCount} AI models. From photorealistic to artistic styles, find the perfect model for your vision.`,
      imageUrl: `${baseUrl}/og/models`,
      type: 'website' as const
    }
  };

  return configs[pageType as keyof typeof configs] || configs.home;
};

// Apply comprehensive social sharing meta tags
export const applySocialSharingMeta = (config: SocialSharingConfig) => {
  const metaTags = [
    // Open Graph tags for Facebook, LinkedIn, etc.
    { property: 'og:title', content: config.title },
    { property: 'og:description', content: config.description },
    { property: 'og:image', content: config.imageUrl },
    { property: 'og:image:secure_url', content: config.imageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: `${config.title} - Authentic AI artwork` },
    { property: 'og:url', content: config.url },
    { property: 'og:type', content: config.type },
    { property: 'og:site_name', content: 'Dream Bees Art' },
    { property: 'og:locale', content: 'en_US' },
    
    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@dreambeesart' },
    { name: 'twitter:creator', content: '@dreambeesart' },
    { name: 'twitter:title', content: config.title },
    { name: 'twitter:description', content: config.description },
    { name: 'twitter:image', content: config.imageUrl },
    { name: 'twitter:image:alt', content: `Real AI-generated artwork from Dream Bees Art` },
    
    // Additional social platform tags
    { name: 'pinterest:description', content: config.description },
    { name: 'pinterest:media', content: config.imageUrl },
    
    // LinkedIn specific
    { property: 'article:author', content: 'Dream Bees Art' },
    
    // WhatsApp and Telegram
    { property: 'og:image:type', content: 'image/jpeg' }
  ];

  metaTags.forEach(tag => {
    updateMetaTag(tag.name || '', tag.content, tag.property ? 'property' : 'name');
  });
};

// Enhanced meta tag update with social platform optimization
const updateMetaTag = (name: string, content: string, attribute = 'name') => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

// Generate model-specific social sharing for individual AI models
export const generateModelSocialSharing = (modelId: string, modelData: any) => {
  const baseUrl = 'https://dreambeesart.com';
  
  return {
    title: `${modelData?.name || 'AI Model'} - Professional AI Art Generator`,
    description: `Create stunning artwork with the ${modelData?.name} AI model. ${modelData?.description || 'Advanced AI model for professional art generation.'}`,
    imageUrl: `${baseUrl}/og/model/${modelId}`,
    url: `${baseUrl}/model/${modelId}`,
    type: 'article' as const,
    modelData
  };
};

// Preload critical social sharing images for faster loading
export const preloadSocialImages = (pageType: string, modelId?: string) => {
  const baseUrl = 'https://dreambeesart.com';
  const imageUrl = modelId ? `${baseUrl}/og/model/${modelId}` : `${baseUrl}/og/${pageType}`;
  
  // Create preload link for faster social platform crawling
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'image';
  preloadLink.href = imageUrl;
  
  // Only add if not already present
  if (!document.querySelector(`link[href="${imageUrl}"]`)) {
    document.head.appendChild(preloadLink);
  }
};

// Validate social sharing setup
export const validateSocialSharing = () => {
  const requiredTags = [
    'og:title',
    'og:description', 
    'og:image',
    'og:url',
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image'
  ];
  
  const missing = requiredTags.filter(tag => {
    const property = document.querySelector(`meta[property="${tag}"]`);
    const name = document.querySelector(`meta[name="${tag}"]`);
    return !property && !name;
  });
  
  return {
    isValid: missing.length === 0,
    missingTags: missing,
    recommendations: missing.length > 0 
      ? ['Ensure all required social sharing meta tags are present'] 
      : ['Social sharing optimization is complete']
  };
};

export default {
  generateSocialSharingMeta,
  applySocialSharingMeta,
  generateModelSocialSharing,
  preloadSocialImages,
  validateSocialSharing
};