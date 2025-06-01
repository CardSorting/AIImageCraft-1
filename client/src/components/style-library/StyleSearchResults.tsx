/**
 * Style Search Results Component
 * Displays search results with Apple's search design patterns
 */

import { CosplayStyle } from '@/domain/entities/StyleLibrary';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Zap, Search } from "lucide-react";

interface StyleSearchResultsProps {
  results: readonly CosplayStyle[];
  query: string;
  viewMode: 'grid' | 'list';
  onStyleSelect: (styleId: string) => void;
}

export function StyleSearchResults({ results, query, viewMode, onStyleSelect }: StyleSearchResultsProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStyleIcon = (style: CosplayStyle) => {
    if (style.isPremium()) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (style.isPopular()) return <Star className="w-4 h-4 text-blue-500" />;
    return <Zap className="w-4 h-4 text-gray-500" />;
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No styles found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search terms or browse our categories
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Search Results for "{query}"
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Found {results.length} matching style{results.length !== 1 ? 's' : ''}
        </p>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-3">
          {results.map(style => (
            <Card
              key={style.id.value}
              className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              onClick={() => onStyleSelect(style.id.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {getStyleIcon(style)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">
                        {highlightText(style.metadata.name, query)}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {highlightText(style.metadata.description, query)}
                      </p>
                      {style.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {style.metadata.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs text-blue-600 dark:text-blue-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(style.metadata.difficulty)}>
                      {style.metadata.difficulty}
                    </Badge>
                    {style.isPremium() && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map(style => (
            <Card
              key={style.id.value}
              className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              onClick={() => onStyleSelect(style.id.value)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {getStyleIcon(style)}
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">
                    {highlightText(style.metadata.name, query)}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {highlightText(style.metadata.description, query)}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}