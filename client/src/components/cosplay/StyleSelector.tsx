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

interface RandomizerStyle {
  id: number;
  styleId: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  subCategory: string;
  tags: string[];
  complexity: string;
  rarity: string;
  rating: string;
  usageCount: number;
}

interface StyleSelectorProps {
  selectedStyle: CosplayStyle | null;
  onStyleSelect: (style: CosplayStyle) => void;
  className?: string;
}

type TabType = 'popular' | 'characters';

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
  const [previewRandomStyle, setPreviewRandomStyle] = useState<CosplayStyle | null>(null);

  // Fetch styles from API
  const { data: stylesResponse } = useQuery<{ styles: CosplayStyle[] }>({
    queryKey: ['/api/cosplay-styles', { limit: 20, sortBy: 'popular' }],
    enabled: true
  });

  // Fetch random style from the sophisticated randomizer styles database
  const { data: randomStyleData, refetch: fetchNewRandomStyle } = useQuery<RandomizerStyle>({
    queryKey: ['/api/randomizer-styles/random'],
    enabled: false // Only fetch when explicitly called
  });

  const allStyles: CosplayStyle[] = (stylesResponse as any)?.styles || [];

  // Create fixed style cards for demonstration - 4 per tab (now 2 tabs)
  const stylesByTab = useMemo(() => {
    const popular: CosplayStyle[] = [
      { styleId: 'superhero', name: 'Superhero', description: 'Classic comic book hero', categoryId: 'popular', popular: true, iconName: 'Sparkles' },
      { styleId: 'anime-character', name: 'Anime Character', description: 'Japanese animation style', categoryId: 'popular', popular: true, iconName: 'Sparkles' },
      { styleId: 'fantasy-warrior', name: 'Fantasy Warrior', description: 'Epic battle-ready hero', categoryId: 'popular', popular: true, iconName: 'Sparkles' },
      { styleId: 'sci-fi-explorer', name: 'Sci-Fi Explorer', description: 'Futuristic space adventure', categoryId: 'popular', popular: true, iconName: 'Sparkles' }
    ];
    
    const characters: CosplayStyle[] = [
      { styleId: 'disney-princess', name: 'Disney Princess', description: 'Fairy tale royalty', categoryId: 'characters', iconName: 'Sparkles' },
      { styleId: 'marvel-hero', name: 'Marvel Hero', description: 'Cinematic universe hero', categoryId: 'characters', iconName: 'Sparkles' },
      { styleId: 'anime-protagonist', name: 'Anime Protagonist', description: 'Main character energy', categoryId: 'characters', iconName: 'Sparkles' },
      { styleId: 'video-game-warrior', name: 'Video Game Warrior', description: 'Gaming legend character', categoryId: 'characters', iconName: 'Sparkles' }
    ];

    return { popular, characters };
  }, []);

  const generateRandomStyle = async () => {
    try {
      // Fetch a sophisticated randomizer style from the database
      const result = await fetchNewRandomStyle();
      
      if (result.data) {
        const randomizerStyle = result.data;
        
        // Convert RandomizerStyle to CosplayStyle format for compatibility
        const randomStyle: CosplayStyle = {
          styleId: randomizerStyle.styleId,
          name: randomizerStyle.name,
          description: randomizerStyle.description,
          prompt: randomizerStyle.prompt,
          categoryId: 'randomizer',
          iconName: 'Shuffle',
          popular: false,
          premium: randomizerStyle.rarity === 'legendary' || randomizerStyle.rarity === 'epic'
        };
        
        setRandomizedStyle(randomizerStyle.prompt);
        setPreviewRandomStyle(randomStyle);
      }
    } catch (error) {
      console.error('Error fetching random style:', error);
      // Fallback to basic random generation if API fails
      const fallbackStyle = {
        styleId: 'random-' + Date.now(),
        name: 'Random Style',
        description: 'A unique artistic combination',
        prompt: 'artistic style with creative elements',
        categoryId: 'random',
        iconName: 'Shuffle',
        popular: false,
        premium: false
      };
      setPreviewRandomStyle(fallbackStyle);
    }
  };

  const selectRandomStyle = () => {
    if (previewRandomStyle && selectedStyle) {
      // Combine the selected base style with the artistic enhancement
      const combinedStyle: CosplayStyle = {
        styleId: `${selectedStyle.styleId}-enhanced-${previewRandomStyle.styleId}`,
        name: `${selectedStyle.name} + ${previewRandomStyle.name}`,
        description: `${selectedStyle.description} enhanced with ${previewRandomStyle.description?.toLowerCase()}`,
        prompt: `${selectedStyle.prompt || selectedStyle.description} enhanced with ${previewRandomStyle.prompt}`,
        categoryId: selectedStyle.categoryId,
        iconName: selectedStyle.iconName,
        popular: selectedStyle.popular,
        premium: selectedStyle.premium || previewRandomStyle.premium
      };
      onStyleSelect(combinedStyle);
    } else if (previewRandomStyle && !selectedStyle) {
      // If no base style selected, just use the enhancement as the main style
      onStyleSelect(previewRandomStyle);
    }
  };

  const currentStyles = stylesByTab[activeTab];

  const getIconForStyle = (iconName?: string) => {
    // Return Sparkles for all since we don't have the icon mapping
    return Sparkles;
  };

  const tabs = [
    { id: 'popular' as TabType, label: 'Popular', icon: Sparkles },
    { id: 'characters' as TabType, label: 'Characters', icon: Wand2 }
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
          const Icon = getIconForStyle(style.iconName || 'Sparkles');
          
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

      {/* Artistic Enhancement Section */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-lg">Artistic Enhancement</h3>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedStyle 
              ? `Enhance "${selectedStyle.name}" with sophisticated artistic styles`
              : "Select a style above, then add artistic enhancement"
            }
          </p>

          {previewRandomStyle && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  {selectedStyle?.name && `${selectedStyle.name} + `}{previewRandomStyle.name}
                </p>
                <Button
                  onClick={selectRandomStyle}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={!selectedStyle}
                >
                  {selectedStyle ? 'Combine Styles' : 'Select Base Style First'}
                </Button>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-300">
                {selectedStyle 
                  ? `${selectedStyle.description} enhanced with ${previewRandomStyle.description?.toLowerCase()}`
                  : previewRandomStyle.description
                }
              </p>
              {previewRandomStyle.premium && (
                <Badge variant="secondary" className="text-xs mt-2 bg-purple-100 text-purple-800">
                  Premium Enhancement
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={generateRandomStyle}
              variant="outline"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              {previewRandomStyle ? 'Try Different Enhancement' : 'Generate Artistic Enhancement'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}