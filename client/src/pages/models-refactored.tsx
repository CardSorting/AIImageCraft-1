/**
 * Models Page - Refactored with Clean Architecture & Apple Design Philosophy
 * 
 * Architecture Features:
 * ✓ SOLID Principles - Single responsibility, dependency inversion
 * ✓ CQRS Pattern - Separate commands and queries
 * ✓ Domain-Driven Design - Rich domain entities
 * ✓ Clean Architecture - Infrastructure, application, domain layers
 * ✓ Apple Philosophy - Beautiful, intuitive, "it just works"
 */

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, Star, Heart, Bookmark, Filter, Sparkles, Brain, 
  ChevronLeft, ChevronRight, X, Zap, Download, Eye, Grid3X3, List
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { BookmarkButton } from "@/components/BookmarkButton";

import { Model } from "@/domain/entities/Model";
import { ModelService } from "@/application/services/ModelService";
import { BookmarkService } from "@/application/services/BookmarkService";
import { 
  GetModelsQueryImpl, 
  GetPersonalizedModelsQueryImpl,
  SearchModelsQueryImpl 
} from "@/application/queries/ModelQueries";

// Apple-inspired design system constants
const DESIGN_TOKENS = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem', 
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  shadows: {
    subtle: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    elegant: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    dramatic: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
} as const;

interface ModelsPageState {
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  viewMode: 'grid' | 'list';
  currentPage: number;
  selectedTags: string[];
}

interface ModelCardProps {
  model: any; // Using existing API structure
  viewMode: 'grid' | 'list';
  onTagClick: (tag: string) => void;
}

// Apple-inspired Model Card Component
function ModelCard({ model, viewMode, onTagClick }: ModelCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [stats, setStats] = useState({
    likeCount: model.likeCount || 0,
    bookmarkCount: model.bookmarkCount || 0,
    downloadCount: model.downloads || 0,
    viewCount: model.views || 0
  });
  
  const modelService = new ModelService();
  const bookmarkService = new BookmarkService();
  const queryClient = useQueryClient();

  // Use the new BookmarkService hooks
  const { data: bookmarkStatus } = bookmarkService.useBookmarkStatus(1, model.id);
  const toggleBookmarkMutation = bookmarkService.useToggleBookmark();

  const isBookmarked = bookmarkStatus?.isBookmarked || false;

  useEffect(() => {
    modelService.trackInteraction(1, model.id, 'view', 3);
    loadLikeState();
  }, [model.id]);

  const loadLikeState = async () => {
    try {
      const likeRes = await fetch(`/api/likes/1/${model.id}`);
      
      if (likeRes.ok) {
        const data = await likeRes.json();
        setIsLiked(data.liked || false);
      }
    } catch (error) {
      console.log('Loading like state...');
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const newState = await modelService.likeModel(1, model.id, isLiked);
      setIsLiked(newState);
      setStats(prev => ({ 
        ...prev, 
        likeCount: newState ? prev.likeCount + 1 : prev.likeCount - 1 
      }));
    } catch (error) {
      console.error('Like action failed');
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await toggleBookmarkMutation.mutateAsync({ userId: 1, modelId: model.id });
      
      // Update local stats optimistically
      setStats(prev => ({ 
        ...prev, 
        bookmarkCount: isBookmarked ? prev.bookmarkCount - 1 : prev.bookmarkCount + 1 
      }));
    } catch (error) {
      console.error('Bookmark action failed');
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/model/${model.id}`}>
        <Card className="group hover:shadow-elegant transition-all duration-300 hover:scale-[1.01] cursor-pointer">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex-shrink-0">
                {model.thumbnail ? (
                  <img
                    src={model.thumbnail}
                    alt={model.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Brain className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {model.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={isLiked ? "default" : "outline"}
                      onClick={handleLike}
                      className="h-8"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant={isBookmarked ? "default" : "outline"}
                      onClick={handleBookmark}
                      className="h-8"
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {model.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {formatCount(stats.likeCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {formatCount(stats.downloadCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {formatCount(stats.viewCount)}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    {model.tags && model.tags.slice(0, 2).map((tag: string) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onTagClick(tag);
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/model/${model.id}`}>
      <Card className="group hover:shadow-dramatic transition-all duration-500 hover:scale-[1.03] cursor-pointer overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
          {model.thumbnail ? (
            <img
              src={model.thumbnail}
              alt={model.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <Brain className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Quality Indicator */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg ${
            model.featured
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}>
            {model.featured ? 'Featured' : model.category || 'General'}
          </div>
          
          {/* Trending Badge */}
          {model.featured && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Featured
            </div>
          )}
          
          {/* Hover Actions */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              size="sm"
              variant={isLiked ? "default" : "secondary"}
              onClick={handleLike}
              className="h-8 w-8 p-0 rounded-full shadow-lg backdrop-blur-sm"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              size="sm"
              variant={isBookmarked ? "default" : "secondary"}
              onClick={handleBookmark}
              className="h-8 w-8 p-0 rounded-full shadow-lg backdrop-blur-sm"
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {model.name}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {model.description}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatCount(stats.likeCount)}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {formatCount(stats.downloadCount)}
              </span>
            </div>
            
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round((model.qualityRating || 80) / 20)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {model.tags && model.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {model.tags.slice(0, 2).map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onTagClick(tag);
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {model.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{model.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Main Models Page Component
export default function ModelsPageRefactored() {
  const [state, setState] = useState<ModelsPageState>({
    searchQuery: "",
    selectedCategory: "all",
    sortBy: "newest",
    viewMode: "grid",
    currentPage: 1,
    selectedTags: []
  });

  const modelService = new ModelService();

  // Load models using existing API structure with improved bookmarked handling
  const { data: allModels = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/models', state.selectedCategory, state.sortBy],
    queryFn: async () => {
      if (state.selectedCategory === 'for_you') {
        const response = await fetch(`/api/models/for-you/1?limit=50`);
        return response.ok ? await response.json() : [];
      } else if (state.selectedCategory === 'bookmarked') {
        const response = await fetch(`/api/models/bookmarked/1`);
        return response.ok ? await response.json() : [];
      } else {
        const queryParams = new URLSearchParams();
        if (state.selectedCategory !== 'all') queryParams.set('category', state.selectedCategory);
        queryParams.set('sortBy', state.sortBy);
        queryParams.set('limit', '100');
        
        const response = await fetch(`/api/models?${queryParams}`);
        return response.ok ? await response.json() : [];
      }
    },
    staleTime: state.selectedCategory === 'bookmarked' ? 0 : 5 * 60 * 1000, // No cache for bookmarks, 5 minutes for others
    refetchOnWindowFocus: state.selectedCategory === 'bookmarked',
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['/api/search', state.searchQuery],
    queryFn: async () => {
      if (state.searchQuery.length < 2) return [];
      const response = await fetch(`/api/models/search?q=${encodeURIComponent(state.searchQuery)}&limit=20`);
      return response.ok ? await response.json() : [];
    },
    enabled: state.searchQuery.length >= 2,
  });

  // Computed values following Apple's reactive philosophy
  const displayModels = useMemo(() => {
    let models = state.searchQuery.length >= 2 ? searchResults : allModels;
    
    // Filter by selected tags
    if (state.selectedTags.length > 0) {
      models = models.filter((model: any) => 
        model.tags && state.selectedTags.some(tag => 
          model.tags.includes(tag.toLowerCase())
        )
      );
    }
    
    return models;
  }, [allModels, searchResults, state.searchQuery, state.selectedTags]);

  // Pagination logic
  const modelsPerPage = state.viewMode === 'grid' ? 12 : 8;
  const totalPages = Math.ceil(displayModels.length / modelsPerPage);
  const startIndex = (state.currentPage - 1) * modelsPerPage;
  const paginatedModels = displayModels.slice(startIndex, startIndex + modelsPerPage);

  // Event handlers following Apple's principle of clear user intent
  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, currentPage: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category, currentPage: 1 }));
  };

  const handleSortChange = (sort: string) => {
    setState(prev => ({ ...prev, sortBy: sort, currentPage: 1 }));
  };

  const handleTagClick = (tag: string) => {
    setState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag],
      currentPage: 1
    }));
  };

  const handleViewModeToggle = () => {
    setState(prev => ({ 
      ...prev, 
      viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' 
    }));
  };

  const isLoading = isLoadingAll;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Navigation Header */}
      <NavigationHeader activeItem="models" />
      
      <div className="container max-w-7xl mx-auto px-4 py-8 pb-20">

        {/* Controls */}
        <div className="mb-8 space-y-6">

          {/* Category Tabs */}
          <Tabs value={state.selectedCategory} onValueChange={handleCategoryChange}>
            <div className="flex justify-center">
              <TabsList className="bg-white dark:bg-gray-900 p-1 rounded-2xl shadow-elegant">
                <TabsTrigger value="all" className="rounded-xl">
                  <Brain className="h-4 w-4 mr-2" />
                  All Models
                </TabsTrigger>
                <TabsTrigger value="for_you" className="rounded-xl">
                  <Sparkles className="h-4 w-4 mr-2" />
                  For You
                </TabsTrigger>
                <TabsTrigger value="bookmarked" className="rounded-xl">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Bookmarked
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={state.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="most_liked">Most Liked</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewModeToggle}
              className="flex items-center gap-2"
            >
              {state.viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              {state.viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
          </div>

          {/* Selected Tags */}
          {state.selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {state.selectedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="default"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => handleTagClick(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Models Grid/List */}
        {isLoading ? (
          <div className={`grid gap-6 ${
            state.viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: modelsPerPage }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className={`${state.viewMode === 'grid' ? 'aspect-square' : 'h-32'} bg-gray-200 dark:bg-gray-700 rounded-t-lg`} />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              state.viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {paginatedModels.map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  viewMode={state.viewMode}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                  disabled={state.currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + Math.max(1, state.currentPage - 2);
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === state.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, currentPage: pageNum }))}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
                  disabled={state.currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && displayModels.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Brain className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No models found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Try adjusting your search terms or explore different categories to discover amazing AI models.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}