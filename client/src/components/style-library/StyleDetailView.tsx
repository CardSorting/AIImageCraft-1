/**
 * Style Detail View Component
 * Detailed view of a single cosplay style with Apple's attention to detail
 */

import { CosplayStyle } from '@/domain/entities/StyleLibrary';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Crown, Zap, Sparkles, ArrowLeft, Share2 } from "lucide-react";

interface StyleDetailViewProps {
  style: CosplayStyle;
  onSelect: (styleId: string) => void;
  onBack: () => void;
}

export function StyleDetailView({ style, onSelect, onBack }: StyleDetailViewProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStyleIcon = () => {
    if (style.isPremium()) return <Crown className="w-8 h-8 text-yellow-500" />;
    if (style.isPopular()) return <Star className="w-8 h-8 text-blue-500" />;
    return <Zap className="w-8 h-8 text-gray-500" />;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${style.metadata.name} - Cosplay Style`,
          text: style.metadata.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-white hover:bg-white/20 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20 rounded-xl"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  {getStyleIcon()}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{style.metadata.name}</h1>
                <p className="text-lg opacity-90 mb-4">{style.metadata.description}</p>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge className={getDifficultyColor(style.metadata.difficulty)}>
                    {style.metadata.difficulty}
                  </Badge>
                  {style.isPremium() && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      Premium
                    </Badge>
                  )}
                  {style.isPopular() && (
                    <Badge className="bg-white/20 text-white backdrop-blur-sm">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Style Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Style Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Difficulty Level
                    </h3>
                    <Badge className={getDifficultyColor(style.metadata.difficulty)}>
                      {style.metadata.difficulty.charAt(0).toUpperCase() + style.metadata.difficulty.slice(1)}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Popularity Score
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${style.metadata.popularity * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(style.metadata.popularity * 100)}%
                      </span>
                    </div>
                  </div>

                  {style.metadata.tags.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {style.metadata.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">AI Prompt</h2>
                <ScrollArea className="h-64 w-full rounded-lg border bg-gray-50 dark:bg-gray-900 p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-green-600 dark:text-green-400 mb-2">
                        Positive Prompt
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {style.prompt.positive}
                      </p>
                    </div>
                    
                    {style.prompt.negative && (
                      <div>
                        <h4 className="font-medium text-sm text-red-600 dark:text-red-400 mb-2">
                          Negative Prompt
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {style.prompt.negative}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={() => onSelect(style.id.value)}
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Use This Style
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}