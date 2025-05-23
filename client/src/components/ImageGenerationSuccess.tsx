import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Share2, 
  Copy, 
  Sparkles, 
  Heart, 
  Eye,
  Clock,
  Palette,
  Settings,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  model?: string;
  dimensions?: { width: number; height: number };
  createdAt?: string;
  cost?: number;
}

interface ImageGenerationSuccessProps {
  images: GeneratedImage[];
  prompt: string;
  generationTime?: number;
  onNewGeneration: () => void;
  onViewGallery: () => void;
}

export function ImageGenerationSuccess({
  images,
  prompt,
  generationTime,
  onNewGeneration,
  onViewGallery
}: ImageGenerationSuccessProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started! 📥",
        description: "Your masterpiece is being saved to your device",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AI Generated Art',
          text: prompt,
          url: imageUrl,
        });
      } catch (error) {
        copyToClipboard(imageUrl);
      }
    } else {
      copyToClipboard(imageUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied! 📋",
      description: "Image URL copied to clipboard",
    });
  };

  const formatTime = (ms?: number) => {
    if (!ms) return "Lightning fast";
    return ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  };

  const currentImage = images[selectedImage];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center space-y-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Masterpiece Created! ✨
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI artwork has been generated successfully. Every detail crafted with precision and creativity.
        </p>
        
        {/* Generation Stats */}
        <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(generationTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Palette className="h-4 w-4" />
            <span>{images.length} image{images.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="h-4 w-4" />
            <span>AI Generated</span>
          </div>
        </div>
      </div>

      {/* Main Image Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {currentImage && (
                <img
                  src={currentImage.imageUrl}
                  alt={prompt}
                  className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                    isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageLoaded(true)}
                />
              )}
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            
            {/* Image Overlay Actions */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-900"
                onClick={() => window.open(currentImage?.imageUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-900"
                onClick={() => currentImage && handleDownload(currentImage.imageUrl, `ai-art-${currentImage.id}.png`)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-900"
                onClick={() => currentImage && handleShare(currentImage.imageUrl)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Multiple Images Indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-2 bg-black/50 rounded-full px-3 py-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImage(index);
                        setIsImageLoaded(false);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === selectedImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Generated Prompt</h3>
            <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              {prompt}
            </p>
          </div>

          {currentImage && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Model</span>
                <p className="font-medium">{currentImage.model || 'Runware'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Dimensions</span>
                <p className="font-medium">
                  {currentImage.dimensions ? 
                    `${currentImage.dimensions.width}×${currentImage.dimensions.height}` : 
                    '512×512'
                  }
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Generated</span>
                <p className="font-medium">Just now</p>
              </div>
              <div>
                <span className="text-muted-foreground">Format</span>
                <p className="font-medium">PNG</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onNewGeneration}
          className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Create Another Masterpiece
        </Button>
        <Button 
          variant="outline" 
          onClick={onViewGallery}
          className="flex-1 h-14 text-lg font-semibold"
        >
          <Eye className="h-5 w-5 mr-2" />
          View Gallery
        </Button>
      </div>

      {/* Thumbnail Strip for Multiple Images */}
      {images.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">All Generated Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    setIsImageLoaded(false);
                  }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedImage 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}