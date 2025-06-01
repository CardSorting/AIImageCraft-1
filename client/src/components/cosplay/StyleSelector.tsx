/**
 * Simplified Style Selector with limited cards and randomizer
 * Shows 4 cards per tab with 3 main categories plus randomizer
 */

import { useState, useMemo } from "react";
import { Shuffle, Sparkles, Palette, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface CosplayStyle {
  styleId: string;
  name: string;
  description?: string;
  categoryId?: string;
  iconName?: string;
  popular?: boolean;
  premium?: boolean;
  prompt?: string;
}

interface StyleSelectorProps {
  selectedStyle: CosplayStyle | null;
  onStyleSelect: (style: CosplayStyle) => void;
  className?: string;
}

type TabType = 'popular' | 'characters' | 'artistic';

// Artistic style combinations for randomizer
const ARTISTIC_STYLES = [
  "oil painting", "watercolor", "digital art", "pencil sketch", "charcoal drawing",
  "acrylic painting", "pastel art", "ink wash", "gouache", "colored pencil",
  "pixel art", "vector art", "concept art", "fantasy art", "portrait painting"
];

const STYLE_MODIFIERS = [
  "dramatic lighting", "soft lighting", "golden hour", "neon colors", "muted tones",
  "high contrast", "vintage filter", "cinematic", "ethereal", "bold colors",
  "minimalist", "detailed", "textured", "smooth", "atmospheric"
];

export function StyleSelector({ 
  selectedStyle, 
  onStyleSelect,
  className = ""
}: StyleSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('popular');
  const [randomizedStyle, setRandomizedStyle] = useState<string>("");

  // Fetch styles from API
  const { data: stylesResponse } = useQuery<{ styles: CosplayStyle[] }>({
    queryKey: ['/api/cosplay-styles', { limit: 20, sortBy: 'popular' }],
    enabled: true
  });

  const allStyles: CosplayStyle[] = (stylesResponse as any)?.styles || [];

  // Organize styles by category - limit to 4 per tab
  const stylesByTab = useMemo(() => {
    const popular = allStyles.filter((style: CosplayStyle) => style.popular).slice(0, 4);
    const characters = allStyles.filter((style: CosplayStyle) => 
      style.categoryId?.includes('cosplay') || 
      style.categoryId?.includes('anime') ||
      style.categoryId?.includes('movie')
    ).slice(0, 4);
    const artistic = allStyles.filter((style: CosplayStyle) => 
      style.categoryId?.includes('artistic') ||
      style.categoryId?.includes('style')
    ).slice(0, 4);

    return { popular, characters, artistic };
  }, [allStyles]);

  const generateRandomStyle = () => {
    const artistic = ARTISTIC_STYLES[Math.floor(Math.random() * ARTISTIC_STYLES.length)];
    const modifier = STYLE_MODIFIERS[Math.floor(Math.random() * STYLE_MODIFIERS.length)];
    const blend = `${artistic} style with ${modifier}`;
    
    setRandomizedStyle(blend);
    
    // Create a random style object
    const randomStyle = {
      styleId: 'random-' + Date.now(),
      name: 'Random Artistic Blend',
      description: blend,
      prompt: blend,
      categoryId: 'random',
      iconName: 'Palette',
      random: true
    };
    
    onStyleSelect(randomStyle);
  };

  const currentStyles = stylesByTab[activeTab];

  const getIconForStyle = (iconName?: string) => {
    // Return Sparkles for all since we don't have the icon mapping
    return Sparkles;
  };

  const tabs = [
    { id: 'popular' as TabType, label: 'Popular', icon: Sparkles },
    { id: 'characters' as TabType, label: 'Characters', icon: Wand2 },
    { id: 'artistic' as TabType, label: 'Artistic', icon: Palette }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-gray-700 shadow-sm' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Style Grid - Fixed 4 cards */}
      <div className="grid grid-cols-2 gap-3">
        {currentStyles.map((style) => {
          const isSelected = selectedStyle?.styleId === style.styleId;
          const Icon = getIconForStyle(style.iconName);
          
          return (
            <Card
              key={style.styleId}
              onClick={() => onStyleSelect(style)}
              className={`
                cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.02]
                ${isSelected
                  ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                  : 'hover:shadow-md border-2 border-transparent hover:border-purple-200'
                }
              `}
            >
              <CardContent className="p-3 space-y-2">
                {/* Badges */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-1">
                    {style.popular && (
                      <Badge variant="secondary" className="text-xs px-2 py-0 bg-yellow-100 text-yellow-800">
                        ⭐
                      </Badge>
                    )}
                    {style.premium && (
                      <Badge variant="secondary" className="text-xs px-2 py-0 bg-purple-100 text-purple-800">
                        👑
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center relative">
                  <Icon className={`w-8 h-8 ${
                    isSelected ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                {/* Style Info */}
                <div className="text-center space-y-1">
                  <h4 className={`font-semibold text-sm leading-tight ${
                    isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {style.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {style.description || 'Transform your photo with this style'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Randomizer Section */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Shuffle className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-lg">Style Randomizer</h3>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate unique artistic style combinations
          </p>

          {randomizedStyle && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Current Random Style:
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                {randomizedStyle}
              </p>
            </div>
          )}

          <Button
            onClick={generateRandomStyle}
            variant="outline"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Generate Random Style
          </Button>
        </div>
      </div>
    </div>
  );
}