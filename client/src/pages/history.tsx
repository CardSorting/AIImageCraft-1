import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type GeneratedImage } from "@shared/schema";
import { Clock, Calendar, Trash2, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: images = [], isLoading } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images/my"],
  });

  const filteredImages = images.filter(image => 
    image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group images by date
  const groupedImages = filteredImages.reduce((groups, image) => {
    const date = new Date(image.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(image);
    return groups;
  }, {} as Record<string, GeneratedImage[]>);

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
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mr-4">
            <Clock className="text-primary-foreground w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">History</h1>
            <p className="text-muted-foreground">Your creation timeline</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search your history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-ios pl-10"
          />
        </div>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="card-ios p-8 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock className="text-primary-foreground w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Loading History</h3>
          <p className="text-muted-foreground">Fetching your timeline...</p>
        </div>
      )}

      {/* History Timeline */}
      {!isLoading && Object.keys(groupedImages).length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedImages)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, dayImages]) => (
              <div key={date} className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center space-x-3 px-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">
                    {dayImages.length} {dayImages.length === 1 ? 'image' : 'images'}
                  </span>
                </div>

                {/* Images for this date */}
                <div className="space-y-3">
                  {dayImages
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((image) => (
                      <div key={image.id} className="card-ios group">
                        <div className="flex items-start space-x-4 p-4">
                          {/* Thumbnail */}
                          <div className="w-16 h-16 overflow-hidden rounded-xl flex-shrink-0">
                            <img 
                              src={image.imageUrl} 
                              alt={image.prompt}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground line-clamp-2 mb-2">{image.prompt}</p>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(new Date(image.createdAt))}</span>
                              <span>•</span>
                              <span>{image.aspectRatio}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button 
                              onClick={() => downloadImage(image.imageUrl, image.fileName || undefined)}
                              className="btn-ios-ghost p-2 haptic-light opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && Object.keys(groupedImages).length === 0 && (
        <div className="card-ios p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Clock className="text-muted-foreground w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery ? "No history found" : "No history yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Start creating images to build your history"
            }
          </p>
        </div>
      )}
    </div>
  );
}