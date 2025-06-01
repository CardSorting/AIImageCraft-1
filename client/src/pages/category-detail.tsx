import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { 
  Search, ArrowLeft, Star, Crown, 
  Zap, Shield, WandSparkles, Heart, Rocket, Sword, Camera, Palette, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SEOHead } from "@/components/SEOHead";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { useToast } from "@/hooks/use-toast";

interface CosplayStyle {
  id: number;
  styleId: string;
  categoryId: string;
  name: string;
  description: string;
  iconName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  premium: boolean;
  popular: boolean;
  tags: string[];
  prompt: string;
  negativePrompt?: string;
}

interface StyleCategory {
  id: number;
  categoryId: string;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  featured: boolean;
  color: string;
}

interface StyleFilter {
  difficulty: string[];
  premium: boolean | null;
  popular: boolean | null;
}

const iconMap = {
  Crown, Star, Zap, Shield, WandSparkles, Heart, Rocket, Sword, Camera, Palette
};

export default function CategoryDetailPage() {
  const { categoryId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<StyleFilter>({
    difficulty: [],
    premium: null,
    popular: null,
  });
  const [selectedBaseStyle, setSelectedBaseStyle] = useState<CosplayStyle | null>(null);
  const [previewRandomStyle, setPreviewRandomStyle] = useState<any | null>(null);
  const limit = 12;

  // Track style usage mutation
  const trackUsage = useMutation({
    mutationFn: async (styleId: string) => {
      const response = await fetch(`/api/cosplay-styles/${styleId}/usage`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to track usage');
      return response.json();
    }
  });

  // Fetch randomizer styles for enhancement
  const { data: randomizerStyles = [] } = useQuery<any[]>({
    queryKey: ['/api/randomizer-styles'],
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Handle base style selection (visual selection only)
  const handleBaseStyleSelect = (style: CosplayStyle) => {
    setSelectedBaseStyle(style);
    setPreviewRandomStyle(null); // Reset enhancement when selecting new base
  };

  // Handle final style selection and navigation
  const handleStyleSelect = (style: CosplayStyle) => {
    // Store selection in localStorage for the AI cosplay page
    localStorage.setItem('selectedCosplayStyle', JSON.stringify({
      styleId: style.styleId,
      name: style.name,
      prompt: style.prompt,
      negativePrompt: style.negativePrompt,
      categoryId: style.categoryId,
      iconName: style.iconName,
      description: style.description
    }));
    
    // Track usage
    trackUsage.mutate(style.styleId);
    
    toast({
      title: "Style Selected!",
      description: `${style.name} has been selected for AI generation. Redirecting to the AI Cosplay page...`
    });
    
    // Navigate to AI cosplay page
    setTimeout(() => {
      setLocation(`/ai-cosplay?selectedStyle=${style.styleId}`);
    }, 1500);
  };

  // Generate random artistic enhancement
  const generateRandomStyle = () => {
    if (randomizerStyles.length > 0) {
      const randomIndex = Math.floor(Math.random() * randomizerStyles.length);
      const randomStyle = randomizerStyles[randomIndex];
      setPreviewRandomStyle(randomStyle);
    }
  };

  // Combine base style with enhancement
  const selectRandomStyle = () => {
    if (previewRandomStyle && selectedBaseStyle) {
      // Combine the selected base style with the artistic enhancement
      const combinedStyle: CosplayStyle = {
        ...selectedBaseStyle,
        styleId: `${selectedBaseStyle.styleId}-enhanced-${previewRandomStyle.styleId}`,
        name: `${selectedBaseStyle.name} + ${previewRandomStyle.name}`,
        description: `${selectedBaseStyle.description} enhanced with ${previewRandomStyle.description?.toLowerCase()}`,
        prompt: `${selectedBaseStyle.prompt || selectedBaseStyle.description} enhanced with ${previewRandomStyle.prompt}`,
        premium: selectedBaseStyle.premium || previewRandomStyle.premium || false
      };
      handleStyleSelect(combinedStyle);
    } else if (previewRandomStyle && !selectedBaseStyle) {
      // If no base style selected, just use the enhancement as the main style
      handleStyleSelect(previewRandomStyle);
    }
  };

  // Build query string for styles
  const stylesQueryString = useMemo(() => {
    const params = new URLSearchParams();
    
    // Category filter
    if (categoryId) {
      params.append('categories', categoryId);
    }
    
    // Additional filters
    if (filters.difficulty.length > 0) {
      params.append('difficulty', filters.difficulty.join(','));
    }
    if (filters.premium !== null) {
      params.append('premium', String(filters.premium));
    }
    if (filters.popular !== null) {
      params.append('popular', String(filters.popular));
    }
    if (searchQuery.trim().length > 2) {
      params.append('search', searchQuery.trim());
    }
    
    // Pagination
    params.append('page', String(page));
    params.append('limit', String(limit));
    
    return params.toString();
  }, [categoryId, filters, searchQuery, page, limit]);

  // Fetch category details
  const { data: category } = useQuery<StyleCategory>({
    queryKey: [`/api/style-categories/${categoryId}`],
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch styles for this category
  const { 
    data: stylesData, 
    isLoading: stylesLoading 
  } = useQuery<{ styles: CosplayStyle[]; total: number; totalPages: number }>({
    queryKey: ['/api/cosplay-styles', stylesQueryString],
    queryFn: async () => {
      const url = `/api/cosplay-styles${stylesQueryString ? `?${stylesQueryString}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch styles');
      }
      return response.json();
    },
    enabled: !!categoryId,
    staleTime: 30 * 1000,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Star;
    return IconComponent;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleFilterChange = (filterType: keyof StyleFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setFilters(prev => ({
      ...prev,
      difficulty: prev.difficulty.includes(difficulty)
        ? prev.difficulty.filter(d => d !== difficulty)
        : [...prev.difficulty, difficulty]
    }));
  };

  if (!category && !stylesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Category not found</h1>
            <Link href="/style-library">
              <Button className="mt-4">Browse Categories</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state with skeleton
  if (!category || stylesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 animate-pulse"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse"></div>
              <div>
                <div className="w-48 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                <div className="w-64 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar skeleton */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                    <div className="w-32 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getIcon(category.iconName);
  const styles = stylesData?.styles || [];
  const totalPages = stylesData?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SEOHead 
        title={`${category.name} Styles - AI Cosplay Generator`}
        description={`Explore ${category.name} styles: ${category.description}`}
      />
      
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/style-library">
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Style Library
            </button>
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                {category.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg sticky top-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Filters
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Search Styles
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Difficulty
                </label>
                <div className="space-y-2">
                  {['easy', 'medium', 'hard'].map((difficulty) => (
                    <label key={difficulty} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={filters.difficulty.includes(difficulty)}
                        onCheckedChange={() => handleDifficultyToggle(difficulty)}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                        {difficulty}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Premium */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Premium
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.premium === true}
                      onCheckedChange={(checked) => handleFilterChange('premium', checked ? true : null)}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Premium Only</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.premium === false}
                      onCheckedChange={(checked) => handleFilterChange('premium', checked ? false : null)}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Free Only</span>
                  </label>
                </div>
              </div>

              {/* Popular */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Popular
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={filters.popular === true}
                    onCheckedChange={(checked) => handleFilterChange('popular', checked ? true : null)}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Popular Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 dark:text-slate-400">
                {stylesData?.total || 0} styles found
              </p>
            </div>

            {/* Styles Grid */}
            {stylesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : styles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {styles.map((style) => {
                    const StyleIcon = getIcon(style.iconName);
                    const isSelected = selectedBaseStyle?.styleId === style.styleId;
                    return (
                      <Card 
                        key={style.id} 
                        className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white dark:bg-slate-800 border-0 shadow-lg ${
                          isSelected ? 'ring-2 ring-purple-500 shadow-purple-200 dark:shadow-purple-800' : ''
                        }`}
                        onClick={() => handleBaseStyleSelect(style)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <StyleIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                                {style.name}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                                {style.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getDifficultyColor(style.difficulty)} variant="secondary">
                              {style.difficulty}
                            </Badge>
                            {style.premium && (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" variant="secondary">
                                Premium
                              </Badge>
                            )}
                            {style.popular && (
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" variant="secondary">
                                Popular
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {style.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                              {style.tags.length > 2 && (
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  +{style.tags.length - 2}
                                </span>
                              )}
                            </div>
                            
                            {/* Use Style Button */}
                            {isSelected && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStyleSelect(style);
                                }}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={trackUsage.isPending}
                              >
                                {trackUsage.isPending ? "Selecting..." : "Use This Style"}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-400 px-4">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Artistic Enhancement Section */}
                {selectedBaseStyle && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Palette className="w-6 h-6 text-purple-600" />
                        <h3 className="font-semibold text-xl">Artistic Enhancement</h3>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400">
                        Enhance "{selectedBaseStyle.name}" with sophisticated artistic styles
                      </p>

                      {previewRandomStyle && (
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-purple-800 dark:text-purple-200">
                              {selectedBaseStyle.name} + {previewRandomStyle.name}
                            </p>
                            <Button
                              onClick={selectRandomStyle}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              disabled={trackUsage.isPending}
                            >
                              {trackUsage.isPending ? "Combining..." : "Combine Styles"}
                            </Button>
                          </div>
                          <p className="text-sm text-purple-600 dark:text-purple-300">
                            {selectedBaseStyle.description} enhanced with {previewRandomStyle.description?.toLowerCase()}
                          </p>
                          {previewRandomStyle.premium && (
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
                          {previewRandomStyle ? 'Try Different Enhancement' : 'Generate Artistic Enhancement'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No styles found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({ difficulty: [], premium: null, popular: null });
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}