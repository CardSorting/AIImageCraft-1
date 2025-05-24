/**
 * Model Detail Page - Authentic Data Implementation
 * Displays only real data from your database
 */

import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { 
  ArrowLeft, 
  Heart, 
  Bookmark,
  Play,
  TrendingUp,
  Camera,
  Brain,
  Zap,
  Palette,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = 1;

  // Fetch authentic model data from database
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

  // Fetch authentic generated images
  const { data: generatedImages = [], isLoading: imagesLoading } = useQuery<any[]>({
    queryKey: ["/api/images/by-model", id],
    queryFn: () => fetch(`/api/images/by-model/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  // Sync engagement state with authentic data
  useEffect(() => {
    if (likeStatus?.liked !== undefined) setIsLiked(likeStatus.liked);
    if (bookmarkStatus?.bookmarked !== undefined) setIsBookmarked(bookmarkStatus.bookmarked);
  }, [likeStatus, bookmarkStatus]);

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
        description: "Preference updated successfully",
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
        description: "Collection updated successfully",
      });
    },
  });

  if (modelLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Browse Models
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Use authentic statistics from database
  const modelLikes = stats?.likeCount || 0;
  const modelBookmarks = stats?.bookmarkCount || 0;
  const totalGenerations = generatedImages?.length || 0;
  
  const categoryIcon = categoryIcons[model.category as keyof typeof categoryIcons] || Brain;
  const Icon = categoryIcon;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/models">
            <Button variant="ghost" size="sm" className="p-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-gray-900 dark:text-white truncate text-center flex-1 mx-4">
            {model.name}
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => bookmarkMutation.mutate()}
              disabled={bookmarkMutation.isPending}
              className={`p-2 rounded-full ${isBookmarked ? 'text-blue-500' : 'text-gray-500'}`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Model Info */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {model.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {model.description || "Professional AI model for high-quality image generation"}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {model.category}
                  </Badge>
                  {model.provider && (
                    <Badge variant="outline" className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                      {model.provider}
                    </Badge>
                  )}
                  {model.featured && (
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>{modelLikes} likes</span>
                  <span>{modelBookmarks} bookmarks</span>
                  <span>{totalGenerations} images generated</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <TabsTrigger value="gallery" className="rounded-lg">Gallery</TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="mt-6">
            {generatedImages && generatedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {generatedImages.map((image: any, index: number) => (
                  <div key={image.id} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
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
                  <Link href={`/generate?model=${model.modelId}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Generate First Image
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Model Performance (Authentic Data)
                </h3>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{modelLikes}</div>
                    <div className="text-sm text-gray-500">Total Likes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{modelBookmarks}</div>
                    <div className="text-sm text-gray-500">Bookmarked</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{totalGenerations}</div>
                    <div className="text-sm text-gray-500">Images Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}