/**
 * E-commerce Style Library with Advanced Filtering and Pagination
 * Professional marketplace design with comprehensive filter sidebar
 */

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { 
  Search, Filter, Grid, List, ArrowLeft, Star, Sparkles, Crown, Zap, Shield, WandSparkles, 
  Heart, Rocket, Sword, Camera, Palette, ChevronDown, ChevronUp, SlidersHorizontal,
  ArrowUpDown, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SEOHead } from "@/components/SEOHead";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { useToast } from "@/hooks/use-toast";
import { 
  type CosplayStyle,
  type StyleCategory
} from "@shared/schema";

interface FilterState {
  categories: string[];
  difficulties: string[];
  premium: boolean | null;
  popular: boolean | null;
  usageRange: [number, number];
  tags: string[];
}

interface SortOption {
  value: string;
  label: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];
const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'usage', label: 'Most Used' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'difficulty_easy', label: 'Easiest First' },
  { value: 'difficulty_hard', label: 'Hardest First' }
];

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];

const iconMap = {
  Crown, Shield, Sparkles, Heart, WandSparkles, Rocket, Zap, Sword, Camera, Palette, Star
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Star;
};

// Enhanced API hooks with pagination and filtering
const useStyleCategories = () => {
  return useQuery<StyleCategory[]>({
    queryKey: ['/api/style-categories'],
    enabled: true
  });
};

const useCosplayStyles = (
  filters: FilterState,
  sortBy: string,
  page: number,
  limit: number,
  searchQuery: string
) => {
  const params = new URLSearchParams();
  
  if (filters.categories.length > 0) {
    filters.categories.forEach(cat => params.append('categoryId', cat));
  }
  if (filters.difficulties.length > 0) {
    filters.difficulties.forEach(diff => params.append('difficulty', diff));
  }
  if (filters.premium !== null) {
    params.append('premium', filters.premium.toString());
  }
  if (filters.popular !== null) {
    params.append('popular', filters.popular.toString());
  }
  if (searchQuery.length > 2) {
    params.append('search', searchQuery);
  }
  if (sortBy) {
    params.append('sortBy', sortBy);
  }
  
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const queryString = params.toString();
  const url = `/api/cosplay-styles${queryString ? '?' + queryString : ''}`;
  
  return useQuery<{ styles: CosplayStyle[], total: number, page: number }>({
    queryKey: ['/api/cosplay-styles', filters, sortBy, page, limit, searchQuery],
    enabled: true
  });
};

const useAllTags = () => {
  return useQuery<string[]>({
    queryKey: ['/api/cosplay-styles/tags'],
    enabled: true
  });
};

export default function StyleLibraryEcommercePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 24,
    total: 0
  });
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    difficulties: [],
    premium: null,
    popular: null,
    usageRange: [0, 100],
    tags: []
  });

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    difficulty: true,
    features: true,
    tags: false
  });

  const [state, setState] = useState({
    selectedStyle: null as string | null,
    recentStyles: [] as string[]
  });

  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // API queries
  const { data: categories = [], isLoading: categoriesLoading } = useStyleCategories();
  const { data: styleData, isLoading: stylesLoading } = useCosplayStyles(
    filters, sortBy, pagination.page, pagination.limit, searchQuery
  );
  const { data: allTags = [] } = useAllTags();

  const styles = styleData?.styles || [];
  const totalItems = styleData?.total || 0;
  const totalPages = Math.ceil(totalItems / pagination.limit);

  // Update pagination total when data changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, total: totalItems }));
  }, [totalItems]);

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

  // Handle style selection
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

    // Update selected style in local state  
    setState(prev => ({
      ...prev,
      selectedStyle: style.styleId
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

  // Filter handlers
  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleDifficulty = (difficulty: string) => {
    setFilters(prev => ({
      ...prev,
      difficulties: prev.difficulties.includes(difficulty)
        ? prev.difficulties.filter(d => d !== difficulty)
        : [...prev.difficulties, difficulty]
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      difficulties: [],
      premium: null,
      popular: null,
      usageRange: [0, 100],
      tags: []
    });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const activeFilterCount = useMemo(() => {
    return filters.categories.length + 
           filters.difficulties.length + 
           filters.tags.length +
           (filters.premium !== null ? 1 : 0) +
           (filters.popular !== null ? 1 : 0);
  }, [filters]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: string) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(newLimit),
      page: 1
    }));
  };

  const isLoading = categoriesLoading || stylesLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead 
        title="Style Library - AI Cosplay Generator"
        description="Browse and filter through hundreds of professional cosplay styles. Advanced search and filtering for the perfect transformation."
      />
      
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Style Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {totalItems} styles available
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear ({activeFilterCount})
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search styles..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <div>
                  <button
                    onClick={() => toggleSection('categories')}
                    className="flex items-center justify-between w-full text-sm font-medium mb-3 hover:text-purple-600"
                  >
                    Categories
                    {expandedSections.categories ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </button>
                  
                  {expandedSections.categories && (
                    <div className="space-y-2">
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.iconName);
                        const isSelected = filters.categories.includes(category.categoryId);
                        
                        return (
                          <div key={category.categoryId} className="flex items-center space-x-2">
                            <Checkbox
                              id={category.categoryId}
                              checked={isSelected}
                              onCheckedChange={() => toggleCategory(category.categoryId)}
                            />
                            <Label 
                              htmlFor={category.categoryId}
                              className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                            >
                              <IconComponent className="h-4 w-4" />
                              {category.name}
                              {category.featured && <Star className="h-3 w-3 text-yellow-500" />}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Difficulty */}
                <div>
                  <button
                    onClick={() => toggleSection('difficulty')}
                    className="flex items-center justify-between w-full text-sm font-medium mb-3 hover:text-purple-600"
                  >
                    Difficulty
                    {expandedSections.difficulty ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </button>
                  
                  {expandedSections.difficulty && (
                    <div className="space-y-2">
                      {DIFFICULTY_OPTIONS.map((difficulty) => (
                        <div key={difficulty} className="flex items-center space-x-2">
                          <Checkbox
                            id={difficulty}
                            checked={filters.difficulties.includes(difficulty)}
                            onCheckedChange={() => toggleDifficulty(difficulty)}
                          />
                          <Label htmlFor={difficulty} className="text-sm cursor-pointer capitalize">
                            {difficulty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Features */}
                <div>
                  <button
                    onClick={() => toggleSection('features')}
                    className="flex items-center justify-between w-full text-sm font-medium mb-3 hover:text-purple-600"
                  >
                    Features
                    {expandedSections.features ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </button>
                  
                  {expandedSections.features && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="popular"
                          checked={filters.popular === true}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ 
                              ...prev, 
                              popular: checked ? true : null 
                            }))
                          }
                        />
                        <Label htmlFor="popular" className="text-sm cursor-pointer">
                          Popular Styles
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="premium"
                          checked={filters.premium === true}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ 
                              ...prev, 
                              premium: checked ? true : null 
                            }))
                          }
                        />
                        <Label htmlFor="premium" className="text-sm cursor-pointer">
                          Premium Styles
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleSection('tags')}
                      className="flex items-center justify-between w-full text-sm font-medium mb-3 hover:text-purple-600"
                    >
                      Tags
                      {expandedSections.tags ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                    
                    {expandedSections.tags && (
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {allTags.slice(0, 20).map((tag) => (
                            <div key={tag} className="flex items-center space-x-2">
                              <Checkbox
                                id={tag}
                                checked={filters.tags.includes(tag)}
                                onCheckedChange={() => toggleTag(tag)}
                              />
                              <Label htmlFor={tag} className="text-sm cursor-pointer">
                                {tag}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, totalItems)} of {totalItems} results
                </span>
              </div>
              
              <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map(option => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading styles...</span>
              </div>
            )}

            {/* Styles Grid */}
            {!isLoading && (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {styles.map((style) => {
                    const IconComponent = getIconComponent(style.iconName);
                    return (
                      <Card 
                        key={style.styleId} 
                        className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                        onClick={() => handleStyleSelect(style)}
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
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* No Results */}
                {styles.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No styles found matching your criteria
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}