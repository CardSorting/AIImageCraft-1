import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Share2
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

const categories = [
  { id: "all", name: "All Models", icon: Brain },
  { id: "featured", name: "Featured", icon: Star },
  { id: "General", name: "General", icon: Brain },
  { id: "Speed", name: "Speed", icon: Zap },
  { id: "Latest", name: "Latest", icon: Sparkles },
  { id: "Photorealistic", name: "Photo", icon: Camera },
  { id: "Artistic", name: "Artistic", icon: Palette },
];

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch models based on category
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["/api/models", selectedCategory],
    queryFn: () => {
      if (selectedCategory === "featured") {
        return fetch("/api/models/featured").then(res => res.json());
      }
      if (selectedCategory === "all") {
        return fetch("/api/models").then(res => res.json());
      }
      return fetch(`/api/models?category=${selectedCategory}`).then(res => res.json());
    },
  });

  // Search functionality
  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/models/search", searchQuery],
    queryFn: () => 
      searchQuery.length > 2 
        ? fetch(`/api/models/search/${encodeURIComponent(searchQuery)}`).then(res => res.json())
        : [],
    enabled: searchQuery.length > 2,
  });

  const displayModels = searchQuery.length > 2 ? searchResults : models;

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
        {/* Category Pills - iOS Style */}
        <div className="px-4 py-4">
          <ScrollArea className="w-full">
            <div className="flex space-x-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`ios-pill whitespace-nowrap ${
                      isSelected 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
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
              {displayModels.map((model: AIModel) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}

          {displayModels.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No models found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or browse different categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ModelCardProps {
  model: AIModel;
}

function ModelCard({ model }: ModelCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  
  const categoryIcon = categoryIcons[model.category as keyof typeof categoryIcons] || Brain;
  const Icon = categoryIcon;

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
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
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