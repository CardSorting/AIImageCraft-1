import { useQuery } from "@tanstack/react-query";
import { type GeneratedImage } from "@shared/schema";
import { User, Image, Clock, Palette, Settings, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { data: images = [] } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images"],
  });

  const totalImages = images.length;
  const recentImages = images.slice(0, 6);
  
  // Calculate some stats
  const aspectRatios = images.reduce((acc, img) => {
    acc[img.aspectRatio] = (acc[img.aspectRatio] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const favoriteRatio = Object.entries(aspectRatios)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "1:1";

  const stats = [
    {
      label: "Images Created",
      value: totalImages.toString(),
      icon: Image,
      color: "text-primary",
    },
    {
      label: "Favorite Ratio",
      value: favoriteRatio,
      icon: Palette,
      color: "text-green-500",
    },
    {
      label: "This Week",
      value: images.filter(img => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(img.createdAt) > weekAgo;
      }).length.toString(),
      icon: Clock,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="container-responsive py-6">
      {/* Profile Header */}
      <header className="text-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <User className="text-primary-foreground w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Creative Studio</h1>
        <p className="text-muted-foreground text-lg">AI Image Artist</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card-ios p-6 text-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
              stat.color === "text-primary" ? "bg-primary/10" :
              stat.color === "text-green-500" ? "bg-green-500/10" :
              "bg-blue-500/10"
            }`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Work */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Work</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>
        
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentImages.map((image) => (
              <div key={image.id} className="card-ios group">
                <div className="aspect-square overflow-hidden rounded-t-2xl">
                  <img 
                    src={image.imageUrl} 
                    alt={image.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-foreground line-clamp-2">{image.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-ios p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Image className="text-muted-foreground w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No images yet</h3>
            <p className="text-muted-foreground">Start creating to see your work here</p>
          </div>
        )}
      </section>

      {/* Profile Actions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Profile</h2>
        
        <div className="card-ios">
          <button className="list-item-ios w-full text-left">
            <Settings className="h-5 w-5 text-muted-foreground mr-3" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Settings</div>
              <div className="text-sm text-muted-foreground">Preferences and options</div>
            </div>
          </button>
          
          <button className="list-item-ios w-full text-left">
            <Download className="h-5 w-5 text-muted-foreground mr-3" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Export Gallery</div>
              <div className="text-sm text-muted-foreground">Download all your images</div>
            </div>
          </button>
          
          <button className="list-item-ios w-full text-left">
            <Share className="h-5 w-5 text-muted-foreground mr-3" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Share Profile</div>
              <div className="text-sm text-muted-foreground">Show your creations</div>
            </div>
          </button>
        </div>
      </section>

      {/* App Info */}
      <section className="mt-8 pt-6 border-t border-border/50">
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>AI Studio v1.0</p>
          <p>Powered by Google Imagen 4</p>
          <p className="text-xs">Made with ❤️ for creators</p>
        </div>
      </section>
    </div>
  );
}