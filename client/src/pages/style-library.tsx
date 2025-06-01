/**
 * Style Library - Clean Architecture Implementation
 * Following SOLID principles, DDD, Clean Architecture, and CQRS patterns
 * Inspired by Apple's Design and Development Philosophy
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Search, Filter, Grid, List, ArrowLeft, Star, Sparkles, Crown, 
  Zap, Shield, WandSparkles, Heart, Rocket, Sword, Camera, 
  Palette, ChevronLeft, ChevronRight, X, Check
} from "lucide-react";
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

// Domain Models
interface StyleFilter {
  categories: string[];
  difficulty: string[];
  premium: boolean | null;
  popular: boolean | null;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

interface StyleLibraryState {
  searchQuery: string;
  viewMode: 'grid' | 'list';
  filters: StyleFilter;
  pagination: PaginationState;
  selectedStyle: string | null;
}

// Icon mapping for dynamic icon rendering
const iconMap = {
  Crown, Shield, Sparkles, Heart, WandSparkles, Rocket,
  Zap, Sword, Camera, Palette, Star
};

// Pure Functions - Apple's functional programming approach
const getIconComponent = (iconName: string) => 
  iconMap[iconName as keyof typeof iconMap] || Star;

const createInitialState = (): StyleLibraryState => ({
  searchQuery: '',
  viewMode: 'grid',
  filters: {
    categories: [],
    difficulty: [],
    premium: null,
    popular: null
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0
  },
  selectedStyle: null
});

// Data Access Layer - Repository Pattern
const useStyleCategories = () => {
  return useQuery<StyleCategory[]>({
    queryKey: ['/api/style-categories'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useCosplayStyles = (filters: StyleFilter, search: string, page: number, limit: number) => {
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filters.categories.length) params.append('categories', filters.categories.join(','));
    if (filters.difficulty.length) params.append('difficulty', filters.difficulty.join(','));
    if (filters.premium !== null) params.append('premium', String(filters.premium));
    if (filters.popular !== null) params.append('popular', String(filters.popular));
    params.append('page', String(page));
    params.append('limit', String(limit));
    return params.toString();
  }, [filters, search, page, limit]);

  return useQuery<{ styles: CosplayStyle[]; total: number }>({
    queryKey: ['/api/cosplay-styles', queryParams],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Command Handlers - CQRS Pattern
const useStyleSelection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (styleData: CosplayStyle) => {
      // Store in localStorage for persistence
      localStorage.setItem('selectedCosplayStyle', JSON.stringify(styleData));
      
      // Track usage
      await fetch(`/api/cosplay-styles/${styleData.styleId}/use`, {
        method: 'POST'
      });
      
      return styleData;
    },
    onSuccess: (styleData) => {
      toast({
        title: "Style Selected",
        description: `${styleData.name} is ready for generation`
      });
      
      // Navigate to AI cosplay page
      setLocation('/ai-cosplay');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/cosplay-styles'] });
    },
    onError: () => {
      toast({
        title: "Selection failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });
};

// Filter Components - Single Responsibility Principle
const FilterSidebar = ({ 
  filters, 
  onFiltersChange, 
  categories, 
  isOpen, 
  onClose 
}: {
  filters: StyleFilter;
  onFiltersChange: (filters: StyleFilter) => void;
  categories: StyleCategory[];
  isOpen: boolean;
  onClose: () => void;
}) => {
  const difficulties = ['easy', 'medium', 'hard'];

  const handleCategoryToggle = useCallback((categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    onFiltersChange({ ...filters, categories: newCategories });
  }, [filters, onFiltersChange]);

  const handleDifficultyToggle = useCallback((difficulty: string) => {
    const newDifficulty = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty];
    
    onFiltersChange({ ...filters, difficulty: newDifficulty });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      categories: [],
      difficulty: [],
      premium: null,
      popular: null
    });
  }, [onFiltersChange]);

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-full p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              Clear All
            </Button>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.iconName);
                const isSelected = filters.categories.includes(category.categoryId);
                
                return (
                  <label
                    key={category.categoryId}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-500'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                      {category.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category.categoryId)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</h4>
            <div className="space-y-2">
              {difficulties.map((difficulty) => {
                const isSelected = filters.difficulty.includes(difficulty);
                
                return (
                  <label
                    key={difficulty}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-500'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 capitalize">
                      {difficulty}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleDifficultyToggle(difficulty)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Premium */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</h4>
            <div className="space-y-2">
              {[
                { value: false, label: 'Free Styles' },
                { value: true, label: 'Premium Styles' }
              ].map(({ value, label }) => {
                const isSelected = filters.premium === value;
                
                return (
                  <label
                    key={String(value)}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-500'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                      {label}
                    </span>
                    <input
                      type="radio"
                      name="premium"
                      checked={isSelected}
                      onChange={() => onFiltersChange({ 
                        ...filters, 
                        premium: filters.premium === value ? null : value 
                      })}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Popular */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${
                filters.popular 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-500'
              }`}>
                {filters.popular && <Check className="w-3 h-3 text-white" />}
              </div>
              <Star className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                Popular Styles Only
              </span>
              <input
                type="checkbox"
                checked={filters.popular || false}
                onChange={() => onFiltersChange({ 
                  ...filters, 
                  popular: filters.popular ? null : true 
                })}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

// Pagination Component - Open/Closed Principle
const PaginationControls = ({ 
  pagination, 
  onPageChange 
}: {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.page;
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center space-x-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </Button>
      
      <div className="flex space-x-1">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={index} className="px-3 py-1 text-gray-500">...</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          )
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center space-x-1"
      >
        <span>Next</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Style Card Component - Interface Segregation Principle
const StyleCard = ({ 
  style, 
  viewMode, 
  onSelect, 
  isSelecting 
}: {
  style: CosplayStyle;
  viewMode: 'grid' | 'list';
  onSelect: (style: CosplayStyle) => void;
  isSelecting: boolean;
}) => {
  const IconComponent = getIconComponent(style.iconName || 'Star');

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {style.name}
                </h3>
                {style.premium && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {style.popular && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {style.description}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                {style.difficulty && (
                  <Badge variant="outline" className="text-xs">
                    {style.difficulty}
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  Used {style.usageCount || 0} times
                </span>
              </div>
            </div>
            
            <Button
              onClick={() => onSelect(style)}
              disabled={isSelecting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSelecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Select Style'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {style.name}
              </h3>
              {style.premium && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {style.description}
            </p>
            
            <div className="flex items-center justify-center space-x-2 flex-wrap">
              {style.difficulty && (
                <Badge variant="outline" className="text-xs">
                  {style.difficulty}
                </Badge>
              )}
              {style.popular && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              Used {style.usageCount || 0} times
            </p>
          </div>
          
          <Button
            onClick={() => onSelect(style)}
            disabled={isSelecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isSelecting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isSelecting ? 'Selecting...' : 'Select Style'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component - Dependency Inversion Principle
export default function StyleLibraryPage() {
  const [state, setState] = useState<StyleLibraryState>(createInitialState);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = useStyleCategories();
  const { 
    data: stylesData, 
    isLoading: stylesLoading, 
    error: stylesError 
  } = useCosplayStyles(
    state.filters, 
    state.searchQuery, 
    state.pagination.page, 
    state.pagination.limit
  );
  
  // Commands
  const selectStyle = useStyleSelection();

  // Update pagination total when data changes
  useEffect(() => {
    if (stylesData?.total && stylesData.total !== state.pagination.total) {
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, total: stylesData.total }
      }));
    }
  }, [stylesData?.total, state.pagination.total]);

  // Event Handlers - Apple's event-driven architecture
  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const handleFiltersChange = useCallback((filters: StyleFilter) => {
    setState(prev => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  }, []);

  const handleViewModeChange = useCallback((viewMode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode }));
  }, []);

  const handleStyleSelect = useCallback((style: CosplayStyle) => {
    selectStyle.mutate(style);
  }, [selectStyle]);

  // Loading States
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600 dark:text-gray-400">Loading style library...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error States
  if (stylesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-red-600 dark:text-red-400">Failed to load styles. Please try again.</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const styles = stylesData?.styles || [];
  const hasActiveFilters = state.filters.categories.length > 0 || 
                          state.filters.difficulty.length > 0 || 
                          state.filters.premium !== null || 
                          state.filters.popular !== null;

  return (
    <>
      <SEOHead 
        title="Style Library - AI Character Transformation Styles"
        description="Browse our comprehensive library of AI character transformation styles. Filter by category, difficulty, and popularity to find the perfect style for your cosplay generation."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <NavigationHeader />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/ai-cosplay">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Generator</span>
                </Button>
              </Link>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Style Library
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Choose from {styles.length} professional character styles
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-80">
              <div className="sticky top-4">
                <FilterSidebar
                  filters={state.filters}
                  onFiltersChange={handleFiltersChange}
                  categories={categories}
                  isOpen={true}
                  onClose={() => {}}
                />
              </div>
            </div>

            {/* Mobile Filter Overlay */}
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsFilterOpen(false)} />
                <FilterSidebar
                  filters={state.filters}
                  onFiltersChange={handleFiltersChange}
                  categories={categories}
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                />
              </>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search styles..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center space-x-2"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {state.filters.categories.length + state.filters.difficulty.length + 
                         (state.filters.premium !== null ? 1 : 0) + (state.filters.popular !== null ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                  
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <Button
                      variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeChange('grid')}
                      className="rounded-r-none border-0"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeChange('list')}
                      className="rounded-l-none border-0"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {state.filters.categories.map(categoryId => {
                    const category = categories.find(c => c.categoryId === categoryId);
                    return category ? (
                      <Badge key={categoryId} variant="secondary" className="flex items-center space-x-1">
                        <span>{category.name}</span>
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => {
                            const newCategories = state.filters.categories.filter(id => id !== categoryId);
                            handleFiltersChange({ ...state.filters, categories: newCategories });
                          }}
                        />
                      </Badge>
                    ) : null;
                  })}
                  
                  {state.filters.difficulty.map(difficulty => (
                    <Badge key={difficulty} variant="secondary" className="flex items-center space-x-1">
                      <span className="capitalize">{difficulty}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => {
                          const newDifficulty = state.filters.difficulty.filter(d => d !== difficulty);
                          handleFiltersChange({ ...state.filters, difficulty: newDifficulty });
                        }}
                      />
                    </Badge>
                  ))}
                  
                  {state.filters.premium !== null && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>{state.filters.premium ? 'Premium' : 'Free'}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleFiltersChange({ ...state.filters, premium: null })}
                      />
                    </Badge>
                  )}
                  
                  {state.filters.popular && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Popular</span>
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleFiltersChange({ ...state.filters, popular: null })}
                      />
                    </Badge>
                  )}
                </div>
              )}

              {/* Loading State */}
              {stylesLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto" />
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                          </div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Styles Grid */}
              {!stylesLoading && (
                <>
                  {styles.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No styles found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Try adjusting your search or filter criteria
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          handleSearchChange('');
                          handleFiltersChange({
                            categories: [],
                            difficulty: [],
                            premium: null,
                            popular: null
                          });
                        }}
                      >
                        Clear all filters
                      </Button>
                    </div>
                  ) : (
                    <div className={
                      state.viewMode === 'grid' 
                        ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "space-y-4"
                    }>
                      {styles.map((style) => (
                        <StyleCard
                          key={style.styleId}
                          style={style}
                          viewMode={state.viewMode}
                          onSelect={handleStyleSelect}
                          isSelecting={selectStyle.isPending}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  <PaginationControls
                    pagination={state.pagination}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}