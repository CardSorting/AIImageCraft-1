import { useState, useEffect, useRef } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { generateImageRequestSchema, type GeneratedImage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share, Download, MoreHorizontal, Play, Volume2, VolumeX } from "lucide-react";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

interface FeedItem {
  id: number;
  prompt: string;
  imageUrl: string;
  aspectRatio: string;
  createdAt: Date;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  isLiked: boolean;
  description: string;
}

interface ForYouFeedProps {
  onNavigationClick: (itemId: string) => void;
  activeNavItem: string;
}

export default function ForYouFeed() {
  const [activeNavItem, setActiveNavItem] = useState("for-you");
  
  const handleNavigationClick = (itemId: string) => {
    setActiveNavItem(itemId);
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mock feed data - in real app this would come from API
  const mockFeedData: FeedItem[] = [
    {
      id: 1,
      prompt: "A mystical forest with glowing mushrooms and ethereal light rays piercing through ancient trees",
      imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&h=800&fit=crop",
      aspectRatio: "9:16",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      creator: {
        id: "1",
        name: "Sarah Chen",
        username: "@sarahcreates",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b69c?w=100&h=100&fit=crop&crop=face",
        isVerified: true
      },
      stats: { likes: 12500, comments: 842, shares: 156, views: 89000 },
      isLiked: false,
      description: "Lost in the magic of AI-generated worlds ✨🍄"
    },
    {
      id: 2,
      prompt: "Cyberpunk cityscape at night with neon lights reflecting in rain-soaked streets",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=800&fit=crop",
      aspectRatio: "9:16", 
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      creator: {
        id: "2",
        name: "Alex Rivera",
        username: "@alexvision",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        isVerified: false
      },
      stats: { likes: 8900, comments: 423, shares: 89, views: 45000 },
      isLiked: true,
      description: "The future is here 🤖⚡ #cyberpunk #aiart"
    },
    {
      id: 3,
      prompt: "Serene mountain lake at sunset with golden reflections and snow-capped peaks",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=800&fit=crop",
      aspectRatio: "9:16",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      creator: {
        id: "3",
        name: "Maya Patel",
        username: "@mayascapes",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        isVerified: true
      },
      stats: { likes: 15600, comments: 1200, shares: 234, views: 120000 },
      isLiked: false,
      description: "Nature's perfect mirror 🏔️✨ Generated with love"
    }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleScroll = (direction: 'up' | 'down') => {
    const newIndex = direction === 'down' 
      ? Math.min(currentIndex + 1, mockFeedData.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    setCurrentIndex(newIndex);
    
    // Smooth scroll to the item
    itemRefs.current[newIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleLike = (itemId: number) => {
    // In real app, this would trigger a mutation
    console.log(`Liked item ${itemId}`);
  };

  const handleShare = (item: FeedItem) => {
    // In real app, this would open share modal
    console.log(`Sharing item ${item.id}`);
  };

  const handleComment = (itemId: number) => {
    // In real app, this would open comments modal
    console.log(`Opening comments for item ${itemId}`);
  };

  const handleDownload = (item: FeedItem) => {
    // In real app, this would trigger download
    console.log(`Downloading item ${item.id}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Header */}
      <NavigationHeader 
        credits={1250}
        onNavigationClick={handleNavigationClick}
        activeItem={activeNavItem}
      />

      {/* TikTok-style Feed Container */}
      <div 
        ref={containerRef}
        className="relative h-[calc(100vh-4rem)] overflow-hidden"
      >
        {mockFeedData.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => itemRefs.current[index] = el}
            className={`
              absolute inset-0 transition-transform duration-500 ease-out
              ${index === currentIndex ? 'translate-y-0' : 
                index < currentIndex ? '-translate-y-full' : 'translate-y-full'
              }
            `}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={item.imageUrl}
                alt={item.prompt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>

            {/* Content Overlay */}
            <div className="relative h-full flex">
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col justify-end p-4 pb-6">
                {/* Creator Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12 border-2 border-white/20">
                    <AvatarImage src={item.creator.avatar} />
                    <AvatarFallback>{item.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{item.creator.username}</span>
                      {item.creator.isVerified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <span className="text-white/60 text-sm">{formatTimeAgo(item.createdAt)}</span>
                  </div>
                  
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-semibold"
                  >
                    Follow
                  </Button>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-white text-base leading-relaxed mb-2">
                    {item.description}
                  </p>
                  <p className="text-white/70 text-sm line-clamp-2">
                    "{item.prompt}"
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-white/80 text-sm">
                  <span>{formatNumber(item.stats.views)} views</span>
                  <span>•</span>
                  <span>{formatNumber(item.stats.likes)} likes</span>
                  <span>•</span>
                  <span>{formatNumber(item.stats.comments)} comments</span>
                </div>
              </div>

              {/* Action Buttons - TikTok Style */}
              <div className="flex flex-col items-center justify-end space-y-6 p-4 pb-6">
                {/* Like Button */}
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(item.id)}
                    className={`
                      w-12 h-12 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95
                      ${item.isLiked 
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                      }
                    `}
                  >
                    <Heart className={`h-6 w-6 ${item.isLiked ? 'fill-current' : ''}`} />
                  </Button>
                  <span className="text-white text-xs mt-1">{formatNumber(item.stats.likes)}</span>
                </div>

                {/* Comment Button */}
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleComment(item.id)}
                    className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-110 active:scale-95"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <span className="text-white text-xs mt-1">{formatNumber(item.stats.comments)}</span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(item)}
                    className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-110 active:scale-95"
                  >
                    <Share className="h-6 w-6" />
                  </Button>
                  <span className="text-white text-xs mt-1">{formatNumber(item.stats.shares)}</span>
                </div>

                {/* Download Button */}
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(item)}
                    className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-110 active:scale-95"
                  >
                    <Download className="h-6 w-6" />
                  </Button>
                </div>

                {/* More Options */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  <MoreHorizontal className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Indicators */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          {mockFeedData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-1 h-8 rounded-full transition-all duration-200
                ${index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/30 hover:bg-white/50'
                }
              `}
            />
          ))}
        </div>

        {/* Scroll Controls */}
        <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2 flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleScroll('up')}
            disabled={currentIndex === 0}
            className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleScroll('down')}
            disabled={currentIndex === mockFeedData.length - 1}
            className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
          >
            ↓
          </Button>
        </div>
      </div>
    </div>
  );
}