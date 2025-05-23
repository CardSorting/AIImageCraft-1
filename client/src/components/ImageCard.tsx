import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Share2, 
  Copy, 
  Heart, 
  Eye,
  Clock,
  Palette,
  ExternalLink,
  Info
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

interface ImageCardProps {
  image: GeneratedImage;
}

export function ImageCard({ image }: ImageCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
        description: "Your artwork is being saved to your device",
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
          text: image.prompt,
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

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowModal(true)}
      >
        <CardContent className="p-0">
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <img
              src={image.imageUrl}
              alt={image.prompt}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-110' : 'scale-100'}`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(true)}
            />
            
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Hover Overlay */}
            <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            } flex items-center justify-center`}>
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-gray-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-gray-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(image.imageUrl, `ai-art-${image.id}.png`);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-gray-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(image.imageUrl);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Time Badge */}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/50 text-white border-none">
                {formatTimeAgo(image.createdAt)}
              </Badge>
            </div>
          </div>

          {/* Card Footer */}
          <div className="p-3">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {image.prompt}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Palette className="h-3 w-3" />
                <span>{image.model || 'Runware'}</span>
              </span>
              <span>
                {image.dimensions ? 
                  `${image.dimensions.width}×${image.dimensions.height}` : 
                  '512×512'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>AI Generated Artwork</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Display */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(image.imageUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full Size
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(image.imageUrl, `ai-art-${image.id}.png`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare(image.imageUrl)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Image Information */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Generation Details</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prompt</label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-1">
                      {image.prompt}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Model</label>
                  <p className="text-sm font-medium mt-1">{image.model || 'Runware'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dimensions</label>
                  <p className="text-sm font-medium mt-1">
                    {image.dimensions ? 
                      `${image.dimensions.width} × ${image.dimensions.height}` : 
                      '512 × 512'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm font-medium mt-1">{formatTimeAgo(image.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Format</label>
                  <p className="text-sm font-medium mt-1">PNG</p>
                </div>
              </div>

              {image.cost && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Generation Cost</label>
                    <p className="text-sm font-medium mt-1">${image.cost.toFixed(4)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}