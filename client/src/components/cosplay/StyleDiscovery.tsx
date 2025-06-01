/**
 * Advanced Style Discovery Interface
 * Handles large style libraries with smart categorization, search, and recommendations
 */

import { useState, useMemo } from "react";
import { Search, Filter, TrendingUp, Heart, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  COSPLAY_STYLE_LIBRARY, 
  getPopularStyles, 
  searchStyles,
  type CosplayStyle,
  type StyleCategory 
} from "@shared/cosplayStyles";

interface StyleDiscoveryProps {
  selectedStyle: string | null;
  onStyleSelect: (styleId: string) => void;
  className?: string;
}

type ViewMode = 'featured' | 'popular' | 'search' | 'category';

export function StyleDiscovery({ 
  selectedStyle, 
  onStyleSelect,
  className = ""
}: StyleDiscoveryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Smart style organization
  const featuredCategories = COSPLAY_STYLE_LIBRARY.filter(cat => cat.featured);
  const popularStyles = getPopularStyles();
  
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchStyles(searchQuery);
  }, [searchQuery]);

  const currentStyles = useMemo(() => {
    switch (viewMode) {
      case 'featured':
        return featuredCategories.flatMap(cat => cat.styles.slice(0, 3));
      case 'popular':
        return popularStyles;
      case 'search':
        return searchResults;
      case 'category':
        const category = COSPLAY_STYLE_LIBRARY.find(cat => cat.id === selectedCategory);
        return category?.styles || [];
      default:
        return [];
    }
  }, [viewMode, selectedCategory, featuredCategories, popularStyles, searchResults]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setViewMode('search');
    } else {
      setViewMode('featured');
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewMode('category');
    setSearchQuery('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Smart Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search styles (e.g., 'superhero', 'anime', 'cyberpunk')"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-12 h-12 rounded-xl border-2 focus:border-purple-400"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <Button
          variant={viewMode === 'featured' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setViewMode('featured');
            setSearchQuery('');
          }}
          className="flex-shrink-0 rounded-xl"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Featured
        </Button>
        
        <Button
          variant={viewMode === 'popular' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setViewMode('popular');
            setSearchQuery('');
          }}
          className="flex-shrink-0 rounded-xl"
        >
          <Heart className="w-4 h-4 mr-2" />
          Popular
        </Button>

        {featuredCategories.map((category) => (
          <Button
            key={category.id}
            variant={viewMode === 'category' && selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategorySelect(category.id)}
            className="flex-shrink-0 rounded-xl"
          >
            <category.icon className="w-4 h-4 mr-2" />
            {category.shortName}
          </Button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            {viewMode === 'search' && `Search Results (${searchResults.length})`}
            {viewMode === 'featured' && 'Featured Styles'}
            {viewMode === 'popular' && 'Popular Styles'}
            {viewMode === 'category' && selectedCategory && 
              COSPLAY_STYLE_LIBRARY.find(cat => cat.id === selectedCategory)?.name
            }
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {viewMode === 'search' && searchQuery && `Showing results for "${searchQuery}"`}
            {viewMode === 'featured' && 'Handpicked styles across categories'}
            {viewMode === 'popular' && 'Most loved by the community'}
            {viewMode === 'category' && selectedCategory && 
              COSPLAY_STYLE_LIBRARY.find(cat => cat.id === selectedCategory)?.description
            }
          </p>
        </div>
      </div>

      {/* Enhanced Style Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {currentStyles.map((style) => {
          const isSelected = selectedStyle === style.id;
          const Icon = style.icon;
          
          return (
            <Card
              key={style.id}
              onClick={() => {
                onStyleSelect(style.id);
                if (navigator.vibrate) navigator.vibrate(30);
              }}
              className={`
                cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.02]
                ${isSelected
                  ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                  : 'hover:shadow-md border-2 border-transparent hover:border-purple-200'
                }
              `}
            >
              <CardContent className="p-3 space-y-2">
                {/* Badges Row */}
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
                  
                  {/* Difficulty Indicator */}
                  {style.difficulty && (
                    <div className={`w-2 h-2 rounded-full ${
                      style.difficulty === 'easy' ? 'bg-green-400' : 
                      style.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                  )}
                </div>

                {/* Icon and Selection State */}
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
                    {style.description}
                  </p>
                </div>

                {/* Tags */}
                {style.tags && style.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {style.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {currentStyles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No styles found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {viewMode === 'search' 
              ? "Try different keywords or browse our categories"
              : "No styles available in this category"
            }
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setViewMode('featured');
              setSearchQuery('');
            }}
          >
            Browse Featured Styles
          </Button>
        </div>
      )}
    </div>
  );
}