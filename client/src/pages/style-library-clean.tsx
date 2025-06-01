import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, Filter, Grid, List, ArrowLeft, Star, Crown, 
  Zap, Shield, WandSparkles, Heart, Rocket, Sword, Camera, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SEOHead } from "@/components/SEOHead";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

// Types
interface StyleFilter {
  categories: string[];
  difficulty: string[];
  premium: boolean | null;
  popular: boolean | null;
}

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
}

// Icon mapping
const getIconComponent = (iconName: string) => {
  const icons = {
    Star, Crown, Zap, Shield, WandSparkles, Heart, 
    Rocket, Sword, Camera, Palette, Sparkles: Star
  } as const;
  return icons[iconName as keyof typeof icons] || Star;
};

// Initial state
const createInitialFilters = (): StyleFilter => ({
  categories: [],
  difficulty: [],
  premium: null,
  popular: null,
});

export default function StyleLibraryClean() {
  const [filters, setFilters] = useState<StyleFilter>(createInitialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const limit = 12;

  // Fetch categories
  const { data: categories = [] } = useQuery<StyleCategory[]>({
    queryKey: ['/api/style-categories'],
    staleTime: 5 * 60 * 1000,
  });

  // Build query string for styles
  const stylesQueryString = useMemo(() => {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.categories.length > 0) {
      params.append('categories', filters.categories.join(','));
    }
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
    
    // Add pagination
    params.append('page', String(page));
    params.append('limit', String(limit));
    
    return params.toString();
  }, [filters, searchQuery, page, limit]);

  // Fetch styles with dynamic query
  const { 
    data: stylesData, 
    isLoading: stylesLoading, 
    error: stylesError 
  } = useQuery<{ styles: CosplayStyle[]; total: number; totalPages: number }>({
    queryKey: ['/api/cosplay-styles', stylesQueryString],
    enabled: true,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  // Filter handlers
  const handleCategoryToggle = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
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

  const handlePremiumToggle = () => {
    setFilters(prev => ({
      ...prev,
      premium: prev.premium === true ? null : true
    }));
  };

  const handlePopularToggle = () => {
    setFilters(prev => ({
      ...prev,
      popular: prev.popular === true ? null : true
    }));
  };

  const clearAllFilters = () => {
    setFilters(createInitialFilters());
    setSearchQuery("");
    setPage(1);
  };

  // Style selection handler
  const handleStyleSelect = (style: CosplayStyle) => {
    localStorage.setItem('selectedCosplayStyle', JSON.stringify(style));
    // Navigate back or show success message
  };

  if (stylesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Styles</h2>
            <p className="text-gray-600 dark:text-gray-400">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Style Library - AI Cosplay Studio"
        description="Browse our comprehensive collection of cosplay styles. Filter by category, difficulty, and popularity to find the perfect style for your AI-generated cosplay."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <NavigationHeader />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/ai-cosplay">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to AI Cosplay
                </Button>
              </Link>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Style Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Choose from our curated collection of cosplay styles
            </p>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-80">
              <div className="sticky top-4">
                <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-sm"
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search styles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
                    <div className="space-y-2">
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.iconName);
                        const isSelected = filters.categories.includes(category.categoryId);
                        
                        return (
                          <div key={category.categoryId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.categoryId}`}
                              checked={isSelected}
                              onCheckedChange={() => handleCategoryToggle(category.categoryId)}
                            />
                            <label
                              htmlFor={`category-${category.categoryId}`}
                              className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                              <IconComponent className="w-4 h-4" />
                              {category.name}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Difficulty</h4>
                    <div className="space-y-2">
                      {['easy', 'medium', 'hard'].map((difficulty) => (
                        <div key={difficulty} className="flex items-center space-x-2">
                          <Checkbox
                            id={`difficulty-${difficulty}`}
                            checked={filters.difficulty.includes(difficulty)}
                            onCheckedChange={() => handleDifficultyToggle(difficulty)}
                          />
                          <label
                            htmlFor={`difficulty-${difficulty}`}
                            className="text-sm cursor-pointer capitalize"
                          >
                            {difficulty}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Premium & Popular */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="premium"
                        checked={filters.premium === true}
                        onCheckedChange={handlePremiumToggle}
                      />
                      <label htmlFor="premium" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Premium Only
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="popular"
                        checked={filters.popular === true}
                        onCheckedChange={handlePopularToggle}
                      />
                      <label htmlFor="popular" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Star className="w-4 h-4 text-orange-500" />
                        Popular Only
                      </label>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50">
              <Button
                onClick={() => setIsFilterOpen(true)}
                className="rounded-full w-14 h-14 shadow-lg"
              >
                <Filter className="w-6 h-6" />
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stylesData?.total || 0} styles found
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {stylesLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Styles Grid */}
              {!stylesLoading && stylesData && (
                <>
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {stylesData.styles.map((style) => {
                      const IconComponent = getIconComponent(style.iconName);
                      
                      return (
                        <Card 
                          key={style.id}
                          className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                          onClick={() => handleStyleSelect(style)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                                <IconComponent className="w-6 h-6" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                                    {style.name}
                                  </h3>
                                  <div className="flex gap-1">
                                    {style.popular && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Star className="w-3 h-3 mr-1" />
                                        Popular
                                      </Badge>
                                    )}
                                    {style.premium && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Crown className="w-3 h-3 mr-1" />
                                        Premium
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                  {style.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <Badge 
                                    variant="outline" 
                                    className={`
                                      ${style.difficulty === 'easy' ? 'border-green-500 text-green-600' : ''}
                                      ${style.difficulty === 'medium' ? 'border-yellow-500 text-yellow-600' : ''}
                                      ${style.difficulty === 'hard' ? 'border-red-500 text-red-600' : ''}
                                    `}
                                  >
                                    {style.difficulty}
                                  </Badge>
                                  
                                  {style.tags.length > 0 && (
                                    <div className="flex gap-1">
                                      {style.tags.slice(0, 2).map((tag) => (
                                        <span
                                          key={tag}
                                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {stylesData.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, stylesData.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(stylesData.totalPages, prev + 1))}
                        disabled={page === stylesData.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Empty State */}
              {!stylesLoading && stylesData?.styles.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No styles found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your filters or search terms.
                  </p>
                  <Button onClick={clearAllFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}