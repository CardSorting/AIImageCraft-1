import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Star, 
  Download, 
  Heart, 
  Share2, 
  Play, 
  Info,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Brain,
  Zap,
  Camera,
  Palette,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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
  const [, setLocation] = useLocation();
  const [isLiked, setIsLiked] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: model, isLoading, error } = useQuery({
    queryKey: ["/api/models", id],
    queryFn: () => fetch(`/api/models/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K`;
    return downloads.toString();
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
        // Fallback to clipboard
        handleCopy(window.location.href, "Model link");
      }
    } else {
      handleCopy(window.location.href, "Model link");
    }
  };

  const handleTryModel = () => {
    // Navigate to generate page with this model pre-selected
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
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
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

  const categoryIcon = categoryIcons[model.category as keyof typeof categoryIcons] || Brain;
  const Icon = categoryIcon;
  const pricing = model.pricing ? JSON.parse(model.pricing) : null;

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
          {/* Hero Section */}
          <div className="p-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 mb-4">
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
              
              {/* Floating Actions */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="ios-floating-button"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              {/* Featured Badge */}
              {model.featured === 1 && (
                <div className="absolute top-4 left-4">
                  <Badge className="ios-badge bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}
            </div>

            {/* Model Title & Stats */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {model.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {model.description}
                  </p>
                </div>
              </div>

              {/* Provider & Version */}
              <div className="flex items-center space-x-4 mb-3">
                <Badge variant="outline" className="ios-badge">
                  {model.provider}
                </Badge>
                <Badge variant="secondary" className="ios-badge">
                  v{model.version}
                </Badge>
                <Badge variant="outline" className="ios-badge">
                  <Icon className="h-3 w-3 mr-1" />
                  {model.category}
                </Badge>
              </div>

              {/* Stats Row */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                {model.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(model.rating / 20).toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>{formatDownloads(model.downloads || 0)} uses</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mb-6">
              <Button 
                className="flex-1 ios-button bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleTryModel}
              >
                <Play className="h-4 w-4 mr-2" />
                Try Model
              </Button>
              <Button 
                variant="outline" 
                className="ios-button"
                onClick={() => handleCopy(model.modelId, "Model ID")}
              >
                {copiedText === model.modelId ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="px-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 ios-tab-list">
                <TabsTrigger value="overview" className="ios-tab">Overview</TabsTrigger>
                <TabsTrigger value="gallery" className="ios-tab">Gallery</TabsTrigger>
                <TabsTrigger value="details" className="ios-tab">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Model ID Card */}
                <Card className="ios-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Model Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Model ID</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {model.modelId}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(model.modelId, "Model ID")}
                        >
                          {copiedText === model.modelId ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Provider</span>
                      <span className="font-medium">{model.provider}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Category</span>
                      <span className="font-medium">{model.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Version</span>
                      <span className="font-medium">v{model.version}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Capabilities */}
                {model.capabilities && model.capabilities.length > 0 && (
                  <Card className="ios-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Capabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-2">
                        {model.capabilities.map((capability, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-sm">{capability}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {model.tags && model.tags.length > 0 && (
                  <Card className="ios-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {model.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="ios-tag">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="gallery" className="mt-4">
                {model.gallery && model.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {model.gallery.map((image, index) => (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${model.name} example ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="ios-card">
                    <CardContent className="text-center py-8">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        No gallery images
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Gallery images will appear here when available.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-4 space-y-4">
                {/* Technical Details */}
                <Card className="ios-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created</span>
                      <span className="font-medium">
                        {new Date(model.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                      <span className="font-medium">
                        {new Date(model.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Uses</span>
                      <span className="font-medium">{formatDownloads(model.downloads || 0)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing Information */}
                {pricing && (
                  <Card className="ios-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(pricing, null, 2)}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}