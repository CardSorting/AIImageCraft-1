/**
 * Content-focused SEO Analysis using authentic database data
 * Implements granular on-page optimization requirements
 */

// Content Architecture Analysis
export const analyzeContentStructure = (content: string, pageData: any) => {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);
  const avgParagraphLength = sentences.length / Math.max(paragraphs.length, 1);
  
  // Transition words analysis for content flow
  const transitionWords = [
    'however', 'therefore', 'furthermore', 'moreover', 'additionally', 
    'consequently', 'meanwhile', 'subsequently', 'nevertheless', 'in addition',
    'for example', 'specifically', 'in particular', 'notably', 'especially'
  ];
  
  const foundTransitions = transitionWords.filter(word => 
    content.toLowerCase().includes(word.toLowerCase())
  );
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgSentenceLength: Math.round(avgSentenceLength),
    avgParagraphLength: Math.round(avgParagraphLength),
    transitionWordsFound: foundTransitions.length,
    readabilityScore: calculateReadabilityScore(avgSentenceLength, words.length),
    contentDensity: calculateContentDensity(content),
    recommendations: generateContentRecommendations(avgSentenceLength, paragraphs.length, foundTransitions.length)
  };
};

// Advanced keyword analysis with primary keyword positioning
export const analyzeKeywordOptimization = (content: string, primaryKeyword: string, pageType: string) => {
  const contentLower = content.toLowerCase();
  const keywordLower = primaryKeyword.toLowerCase();
  
  // Primary keyword placement analysis
  const firstOccurrence = contentLower.indexOf(keywordLower);
  const inFirst100Words = content.substring(0, 500).toLowerCase().includes(keywordLower);
  
  // Keyword density calculation
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const keywordMatches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
  const keywordDensity = (keywordMatches / words.length) * 100;
  
  // LSI keyword opportunities based on page type
  const lsiKeywords = generateLSIKeywords(pageType);
  const foundLSI = lsiKeywords.filter(keyword => 
    contentLower.includes(keyword.toLowerCase())
  );
  
  // Long-tail keyword opportunities
  const longTailOpportunities = generateLongTailKeywords(pageType, primaryKeyword);
  const foundLongTail = longTailOpportunities.filter(keyword =>
    contentLower.includes(keyword.toLowerCase())
  );
  
  return {
    primaryKeyword,
    keywordDensity: Math.round(keywordDensity * 100) / 100,
    firstOccurrence,
    inFirst100Words,
    totalOccurrences: keywordMatches,
    lsiKeywordsFound: foundLSI.length,
    lsiKeywordsMissing: lsiKeywords.filter(k => !foundLSI.includes(k)),
    longTailFound: foundLongTail.length,
    longTailOpportunities: longTailOpportunities.filter(k => !foundLongTail.includes(k)),
    searchIntent: determineSearchIntent(pageType),
    recommendations: generateKeywordRecommendations(keywordDensity, inFirst100Words, foundLSI.length)
  };
};

// HTML structure optimization analysis
export const analyzeHTMLStructure = (pageType: string, modelCount: number, imageCount: number) => {
  const currentTitle = document.title;
  const currentDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  
  // Title tag optimization with emotional triggers
  const emotionalTriggers = ['stunning', 'professional', 'instant', 'amazing', 'creative', 'powerful'];
  const titleHasEmotionalTrigger = emotionalTriggers.some(trigger => 
    currentTitle.toLowerCase().includes(trigger)
  );
  
  // Meta description CTR optimization
  const descriptionLength = currentDescription.length;
  const hasCallToAction = /\b(create|generate|explore|discover|start|try)\b/i.test(currentDescription);
  
  // Header hierarchy analysis
  const headers = {
    h1: document.querySelectorAll('h1').length,
    h2: document.querySelectorAll('h2').length,
    h3: document.querySelectorAll('h3').length,
    h4: document.querySelectorAll('h4').length
  };
  
  return {
    titleLength: currentTitle.length,
    titleHasEmotionalTrigger,
    titleOptimal: currentTitle.length >= 30 && currentTitle.length <= 60,
    descriptionLength,
    descriptionOptimal: descriptionLength >= 120 && descriptionLength <= 155,
    hasCallToAction,
    headerStructure: headers,
    headerHierarchyValid: headers.h1 === 1,
    dataIntegrity: {
      usesRealModelCount: currentTitle.includes(modelCount.toString()) || currentDescription.includes(modelCount.toString()),
      usesRealImageCount: currentTitle.includes(imageCount.toString()) || currentDescription.includes(imageCount.toString())
    },
    recommendations: generateHTMLRecommendations(currentTitle, currentDescription, headers, modelCount, imageCount)
  };
};

// User experience signals analysis
export const analyzeUserExperience = () => {
  const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
  const themeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute('content') || '';
  const mobileOptimized = viewport.includes('width=device-width');
  
  // Core Web Vitals preparation
  const hasPreconnect = document.querySelectorAll('link[rel="preconnect"]').length > 0;
  const hasPreload = document.querySelectorAll('link[rel="preload"]').length > 0;
  
  // Content formatting analysis
  const contentElements = {
    lists: document.querySelectorAll('ul, ol').length,
    images: document.querySelectorAll('img').length,
    buttons: document.querySelectorAll('button').length,
    forms: document.querySelectorAll('form').length
  };
  
  return {
    mobileOptimized,
    hasThemeColor: !!themeColor,
    hasPreconnect,
    hasPreload,
    contentElements,
    accessibilityFeatures: {
      altTexts: document.querySelectorAll('img[alt]').length,
      ariaLabels: document.querySelectorAll('[aria-label]').length,
      skipLinks: document.querySelectorAll('a[href="#main"], a[href="#content"]').length
    },
    recommendations: generateUXRecommendations(mobileOptimized, hasPreconnect, contentElements)
  };
};

// Internal linking opportunities based on real content
export const analyzeInternalLinking = (content: string, models: any[], images: any[]) => {
  const opportunities = [];
  
  // AI model linking opportunities
  if (Array.isArray(models)) {
    models.slice(0, 10).forEach(model => {
      if (model.name && content.toLowerCase().includes(model.name.toLowerCase())) {
        opportunities.push({
          type: 'model',
          keyword: model.name,
          suggestedUrl: `/model/${model.id}`,
          context: `Link to ${model.name} model page`,
          priority: 'high'
        });
      }
    });
  }
  
  // Category-based linking
  const categories = ['portrait', 'landscape', 'anime', 'abstract', 'photorealistic'];
  categories.forEach(category => {
    if (content.toLowerCase().includes(category)) {
      opportunities.push({
        type: 'category',
        keyword: category,
        suggestedUrl: `/models?category=${category}`,
        context: `Link to ${category} category`,
        priority: 'medium'
      });
    }
  });
  
  // Navigation linking
  const navKeywords = {
    'gallery': '/gallery',
    'generate': '/generate',
    'create art': '/generate',
    'ai models': '/models',
    'browse models': '/models'
  };
  
  Object.entries(navKeywords).forEach(([keyword, url]) => {
    if (content.toLowerCase().includes(keyword)) {
      opportunities.push({
        type: 'navigation',
        keyword,
        suggestedUrl: url,
        context: `Internal navigation link`,
        priority: 'medium'
      });
    }
  });
  
  return {
    totalOpportunities: opportunities.length,
    highPriority: opportunities.filter(o => o.priority === 'high').length,
    opportunities: opportunities.slice(0, 15), // Limit to top 15
    recommendations: generateLinkingRecommendations(opportunities.length)
  };
};

// Helper functions
const calculateReadabilityScore = (avgSentenceLength: number, wordCount: number) => {
  let score = 100;
  
  // Sentence length penalty
  if (avgSentenceLength > 20) score -= 15;
  if (avgSentenceLength > 30) score -= 25;
  
  // Content length bonus
  if (wordCount > 300) score += 5;
  if (wordCount > 600) score += 10;
  
  return Math.max(0, Math.min(100, score));
};

const calculateContentDensity = (content: string) => {
  const totalChars = content.length;
  const meaningfulChars = content.replace(/\s+/g, '').length;
  return Math.round((meaningfulChars / totalChars) * 100);
};

const generateLSIKeywords = (pageType: string) => {
  const lsiMap: Record<string, string[]> = {
    home: ['artificial intelligence', 'machine learning', 'digital creativity', 'automated design', 'neural networks'],
    generate: ['text to image', 'prompt engineering', 'creative AI', 'image synthesis', 'artistic generation'],
    gallery: ['digital artwork', 'AI creativity', 'generated masterpieces', 'artistic showcase', 'creative community'],
    models: ['neural networks', 'deep learning', 'AI algorithms', 'model architecture', 'training data']
  };
  
  return lsiMap[pageType] || lsiMap.home;
};

const generateLongTailKeywords = (pageType: string, primaryKeyword: string) => {
  const templates = [
    `how to use ${primaryKeyword}`,
    `best ${primaryKeyword} for beginners`,
    `professional ${primaryKeyword} techniques`,
    `${primaryKeyword} tips and tricks`,
    `advanced ${primaryKeyword} features`
  ];
  
  return templates;
};

const determineSearchIntent = (pageType: string) => {
  const intentMap: Record<string, string> = {
    home: 'commercial',
    generate: 'transactional',
    gallery: 'informational',
    models: 'informational'
  };
  
  return intentMap[pageType] || 'informational';
};

const generateContentRecommendations = (avgSentenceLength: number, paragraphCount: number, transitionWords: number) => {
  const recommendations = [];
  
  if (avgSentenceLength > 25) {
    recommendations.push('Break down long sentences for better readability');
  }
  
  if (paragraphCount < 4) {
    recommendations.push('Add more paragraph breaks to improve content structure');
  }
  
  if (transitionWords < 3) {
    recommendations.push('Add more transition words to improve content flow');
  }
  
  return recommendations;
};

const generateKeywordRecommendations = (density: number, inFirst100: boolean, lsiCount: number) => {
  const recommendations = [];
  
  if (density < 0.5) {
    recommendations.push('Increase primary keyword usage - density is too low');
  } else if (density > 3) {
    recommendations.push('Reduce keyword density to avoid over-optimization');
  }
  
  if (!inFirst100) {
    recommendations.push('Include primary keyword in the first 100 words');
  }
  
  if (lsiCount < 3) {
    recommendations.push('Add more LSI keywords to improve semantic relevance');
  }
  
  return recommendations;
};

const generateHTMLRecommendations = (title: string, description: string, headers: any, modelCount: number, imageCount: number) => {
  const recommendations = [];
  
  if (title.length < 30 || title.length > 60) {
    recommendations.push('Optimize title length to 30-60 characters');
  }
  
  if (description.length < 120 || description.length > 155) {
    recommendations.push('Optimize meta description to 120-155 characters');
  }
  
  if (headers.h1 !== 1) {
    recommendations.push('Use exactly one H1 tag per page');
  }
  
  if (!title.includes(modelCount.toString()) && !description.includes(modelCount.toString())) {
    recommendations.push(`Include real model count (${modelCount}) in title or description for authenticity`);
  }
  
  return recommendations;
};

const generateUXRecommendations = (mobileOptimized: boolean, hasPreconnect: boolean, contentElements: any) => {
  const recommendations = [];
  
  if (!mobileOptimized) {
    recommendations.push('Add proper viewport meta tag for mobile optimization');
  }
  
  if (!hasPreconnect) {
    recommendations.push('Add preconnect links for critical resources');
  }
  
  if (contentElements.images > 0 && contentElements.images > document.querySelectorAll('img[alt]').length) {
    recommendations.push('Add alt text to all images for accessibility');
  }
  
  return recommendations;
};

const generateLinkingRecommendations = (opportunityCount: number) => {
  const recommendations = [];
  
  if (opportunityCount < 3) {
    recommendations.push('Add more internal links to improve site navigation');
  } else if (opportunityCount > 10) {
    recommendations.push('Consider reducing internal links to avoid over-optimization');
  }
  
  recommendations.push('Use descriptive anchor text for internal links');
  recommendations.push('Link to relevant model and category pages');
  
  return recommendations;
};

export default {
  analyzeContentStructure,
  analyzeKeywordOptimization,
  analyzeHTMLStructure,
  analyzeUserExperience,
  analyzeInternalLinking
};