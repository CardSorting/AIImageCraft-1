/**
 * Smart Style Recommendation Engine
 * Provides personalized style suggestions based on user behavior and preferences
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CosplayStyle, COSPLAY_STYLE_LIBRARY } from "@shared/cosplayStyles";

interface StyleRecommendationsProps {
  selectedStyle: string | null;
  recentStyles?: string[];
  onStyleSelect: (styleId: string) => void;
  maxRecommendations?: number;
}

export function StyleRecommendations({
  selectedStyle,
  recentStyles = [],
  onStyleSelect,
  maxRecommendations = 6
}: StyleRecommendationsProps) {
  
  const recommendations = useMemo(() => {
    const allStyles = COSPLAY_STYLE_LIBRARY.flatMap(cat => cat.styles);
    
    // Get current style info
    const currentStyle = selectedStyle ? allStyles.find(s => s.id === selectedStyle) : null;
    
    // Score styles based on similarity and popularity
    const scoredStyles = allStyles
      .filter(style => style.id !== selectedStyle) // Exclude current selection
      .map(style => {
        let score = 0;
        
        // Boost popular styles
        if (style.popular) score += 3;
        
        // Boost styles from same category as current selection
        if (currentStyle) {
          const currentCategory = COSPLAY_STYLE_LIBRARY.find(cat => 
            cat.styles.some(s => s.id === currentStyle.id)
          );
          const styleCategory = COSPLAY_STYLE_LIBRARY.find(cat => 
            cat.styles.some(s => s.id === style.id)
          );
          
          if (currentCategory?.id === styleCategory?.id) {
            score += 2;
          }
        }
        
        // Boost styles with similar tags
        if (currentStyle?.tags && style.tags) {
          const commonTags = currentStyle.tags.filter(tag => 
            style.tags?.includes(tag)
          ).length;
          score += commonTags;
        }
        
        // Boost styles with similar difficulty
        if (currentStyle?.difficulty === style.difficulty) {
          score += 1;
        }
        
        // Penalize recently used styles
        if (recentStyles.includes(style.id)) {
          score -= 2;
        }
        
        // Add randomness for variety
        score += Math.random() * 0.5;
        
        return { style, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations)
      .map(item => item.style);
    
    return scoredStyles;
  }, [selectedStyle, recentStyles, maxRecommendations]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          You might like
        </h4>
        <Badge variant="secondary" className="text-xs">
          {recommendations.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {recommendations.map((style) => {
          const Icon = style.icon;
          
          return (
            <Card
              key={style.id}
              onClick={() => {
                onStyleSelect(style.id);
                if (navigator.vibrate) navigator.vibrate(25);
              }}
              className="cursor-pointer transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-md"
            >
              <CardContent className="p-2 text-center space-y-1">
                <div className="flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                    {style.name}
                  </p>
                  {style.popular && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      ⭐
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}