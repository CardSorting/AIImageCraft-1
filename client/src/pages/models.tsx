import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useModelsQuery, useModelsSearchQuery, ModelFilter } from "@/hooks/useModelsQuery";
import { Link, useParams } from "wouter";
import { 
  Search, 
  Star, 
  Download, 
  Sparkles, 
  Brain, 
  Zap, 
  Camera, 
  Palette, 
  Filter,
  ArrowLeft,
  Play,
  Heart,
  Share2,
  MessageCircle,
  Image,
  Clock,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AIModel } from "@shared/schema";

const categoryIcons = {
  "General": Brain,
  "Speed": Zap,
  "Latest": Sparkles,
  "Photorealistic": Camera,
  "Artistic": Palette,
} as const;

const sortOptions = [
  { id: "newest", name: "Newest", icon: Sparkles },
  { id: "highest_rated", name: "Highest Rated", icon: Star },
  { id: "most_liked", name: "Most Liked", icon: Heart },
  { id: "most_discussed", name: "Most Discussed", icon: MessageCircle },
  { id: "most_images", name: "Most Images", icon: Image },
  { id: "oldest", name: "Oldest", icon: Clock },
];

const mainTabs = [
  { id: "for_you", name: "For You", icon: Sparkles },
  { id: "all", name: "All Models", icon: Brain },
  { id: "bookmarked", name: "Bookmarked", icon: Bookmark },
];

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Use our new CQRS-based hooks for clean architecture
  const { data: modelsResponse, isLoading } = useModelsQuery({
    filter: selectedTab as ModelFilter,
    sortBy,
    limit: 20,
    userId: 1,
    searchQuery
  });

  // Search functionality with dedicated hook
  const { data: searchResults = [] } = useModelsSearchQuery(searchQuery);

  // Extract models from response (handles both new structured and legacy format)
  const models = modelsResponse?.data || [];
  const displayModels = searchQuery.length > 2 ? searchResults : models;
  
  // Ensure displayModels is always an array
  const safeDisplayModels = Array.isArray(displayModels) ? displayModels : [];

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K`;
    return downloads.toString();
  };

  const getRatingStars = (rating: number) => {
    const stars = Math.round(rating / 20); // Convert 0-100 to 0-5 stars
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* iOS-style Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="safe-area-top" />
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Models</h1>
            <Button variant="ghost" size="sm" className="ios-button">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Bar - iOS Style */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 ios-input bg-gray-100 dark:bg-gray-800 border-none rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="pb-20">
        {/* Main Tabs - iOS Style */}
        <div className="px-4 py-4">
          <div className="flex justify-center mb-4">
            <div className="ios-tab-list inline-flex">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTab(tab.id)}
                    className={`ios-tab ${
                      isSelected 
                        ? 'bg-white dark:bg-gray-700 text-blue-500' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Advanced Sort Options */}
          {selectedTab === "all" && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sort by
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="ios-button text-xs"
              >
                {sortOptions.find(opt => opt.id === sortBy)?.name || "Newest"}
                <Filter className="h-3 w-3 ml-2" />
              </Button>
            </div>
          )}

          {/* Sort Menu */}
          {showSortMenu && selectedTab === "all" && (
            <div className="mb-4 ios-fade-in">
              <ScrollArea className="w-full">
                <div className="flex space-x-2 pb-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = sortBy === option.id;
                    return (
                      <Button
                        key={option.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSortBy(option.id);
                          setShowSortMenu(false);
                        }}
                        className={`ios-pill whitespace-nowrap ${
                          isSelected 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {option.name}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Models Grid */}
        <div className="px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="ios-card animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeDisplayModels.map((model: AIModel) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}

          {safeDisplayModels.length === 0 && !isLoading && (
            <div className="text-center py-12">
              {selectedTab === "bookmarked" ? (
                <>
                  <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No bookmarked models
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Bookmark your favorite models to find them easily later.
                  </p>
                </>
              ) : (
                <>
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No models found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or explore different sorting options.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ModelCardProps {
  model: AIModel & { _recommendation?: any };
}

function ModelCard({ model }: ModelCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewStartTime] = useState(Date.now());
  
  const categoryIcon = categoryIcons[model.category as keyof typeof categoryIcons] || Brain;
  const Icon = categoryIcon;
  
  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K`;
    return downloads.toString();
  };

  // Track user interactions for personalization learning
  const trackInteraction = async (interactionType: string, engagementLevel: number = 5) => {
    try {
      const sessionDuration = Math.round((Date.now() - viewStartTime) / 1000);
      
      await fetch('/api/interactions/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Demo user - in production would come from auth
          modelId: model.id,
          interactionType,
          engagementLevel,
          sessionDuration,
          deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
          referralSource: 'recommendation'
        }),
      });
    } catch (error) {
      console.log('Interaction tracking temporarily unavailable');
    }
  };

  // Load bookmark and like status when card is visible
  useEffect(() => {
    trackInteraction('view', 6);
    
    // Check if model is bookmarked
    const loadBookmarkStatus = async () => {
      try {
        const response = await fetch(`/api/bookmarks/1/${model.id}`);
        const data = await response.json();
        setIsBookmarked(data.bookmarked || false);
      } catch (error) {
        setIsBookmarked(false);
      }
    };

    // Check if model is liked
    const loadLikeStatus = async () => {
      try {
        const response = await fetch(`/api/likes/1/${model.id}`);
        const data = await response.json();
        setIsLiked(data.liked || false);
      } catch (error) {
        setIsLiked(false);
      }
    };
    
    loadBookmarkStatus();
    loadLikeStatus();
  }, [model.id]);

  // Handle like functionality
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Using hardcoded user ID for now
          modelId: model.id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setIsLiked(data.liked);
        await trackInteraction('like', data.liked ? 8 : 3);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  // Handle bookmark functionality with immediate visual feedback
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Optimistic update for immediate visual feedback
      const newBookmarkState = !isBookmarked;
      setIsBookmarked(newBookmarkState);
      
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          modelId: model.id
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Confirm the state from server response
        setIsBookmarked(data.bookmarked);
        await trackInteraction('bookmark', data.bookmarked ? 9 : 4);
      } else {
        // Revert on failure
        setIsBookmarked(!newBookmarkState);
      }
    } catch (error) {
      // Revert on error
      setIsBookmarked(!isBookmarked);
      console.log('Bookmark functionality temporarily unavailable');
    }
  };

  return (
    <Link href={`/models/${model.id}`}>
      <Card className="ios-card group cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
        <CardContent className="p-0">
          {/* Model Preview */}
          <div className="relative aspect-square rounded-t-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            {model.thumbnail ? (
              <img 
                src={model.thumbnail} 
                alt={model.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Icon className="h-12 w-12 text-blue-500" />
              </div>
            )}
            
            {/* Floating Actions */}
            <div className="absolute top-3 right-3 flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                className="ios-floating-button"
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="ios-floating-button"
                onClick={handleBookmark}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
              </Button>
            </div>

            {/* Featured Badge */}
            {model.featured === 1 && (
              <div className="absolute top-3 left-3">
                <Badge className="ios-badge bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}

            {/* Provider Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="ios-badge text-xs">
                {model.provider}
              </Badge>
            </div>
          </div>

          {/* Model Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {model.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {model.description}
                </p>
              </div>
            </div>

            {/* Rating & Downloads */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                {model.rating && (
                  <>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {(model.rating / 20).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                  </>
                )}
                <div className="flex items-center space-x-1">
                  <Download className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDownloads(model.downloads || 0)}
                  </span>
                </div>
              </div>
              
              <Badge variant="outline" className="text-xs">
                v{model.version}
              </Badge>
            </div>

            {/* Recommendation Insights - only show for For You tab */}
            {model._recommendation && (
              <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Recommended for you
                  </span>
                  <div className="flex items-center space-x-1 ml-auto">
                    {Array.from({ length: Math.round(model._recommendation.confidenceScore * 5) }).map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    ))}
                  </div>
                </div>
                {model._recommendation.reasons && model._recommendation.reasons.length > 0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                    {model._recommendation.reasons[0].description}
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            {model.tags && model.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {model.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs ios-tag">
                    {tag}
                  </Badge>
                ))}
                {model.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs ios-tag">
                    +{model.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Action Button */}
            <Button 
              size="sm" 
              className="w-full ios-button bg-blue-500 hover:bg-blue-600 text-white"
              onClick={(e) => e.preventDefault()}
            >
              <Play className="h-4 w-4 mr-2" />
              Try Model
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}