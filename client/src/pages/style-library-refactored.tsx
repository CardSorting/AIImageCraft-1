/**
 * Refactored AI Cosplay Page with Separated Style Library
 * Clean Architecture implementation following Apple's design principles
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Search, Filter, Grid, List, ArrowLeft, Star, Sparkles, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SEOHead } from "@/components/SEOHead";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { useToast } from "@/hooks/use-toast";
import { 
  type CosplayStyle as DatabaseCosplayStyle,
  type StyleCategory as DatabaseStyleCategory
} from "@shared/schema";

interface StyleLibraryState {
  selectedCategory: string | null;
  selectedStyle: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  recentStyles: string[];
}

export default function StyleLibraryRefactoredPage() {
  const { categoryId, styleId } = useParams<{ categoryId?: string; styleId?: string }>();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [recentStyles, setRecentStyles] = useState<string[]>([]);
  const { toast } = useToast();

  // Get user profile for authentication
  const { data: profile } = useQuery({
    queryKey: ['/api/auth/profile'],
  });

  // Derived state
  const currentCategory = useMemo(() => {
    return categoryId ? getCategoryById(categoryId) : null;
  }, [categoryId]);

  const currentStyle = useMemo(() => {
    return styleId ? getStyleById(styleId) : null;
  }, [styleId]);

  const featuredCategories = useMemo(() => {
    return getFeaturedCategories();
  }, []);

  const popularStylesList = useMemo(() => {
    return getPopularStyles();
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchStyles(searchQuery);
  }, [searchQuery]);

  // Handle style selection
  const handleStyleSelect = (selectedStyleId: string) => {
    // Update recent styles
    const updatedRecent = [selectedStyleId, ...recentStyles.filter(id => id !== selectedStyleId)].slice(0, 10);
    setRecentStyles(updatedRecent);
    
    // Navigate to AI cosplay with selected style
    navigate(`/ai-cosplay?style=${selectedStyleId}`);
  };

  // Handle navigation
  const handleCategorySelect = (selectedCategoryId: string) => {
    navigate(`/style-library/${selectedCategoryId}`);
  };

  const handleBackNavigation = () => {
    if (styleId && categoryId) {
      navigate(`/style-library/${categoryId}`);
    } else if (categoryId) {
      navigate('/style-library');
    } else {
      navigate('/ai-cosplay');
    }
  };

  // Utility functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStyleIcon = (style: CosplayStyle) => {
    if (style.premium) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (style.popular) return <Star className="w-4 h-4 text-blue-500" />;
    return <Zap className="w-4 h-4 text-gray-500" />;
  };

  // SEO metadata
  const pageTitle = currentStyle 
    ? `${currentStyle.name} - Style Library`
    : currentCategory 
    ? `${currentCategory.name} Styles - Library`
    : 'Style Library - Discover Cosplay Styles';

  const pageDescription = currentStyle
    ? `Transform into ${currentStyle.name}. ${currentStyle.description}`
    : currentCategory
    ? `Explore ${currentCategory.name} cosplay styles. ${currentCategory.description}`
    : 'Discover thousands of cosplay styles from movies, TV shows, anime, and more. Find the perfect character transformation.';

  // Render style detail view
  if (currentStyle) {
    return (
      <>
        <SEOHead title={pageTitle} description={pageDescription} />
        
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
          <NavigationHeader />
          
          <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
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
                          onClick={handleBackNavigation}
                          className="text-white hover:bg-white/20 rounded-xl"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      </div>

                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          {getStyleIcon(currentStyle)}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{currentStyle.name}</h1>
                        <p className="text-lg opacity-90 mb-4">{currentStyle.description}</p>
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge className={getDifficultyColor(currentStyle.difficulty || 'medium')}>
                            {currentStyle.difficulty || 'medium'}
                          </Badge>
                          {currentStyle.premium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              Premium
                            </Badge>
                          )}
                          {currentStyle.popular && (
                            <Badge className="bg-white/20 text-white backdrop-blur-sm">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-8 text-center">
                    <Button
                      onClick={() => handleStyleSelect(currentStyle.id)}
                      size="lg"
                      className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Use This Style
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title={pageTitle} description={pageDescription} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
        <NavigationHeader />
        
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {categoryId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackNavigation}
                  className="p-2 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentCategory ? currentCategory.name : 'Style Library'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentCategory 
                    ? `${currentCategory.styles.length} available styles`
                    : 'Discover your perfect cosplay transformation'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2 rounded-xl"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search styles, characters, or themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 rounded-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            />
          </div>

          {/* Content */}
          {searchQuery ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Search Results for "{searchQuery}" ({searchResults.length} found)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map(style => (
                  <Card
                    key={style.id}
                    className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                    onClick={() => handleStyleSelect(style.id)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {getStyleIcon(style)}
                        </div>
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{style.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {style.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : currentCategory ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentCategory.styles.map(style => (
                <Card
                  key={style.id}
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                  onClick={() => handleStyleSelect(style.id)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {getStyleIcon(style)}
                      </div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{style.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {style.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured Styles */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Popular Styles</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {popularStylesList.slice(0, 6).map(style => (
                    <Card
                      key={style.id}
                      className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                      onClick={() => handleStyleSelect(style.id)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {getStyleIcon(style)}
                          </div>
                          <h3 className="font-medium text-xs line-clamp-2">{style.name}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Categories */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredCategories.map(category => (
                    <Card
                      key={category.id}
                      className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-xl">
                              {category.name.includes('Royal') ? '👑' : 
                               category.name.includes('Anime') ? '⚡' : 
                               category.name.includes('Fantasy') ? '🔮' : '⭐'}
                            </span>
                          </div>
                          <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {category.styles.length} styles
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}