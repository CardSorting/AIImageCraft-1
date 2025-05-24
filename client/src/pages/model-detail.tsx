/**
 * Model Detail Page - Clean Architecture Implementation
 * Follows Apple's philosophy of clear, purposeful design
 * Implements proper separation of concerns with authentic data
 */

import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Star, 
  Download, 
  Heart, 
  Share2, 
  Play, 
  Info,
  ExternalLink,
  Copy,
  Check,
  Brain,
  Zap,
  Camera,
  Palette,
  Sparkles,
  Bookmark,
  MessageCircle,
  TrendingUp,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Grid3X3,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AIModel } from "@shared/schema";

const categoryIcons = {
  "General": Brain,
  "Speed": Zap,
  "Latest": Sparkles,
  "Photorealistic": Camera,
  "Artistic": Palette,
} as const;

interface ModelStats {
  likeCount: number;
  bookmarkCount: number;
  runCount: number;
  viewCount: number;
}

interface Review {
  id: number;
  userId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
  avatar?: string;
}

/**
 * Main Model Detail Page Component
 * Follows Apple's philosophy of clear, purposeful interfaces
 */
export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const userId = 1; // Current user ID

  // Fetch authentic model data from the database
  const { data: model, isLoading: modelLoading, error } = useQuery<AIModel>({
    queryKey: ["/api/models", id],
    enabled: !!id,
  });

  // Fetch authentic engagement data 
  const { data: likeStatus } = useQuery<{liked: boolean}>({
    queryKey: ["/api/likes", userId, id],
    enabled: !!id,
  });

  const { data: bookmarkStatus } = useQuery<{bookmarked: boolean}>({
    queryKey: ["/api/bookmarks", userId, id],
    enabled: !!id,
  });

  // Fetch authentic model statistics
  const { data: stats } = useQuery<{likeCount: number; bookmarkCount: number}>({
    queryKey: ["/api/models", id, "stats"],
    enabled: !!id,
  });

  // Fetch authentic generated images from database
  const { data: generatedImages, isLoading: imagesLoading } = useQuery<any[]>({
    queryKey: ["/api/images/by-model", id],
    queryFn: () => fetch(`/api/images/by-model/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  // Mock reviews for demonstration (replace with real API)
  const mockReviews: Review[] = [
    {
      id: 1,
      userId: 1,
      username: "PixelArtist",
      rating: 5,
      comment: "Incredible results! The level of detail and creativity is amazing. Perfect for professional work.",
      createdAt: "2024-01-15T10:30:00Z",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 2,
      userId: 2,
      username: "CreativeFlow",
      rating: 5,
      comment: "Fast generation and stunning quality. This model has become my go-to for client projects.",
      createdAt: "2024-01-14T15:45:00Z",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 3,
      userId: 3,
      username: "DigitalDreamer",
      rating: 4,
      comment: "Excellent results with great consistency. Minor tweaks needed for specific styles but overall fantastic.",
      createdAt: "2024-01-13T09:20:00Z",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
    }
  ];

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        return apiRequest("DELETE", `/api/likes/1/${id}`);
      } else {
        return apiRequest("POST", `/api/likes`, { userId: 1, modelId: Number(id) });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/models", id, "stats"] });
      toast({
        title: isLiked ? "Removed from favorites" : "Added to favorites",
        description: isLiked ? "You can always like it again later" : "You'll see this in your favorites",
      });
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        return apiRequest("DELETE", `/api/bookmarks/1/${id}`);
      } else {
        return apiRequest("POST", `/api/bookmarks`, { userId: 1, modelId: Number(id) });
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ["/api/models", id, "stats"] });
      toast({
        title: isBookmarked ? "Removed bookmark" : "Bookmarked",
        description: isBookmarked ? "Removed from your collection" : "Saved to your collection",
      });
    },
  });

  useEffect(() => {
    if (likeStatus?.liked !== undefined) setIsLiked(likeStatus.liked);
    if (bookmarkStatus?.bookmarked !== undefined) setIsBookmarked(bookmarkStatus.bookmarked);
  }, [likeStatus, bookmarkStatus]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && model) {
      try {
        await navigator.share({
          title: model.name,
          text: model.description,
          url: window.location.href,
        });
      } catch (err) {
        handleCopy(window.location.href, "Model link");
      }
    } else {
      handleCopy(window.location.href, "Model link");
    }
  };

  const handleTryModel = () => {
    setLocation(`/generate?model=${encodeURIComponent(model?.modelId || '')}`);
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!generatedImages || selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : generatedImages.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < generatedImages.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  if (modelLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between h-14 px-4">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <div className="w-10" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Model not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The model you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/models">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl">
              Browse Models
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryIcon = categoryIcons[model.category as keyof typeof categoryIcons] || Brain;
  const Icon = categoryIcon;
  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/models">
            <Button variant="ghost" size="sm" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-gray-900 dark:text-white truncate text-center flex-1 mx-4">
            {model.name}
          </h1>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-56px)]">
        <div className="pb-20">
          {/* Hero Section */}
          <div className="p-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 mb-4">
              {model.thumbnail ? (
                <img 
                  src={model.thumbnail} 
                  alt={model.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Icon className="h-20 w-20 text-blue-500" />
                </div>
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Featured Badge */}
              {model.featured === 1 && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-yellow-500 text-white px-3 py-1 rounded-full shadow-lg">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}

              {/* Floating Actions */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-2"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-2"
                  onClick={() => bookmarkMutation.mutate()}
                  disabled={bookmarkMutation.isPending}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-gray-700'}`} />
                </Button>
              </div>
            </div>

            {/* Model Info */}
            <div className="space-y-4">
              {/* Title and Provider */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {model.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  {model.description}
                </p>
              </div>

              {/* Provider & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                  {model.provider}
                </Badge>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  v{model.version}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                  <Icon className="h-3 w-3 mr-1" />
                  {model.category}
                </Badge>
              </div>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                <div className="text-center">
                  <div className="flex items-center justify-center text-yellow-500 mb-1">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-red-500 mb-1">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats?.likeCount || 0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-blue-500 mb-1">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatNumber(model.downloads || 0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Uses</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-green-500 mb-1">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats?.bookmarkCount || 0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Saved</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
                  onClick={handleTryModel}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Try Model
                </Button>
                <Button 
                  variant="outline" 
                  className="px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600"
                  onClick={() => handleCopy(model.modelId, "Model ID")}
                >
                  {copiedText === model.modelId ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="px-4 mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="gallery" 
                  className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
                >
                  Gallery
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-4">
                {/* Model Information */}
                <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <Info className="h-5 w-5 mr-2 text-blue-600" />
                      Model Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Model ID</div>
                        <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                          {model.modelId}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Provider</div>
                        <div className="font-medium">{model.provider}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
                        <div className="font-medium">{model.category}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Version</div>
                        <div className="font-medium">v{model.version}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Capabilities */}
                {model.capabilities && model.capabilities.length > 0 && (
                  <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Capabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {model.capabilities.map((capability, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            <span className="text-sm">{capability}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {model.tags && model.tags.length > 0 && (
                  <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {model.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                {generatedImages && generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Generated Images ({generatedImages.length})
                      </h3>
                      <Button variant="ghost" size="sm" className="p-2">
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Instagram-style grid */}
                    <div className="grid grid-cols-3 gap-1">
                      {generatedImages.map((image: any, index: number) => (
                        <div 
                          key={image.id} 
                          className="aspect-square relative cursor-pointer group"
                          onClick={() => openImageModal(index)}
                        >
                          <img 
                            src={image.imageUrl} 
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="h-4 w-4 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
                    <CardContent className="text-center py-12">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        No images yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        Generated images from this model will appear here
                      </p>
                      <Button onClick={handleTryModel} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Play className="h-4 w-4 mr-2" />
                        Generate First Image
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6 space-y-4">
                {/* Reviews Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Reviews & Ratings
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {averageRating.toFixed(1)} ({mockReviews.length} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <Card key={review.id} className="border-0 shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.avatar} alt={review.username} />
                            <AvatarFallback>{review.username[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {review.username}
                              </h4>
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                              {review.comment}
                            </p>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>

      {/* Image Modal */}
      {selectedImageIndex !== null && generatedImages && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              onClick={closeImageModal}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation Buttons */}
            {generatedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                  onClick={() => navigateImage('prev')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                  onClick={() => navigateImage('next')}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image */}
            <img
              src={generatedImages[selectedImageIndex].imageUrl}
              alt={`Generated image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Counter */}
            {generatedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {generatedImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}