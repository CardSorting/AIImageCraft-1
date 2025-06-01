/**
 * Featured Styles Carousel Component
 * Horizontal scrolling carousel with Apple's smooth interactions
 */

import { CosplayStyle } from '@/domain/entities/StyleLibrary';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Crown, Zap } from "lucide-react";

interface FeaturedStylesCarouselProps {
  styles: readonly CosplayStyle[];
  onStyleSelect: (styleId: string) => void;
}

export function FeaturedStylesCarousel({ styles, onStyleSelect }: FeaturedStylesCarouselProps) {
  const getStyleIcon = (style: CosplayStyle) => {
    if (style.isPremium()) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (style.isPopular()) return <Star className="w-5 h-5 text-blue-500" />;
    return <Zap className="w-5 h-5 text-gray-500" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap pb-4">
      <div className="flex space-x-4 p-1">
        {styles.map(style => (
          <Card
            key={style.id.value}
            className="flex-shrink-0 w-64 overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
            onClick={() => onStyleSelect(style.id.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  {getStyleIcon(style)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 line-clamp-1">{style.metadata.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {style.metadata.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge className={getDifficultyColor(style.metadata.difficulty)}>
                      {style.metadata.difficulty}
                    </Badge>
                    {style.isPremium() && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        Pro
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}