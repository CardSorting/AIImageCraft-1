import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type GeneratedImage } from "@shared/schema";
import { Download, Search, Filter, Grid3X3, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TradingCard } from "@/components/TradingCard";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const { data: images = [], isLoading } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images/my"],
  });

  const filteredImages = images.filter(image => 
    image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadImage = async (imageUrl: string, fileName?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download Started",
        description: "Image saved to your downloads folder.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openImageModal = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="container-responsive py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gallery</h1>
        <p className="text-muted-foreground">Your AI-generated masterpieces</p>
      </header>

      {/* Search and Controls */}
      <div className="card-ios p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search your images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-ios pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`btn-ios-ghost p-2 ${viewMode === "grid" ? "text-primary" : ""}`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`btn-ios-ghost p-2 ${viewMode === "list" ? "text-primary" : ""}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card-ios p-8 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Search className="text-primary-foreground w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Loading Gallery</h3>
          <p className="text-muted-foreground">Fetching your creations...</p>
        </div>
      )}

      {/* Gallery Grid */}
      {!isLoading && filteredImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <TradingCard
              key={image.id}
              image={{
                id: image.id.toString(),
                imageUrl: image.imageUrl,
                prompt: image.prompt,
                model: 'Runware',
                dimensions: { width: 512, height: 512 },
                createdAt: image.createdAt,
                rarityTier: (image as any).rarityTier || 'COMMON',
                rarityScore: (image as any).rarityScore || 50,
                rarityStars: (image as any).rarityStars || 1,
                rarityLetter: (image as any).rarityLetter || 'S',
              }}
              isNewest={false}
            />
          ))}
        </div>
      )}

      {/* List View (keeping for completeness but hidden in favor of trading cards) */}
      {false && (
        <div className="space-y-4">
          {filteredImages.map((image) => (
            <div key={image.id} className="card-ios group hover:scale-[1.02] transition-transform duration-200">
              {viewMode === "list" && (
                <div className="flex items-center space-x-4 p-4">
                  <div className="w-16 h-16 overflow-hidden rounded-xl flex-shrink-0">
                    <img 
                      src={image.imageUrl} 
                      alt={image.prompt}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openImageModal(image)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 mb-1">{image.prompt}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(new Date(image.createdAt))}</p>
                  </div>
                  <button 
                    onClick={() => downloadImage(image.imageUrl, image.fileName || undefined)}
                    className="btn-ios-ghost p-2 haptic-light flex-shrink-0"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredImages.length === 0 && (
        <div className="card-ios p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Search className="text-muted-foreground w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery ? "No images found" : "No images yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Start creating amazing AI images to build your gallery"
            }
          </p>
        </div>
      )}

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="card-ios-elevated max-w-4xl p-0 overflow-hidden">
          {selectedImage && (
            <>
              <div className="aspect-video overflow-hidden">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.prompt}
                  className="w-full h-full object-contain bg-muted"
                />
              </div>
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-foreground mb-2">
                    {selectedImage.prompt}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    {formatTimeAgo(new Date(selectedImage.createdAt))}
                  </span>
                  <Button 
                    onClick={() => downloadImage(selectedImage.imageUrl, selectedImage.fileName || undefined)}
                    className="btn-ios-primary haptic-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}