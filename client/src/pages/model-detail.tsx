import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Star, 
  Share2, 
  Play, 
  Brain,
  Zap,
  Camera,
  Palette,
  Sparkles,
  User,
  Clock,
  ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { AIModel } from "@shared/schema";

interface ModelImage {
  id: number;
  imageUrl: string;
  prompt: string;
  username: string;
  createdAt: string;
  rarityTier: string;
  rarityStars: number;
}

const categoryIcons = {
  "General": Brain,
  "Speed": Zap,
  "Latest": Sparkles,
  "Photorealistic": Camera,
  "Artistic": Palette,
} as const;

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: model, isLoading, error } = useQuery({
    queryKey: ["/api/models", id],
    queryFn: () => fetch(`/api/models/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  // Fetch images generated with this model
  const { data: modelImages = [] } = useQuery({
    queryKey: ["/api/models", model?.modelId, "images"],
    queryFn: () => fetch(`/api/models/${model?.modelId}/images`).then(res => res.json()),
    enabled: !!model?.modelId,
  });

  const handleShare = async () => {
    if (navigator.share && model) {
      try {
        await navigator.share({
          title: model.name,
          text: model.description,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Copied!",
          description: "Model link copied to clipboard",
        });
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Copied!",
        description: "Model link copied to clipboard",
      });
    }
  };

  const handleTryModel = () => {
    setLocation(`/generate?model=${encodeURIComponent(model?.modelId || '')}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="ios-header">
          <Button variant="ghost" size="sm" className="ios-back-button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="w-8" />
        </div>
        <div className="p-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Model not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The model you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/models">
            <Button className="ios-button">Browse Models</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* iOS-style Header */}
      <div className="ios-header sticky top-0 z-50">
        <Link href="/models">
          <Button variant="ghost" size="sm" className="ios-back-button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="font-semibold text-gray-900 dark:text-white truncate">
          {model.name}
        </h1>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ios-button"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-60px)]">
        <div className="pb-20">
          {/* Model Card and Try Button */}
          <div className="p-4">
            {/* Model Preview Card */}
            <Card className="ios-card mb-4">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex-shrink-0">
                    {model.thumbnail ? (
                      <img 
                        src={model.thumbnail} 
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Brain className="h-8 w-8 text-blue-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {model.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {model.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {model.provider}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {model.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Try Model Button */}
            <Button 
              className="w-full ios-button bg-blue-500 hover:bg-blue-600 text-white mb-6"
              onClick={handleTryModel}
            >
              <Play className="h-4 w-4 mr-2" />
              Try Model
            </Button>
          </div>

          {/* Gallery Section */}
          <div className="px-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Gallery ({modelImages.length} images)
              </h3>
            </div>
            
            {modelImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modelImages.map((image: ModelImage) => (
                  <Card key={image.id} className="ios-card overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={image.imageUrl} 
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          "{image.prompt}"
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {image.username}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: image.rarityStars }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              image.rarityTier === 'LEGENDARY' ? 'bg-orange-500 text-white' :
                              image.rarityTier === 'EPIC' ? 'bg-purple-500 text-white' :
                              image.rarityTier === 'RARE' ? 'bg-blue-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}
                          >
                            {image.rarityTier}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(image.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="ios-card">
                <CardContent className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    No images generated yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Be the first to create something amazing with this model!
                  </p>
                  <Button 
                    className="ios-button bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleTryModel}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Generate First Image
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}