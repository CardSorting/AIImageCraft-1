import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Download, Share2, Sparkles, Star, Crown, Gem, 
  Zap, Info, ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TradingCardImage {
  id: string;
  imageUrl: string;
  prompt: string;
  model?: string;
  dimensions?: { width: number; height: number };
  createdAt?: string;
  rarityTier: string;
  rarityScore: number;
  rarityStars: number;
  rarityLetter: string;
}

interface TradingCardProps {
  image: TradingCardImage;
  isNewest?: boolean;
}

const RARITY_CONFIGS = {
  COMMON: {
    name: 'Common',
    colors: {
      primary: 'from-gray-400 to-gray-600',
      border: 'border-gray-400',
      glow: 'shadow-gray-400/20',
      text: 'text-gray-700 dark:text-gray-300'
    },
    icon: Star,
    effects: { holographic: false, sparkles: false }
  },
  UNCOMMON: {
    name: 'Uncommon', 
    colors: {
      primary: 'from-green-400 to-emerald-600',
      border: 'border-green-400',
      glow: 'shadow-green-400/30',
      text: 'text-green-700 dark:text-green-300'
    },
    icon: Star,
    effects: { holographic: false, sparkles: false }
  },
  RARE: {
    name: 'Rare',
    colors: {
      primary: 'from-blue-400 to-blue-600',
      border: 'border-blue-400',
      glow: 'shadow-blue-400/40',
      text: 'text-blue-700 dark:text-blue-300'
    },
    icon: Zap,
    effects: { holographic: false, sparkles: true }
  },
  EPIC: {
    name: 'Epic',
    colors: {
      primary: 'from-purple-400 to-purple-600',
      border: 'border-purple-400',
      glow: 'shadow-purple-400/50',
      text: 'text-purple-700 dark:text-purple-300'
    },
    icon: Gem,
    effects: { holographic: true, sparkles: true }
  },
  LEGENDARY: {
    name: 'Legendary',
    colors: {
      primary: 'from-yellow-400 to-orange-500',
      border: 'border-yellow-400',
      glow: 'shadow-yellow-400/60',
      text: 'text-yellow-700 dark:text-yellow-300'
    },
    icon: Crown,
    effects: { holographic: true, sparkles: true }
  },
  MYTHIC: {
    name: 'Mythic',
    colors: {
      primary: 'from-red-400 to-pink-500',
      border: 'border-red-400',
      glow: 'shadow-red-400/70',
      text: 'text-red-700 dark:text-red-300'
    },
    icon: Sparkles,
    effects: { holographic: true, sparkles: true }
  }
};

export function TradingCard({ image, isNewest = false }: TradingCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { toast } = useToast();

  const rarity = RARITY_CONFIGS[image.rarityTier as keyof typeof RARITY_CONFIGS] || RARITY_CONFIGS.COMMON;
  const IconComponent = rarity.icon;

  useEffect(() => {
    if (isNewest && rarity.effects.sparkles) {
      const timer = setTimeout(() => {
        // Celebration effect for rare cards
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isNewest, rarity.effects.sparkles]);

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
        description: "Your collectible card is being saved",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${rarity.name} AI Art Card`,
          text: `Check out my ${image.rarityLetter}${image.rarityStars}★ ${rarity.name} card: ${image.prompt}`,
          url: imageUrl,
        });
      } catch (error) {
        navigator.clipboard.writeText(imageUrl);
        toast({
          title: "Copied! 📋",
          description: "Card URL copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(imageUrl);
      toast({
        title: "Copied! 📋",
        description: "Card URL copied to clipboard",
      });
    }
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
      {/* Trading Card */}
      <div
        className={`relative group cursor-pointer transform transition-all duration-500 hover:scale-105 ${
          isNewest ? 'animate-pulse' : ''
        } ${rarity.effects.holographic ? 'animate-pulse' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowModal(true)}
      >
        {/* Card Frame with Y2K Aesthetic */}
        <div className={`
          relative p-2 rounded-2xl 
          bg-gradient-to-br ${rarity.colors.primary}
          ${rarity.colors.border} border-2
          shadow-2xl ${rarity.colors.glow}
          ${rarity.effects.holographic ? 'bg-holographic' : ''}
          overflow-hidden
        `}>
          
          {/* Holographic Overlay */}
          {rarity.effects.holographic && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
          )}

          {/* Card Content */}
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-0 shadow-none rounded-xl overflow-hidden">
            <CardContent className="p-0">
              
              {/* Header with Rarity Info */}
              <div className={`p-3 bg-gradient-to-r ${rarity.colors.primary} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5" />
                    <span className="font-bold text-lg">
                      {image.rarityLetter}{image.rarityStars}★
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: image.rarityStars }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-xs opacity-90 mt-1">
                  {rarity.name} • Score: {image.rarityScore}
                </div>
              </div>

              {/* Image Display */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  } ${isHovered ? 'scale-110' : 'scale-100'}`}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageLoaded(true)}
                />
                
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                      className="bg-white/90 hover:bg-white text-gray-900 rounded-full"
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
                      className="bg-white/90 hover:bg-white text-gray-900 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image.imageUrl, `card-${image.rarityLetter}${image.rarityStars}-${image.id}.png`);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white text-gray-900 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(image.imageUrl);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Sparkles Effect */}
                {rarity.effects.sparkles && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 right-2 animate-ping">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="absolute bottom-2 left-2 animate-ping delay-300">
                      <Sparkles className="h-3 w-3 text-blue-400" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping delay-700">
                      <Sparkles className="h-2 w-2 text-purple-400" />
                    </div>
                  </div>
                )}

                {/* NEW Badge for Latest */}
                {isNewest && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-bounce shadow-lg">
                      ✨ NEW
                    </Badge>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-3 space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-tight">
                  {image.prompt}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${rarity.colors.text}`}>
                    {image.model || 'Runware'}
                  </span>
                  <span className="text-muted-foreground">
                    {formatTimeAgo(image.createdAt)}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <IconComponent className="h-6 w-6" />
              <span>{rarity.name} Trading Card</span>
              <div className="flex items-center space-x-1 ml-2">
                {Array.from({ length: image.rarityStars }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Display */}
            <div className="space-y-4">
              <div className={`
                aspect-square rounded-2xl overflow-hidden
                bg-gradient-to-br ${rarity.colors.primary}
                p-2 ${rarity.colors.border} border-2
                shadow-2xl ${rarity.colors.glow}
              `}>
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => window.open(image.imageUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Size
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => handleDownload(image.imageUrl, `card-${image.rarityLetter}${image.rarityStars}-${image.id}.png`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => handleShare(image.imageUrl)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Card Information */}
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${rarity.colors.primary} text-white`}>
                <h3 className="font-bold text-lg mb-2">Card Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="opacity-90">Rarity:</span>
                    <p className="font-bold">{image.rarityLetter}{image.rarityStars}★ {rarity.name}</p>
                  </div>
                  <div>
                    <span className="opacity-90">Score:</span>
                    <p className="font-bold">{image.rarityScore}/100</p>
                  </div>
                  <div>
                    <span className="opacity-90">Model:</span>
                    <p className="font-bold">{image.model || 'Runware'}</p>
                  </div>
                  <div>
                    <span className="opacity-90">Created:</span>
                    <p className="font-bold">{formatTimeAgo(image.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Prompt</h3>
                <p className="text-sm bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  {image.prompt}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Dimensions:</span>
                  <p className="font-medium">
                    {image.dimensions ? 
                      `${image.dimensions.width} × ${image.dimensions.height}` : 
                      '512 × 512'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p className="font-medium">PNG</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}