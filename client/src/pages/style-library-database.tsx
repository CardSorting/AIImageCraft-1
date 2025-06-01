/**
 * Database-Backed Style Library Page
 * Uses API endpoints instead of hardcoded data
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Search, Filter, Grid, List, ArrowLeft, Star, Sparkles, Crown, Zap, Shield, WandSparkles, Heart, Rocket, Sword, Camera, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SEOHead } from "@/components/SEOHead";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { useToast } from "@/hooks/use-toast";
import { 
  type CosplayStyle,
  type StyleCategory
} from "@shared/schema";

interface StyleLibraryState {
  selectedCategory: string | null;
  selectedStyle: string | null;
  selectedBaseStyle: CosplayStyle | null;
  previewRandomStyle: CosplayStyle | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  recentStyles: string[];
}

const iconMap = {
  Crown,
  Shield, 
  Sparkles,
  Heart,
  WandSparkles,
  Rocket,
  Zap,
  Sword,
  Camera,
  Palette,
  Star
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Star;
};

// Custom hooks for database queries
const useStyleCategories = () => {
  return useQuery<StyleCategory[]>({
    queryKey: ['/api/style-categories'],
    enabled: true
  });
};

const useCosplayStyles = (categoryId?: string, popular?: boolean, search?: string) => {
  const params = new URLSearchParams();
  if (categoryId) params.append('categoryId', categoryId);
  if (popular) params.append('popular', 'true');
  if (search) params.append('search', search);
  
  const queryString = params.toString();
  const url = `/api/cosplay-styles${queryString ? '?' + queryString : ''}`;
  
  return useQuery<CosplayStyle[]>({
    queryKey: ['/api/cosplay-styles', categoryId, popular, search],
    enabled: true
  });
};

const useStyleUsage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (styleId: string) => {
      const response = await fetch(`/api/cosplay-styles/${styleId}/use`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to track usage');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cosplay-styles'] });
    }
  });
};

export default function StyleLibraryDatabasePage() {
  const [state, setState] = useState<StyleLibraryState>({
    selectedCategory: null,
    selectedStyle: null,
    selectedBaseStyle: null,
    previewRandomStyle: null,
    searchQuery: '',
    viewMode: 'grid',
    recentStyles: []
  });

  const { toast } = useToast();
  const [location] = useLocation();

  // Database queries
  const { data: categories = [], isLoading: categoriesLoading } = useStyleCategories();
  const { data: allStyles = [], isLoading: allStylesLoading } = useCosplayStyles();
  const { data: popularStyles = [], isLoading: popularLoading } = useCosplayStyles(undefined, true);
  const { data: searchResults = [], isLoading: searchLoading } = useCosplayStyles(
    undefined, 
    undefined, 
    state.searchQuery.length > 2 ? state.searchQuery : undefined
  );
  const { data: categoryStyles = [], isLoading: categoryStylesLoading } = useCosplayStyles(
    state.selectedCategory || undefined
  );
  
  const trackUsage = useStyleUsage();

  // Computed values
  const featuredCategories = useMemo(() => {
    return categories.filter(cat => cat.featured);
  }, [categories]);

  const displayedStyles = useMemo(() => {
    if (state.searchQuery.length > 2) {
      return searchResults;
    }
    if (state.selectedCategory) {
      return categoryStyles;
    }
    return allStyles;
  }, [state.searchQuery, state.selectedCategory, searchResults, categoryStyles, allStyles]);

  // Add randomizer styles query
  const { data: randomizerStyles = [] } = useQuery<CosplayStyle[]>({
    queryKey: ['/api/randomizer-styles'],
    enabled: true
  });

  const handleBaseStyleSelect = (style: CosplayStyle) => {
    setState(prev => ({
      ...prev,
      selectedBaseStyle: style
    }));
  };

  const handleStyleSelect = (style: CosplayStyle) => {
    setState(prev => ({
      ...prev,
      selectedStyle: style.styleId,
      recentStyles: [style.styleId, ...prev.recentStyles.filter(id => id !== style.styleId)].slice(0, 5)
    }));
    
    // Track usage
    trackUsage.mutate(style.styleId);
    
    toast({
      title: "Style Selected",
      description: `${style.name} style is ready to use!`
    });
  };

  const generateRandomStyle = () => {
    if (randomizerStyles.length > 0) {
      const randomIndex = Math.floor(Math.random() * randomizerStyles.length);
      const randomStyle = randomizerStyles[randomIndex];
      setState(prev => ({
        ...prev,
        previewRandomStyle: randomStyle
      }));
    }
  };

  const selectRandomStyle = () => {
    if (state.previewRandomStyle && state.selectedBaseStyle) {
      // Combine the selected base style with the artistic enhancement
      const combinedStyle: CosplayStyle = {
        ...state.selectedBaseStyle,
        styleId: `${state.selectedBaseStyle.styleId}-enhanced-${state.previewRandomStyle.styleId}`,
        name: `${state.selectedBaseStyle.name} + ${state.previewRandomStyle.name}`,
        description: `${state.selectedBaseStyle.description} enhanced with ${state.previewRandomStyle.description?.toLowerCase()}`,
        prompt: `${state.selectedBaseStyle.prompt || state.selectedBaseStyle.description} enhanced with ${state.previewRandomStyle.prompt}`,
        premium: state.selectedBaseStyle.premium || state.previewRandomStyle.premium || 0
      };
      handleStyleSelect(combinedStyle);
    } else if (state.previewRandomStyle && !state.selectedBaseStyle) {
      // If no base style selected, just use the enhancement as the main style
      handleStyleSelect(state.previewRandomStyle);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setState(prev => ({
      ...prev,
      selectedCategory: categoryId === prev.selectedCategory ? null : categoryId,
      searchQuery: '',
      selectedStyle: null
    }));
  };

  const handleSearch = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      selectedCategory: null,
      selectedStyle: null
    }));
  };

  const clearSelection = () => {
    setState(prev => ({
      ...prev,
      selectedCategory: null,
      selectedStyle: null,
      searchQuery: ''
    }));
  };

  const isLoading = categoriesLoading || allStylesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SEOHead 
        title="Style Library - AI Cosplay Generator"
        description="Explore our comprehensive library of cosplay styles including superheroes, anime, fantasy, and more. Choose from hundreds of professionally crafted styles."
      />
      
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Style Library
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover and choose from our curated collection of cosplay styles. From superheroes to anime characters, find the perfect transformation.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search styles..."
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={state.viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={state.viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
            >
              <List className="h-4 w-4" />
            </Button>
            {(state.selectedCategory || state.searchQuery) && (
              <Button variant="outline" size="sm" onClick={clearSelection}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading styles...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = getIconComponent(category.iconName);
                    return (
                      <Button
                        key={category.categoryId}
                        variant={state.selectedCategory === category.categoryId ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => handleCategorySelect(category.categoryId)}
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        {category.name}
                        {category.featured && <Star className="h-3 w-3 ml-auto" />}
                      </Button>
                    );
                  })}
                </div>

                {/* Popular Styles */}
                {!popularLoading && popularStyles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Popular Styles</h3>
                    <div className="space-y-2">
                      {popularStyles.slice(0, 5).map((style) => {
                        const IconComponent = getIconComponent(style.iconName);
                        return (
                          <Button
                            key={style.styleId}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm"
                            onClick={() => handleStyleSelect(style)}
                          >
                            <IconComponent className="h-3 w-3 mr-2" />
                            {style.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Breadcrumb */}
              {(state.selectedCategory || state.searchQuery) && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>Library</span>
                    {state.selectedCategory && (
                      <>
                        <span>/</span>
                        <span>{categories.find(c => c.categoryId === state.selectedCategory)?.name}</span>
                      </>
                    )}
                    {state.searchQuery && (
                      <>
                        <span>/</span>
                        <span>Search: "{state.searchQuery}"</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Styles Grid */}
              <div className={`grid gap-6 ${
                state.viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {displayedStyles.map((style) => {
                  const IconComponent = getIconComponent(style.iconName);
                  return (
                    <Card 
                      key={style.styleId} 
                      className={`group cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                        state.selectedBaseStyle?.styleId === style.styleId ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
                      }`}
                      onClick={() => handleBaseStyleSelect(style)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg truncate">{style.name}</h3>
                              {style.popular && <Star className="h-4 w-4 text-yellow-500" />}
                              {style.premium && <Sparkles className="h-4 w-4 text-purple-500" />}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                              {style.description}
                            </p>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {style.difficulty}
                              </Badge>
                              {style.usageCount && style.usageCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {style.usageCount} uses
                                </Badge>
                              )}
                            </div>

                            {style.tags && style.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {style.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Use Style Button */}
                            {state.selectedBaseStyle?.styleId === style.styleId && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStyleSelect(style);
                                }}
                                size="sm"
                                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                Use This Style
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {displayedStyles.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {state.searchQuery 
                      ? `No styles found for "${state.searchQuery}"`
                      : 'No styles available'
                    }
                  </p>
                </div>
              )}

              {/* Artistic Enhancement Section */}
              {state.selectedBaseStyle && (
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Palette className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-xl">Artistic Enhancement</h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400">
                      Enhance "{state.selectedBaseStyle.name}" with sophisticated artistic styles
                    </p>

                    {state.previewRandomStyle && (
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-purple-800 dark:text-purple-200">
                            {state.selectedBaseStyle.name} + {state.previewRandomStyle.name}
                          </p>
                          <Button
                            onClick={selectRandomStyle}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Combine Styles
                          </Button>
                        </div>
                        <p className="text-sm text-purple-600 dark:text-purple-300">
                          {state.selectedBaseStyle.description} enhanced with {state.previewRandomStyle.description?.toLowerCase()}
                        </p>
                        {state.previewRandomStyle.premium && (
                          <Badge variant="secondary" className="text-xs mt-2 bg-purple-100 text-purple-800">
                            Premium Enhancement
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={generateRandomStyle}
                        variant="outline"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {state.previewRandomStyle ? 'Try Different Enhancement' : 'Generate Artistic Enhancement'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}