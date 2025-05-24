import { useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { type GeneratedImage } from "@shared/schema";
import { useRandomizedImageFeed } from "../hooks/useRandomizedImageFeed";

export default function SimpleHome() {
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Use the sophisticated randomized image feed hook
  const {
    currentImage,
    currentIndex,
    totalImages,
    remainingCount,
    isLoading,
    error,
    goToNext,
    goToPrevious,
    goToIndex,
    sessionId
  } = useRandomizedImageFeed({
    autoMarkAsViewed: true, // Automatically mark images as viewed
    maxImages: 50 // Load up to 50 random images at a time
  });

  // Handle scroll to navigate between images with throttling
  useEffect(() => {
    const handleWheel = async (e: WheelEvent) => {
      e.preventDefault();
      
      // Prevent rapid scrolling
      if (isScrolling.current) return;
      
      isScrolling.current = true;
      
      if (e.deltaY > 0) {
        // Scroll down - go to next random image
        await goToNext();
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // Scroll up - go to previous image
        goToPrevious();
      }
      
      // Reset scroll throttle after animation completes
      setTimeout(() => {
        isScrolling.current = false;
      }, 700); // Match the transition duration
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [currentIndex, goToNext, goToPrevious]);

  // Handle touch gestures for mobile with throttling
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;
    let isTouchScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (isTouchScrolling) return;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = async (e: TouchEvent) => {
      if (isTouchScrolling) return;
      
      touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) { // Minimum swipe distance
        isTouchScrolling = true;
        
        if (diff > 0) {
          // Swipe up - next random image
          await goToNext();
        } else if (diff < 0 && currentIndex > 0) {
          // Swipe down - previous image
          goToPrevious();
        }
        
        // Reset touch throttle after animation completes
        setTimeout(() => {
          isTouchScrolling = false;
        }, 700);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [currentIndex, goToNext, goToPrevious]);

  // Handle image click to navigate to create page with metadata
  const handleImageClick = (image: GeneratedImage) => {
    // Create URL with the image metadata as query parameters
    const params = new URLSearchParams({
      prompt: image.prompt || '',
      model: image.modelId || '',
      aspectRatio: image.aspectRatio || '1:1'
    });
    
    navigate(`/generate?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading random images...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-white/60 mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentImage) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">No images yet</h2>
        <p className="text-white/60 mb-8">Create your first AI image to get started</p>
        <button 
          onClick={() => navigate('/generate')}
          className="px-6 py-3 bg-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Start Creating
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-black overflow-hidden relative"
    >
      {/* Current Image Display */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer"
        onClick={() => handleImageClick(currentImage)}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={currentImage.imageUrl}
            alt={currentImage.prompt || 'AI Generated Image'}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Subtle overlay with prompt hint */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-6">
            <p className="text-white/80 text-sm line-clamp-2 max-w-2xl">
              "{currentImage.prompt}"
            </p>
            <p className="text-white/50 text-xs mt-2">
              Click to recreate with these settings
            </p>
          </div>
        </div>
      </div>

      {/* Navigation indicators - showing progress through unique images */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-10">
        {Array.from({ length: Math.min(totalImages, 10) }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
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

      {/* Progress info */}
      <div className="absolute top-4 left-4 text-white/60 text-xs z-10">
        <div>Session: {sessionId.slice(0, 8)}...</div>
        <div>Remaining: {remainingCount} unique images</div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm z-10">
        Scroll or swipe to discover unique images
      </div>
    </div>
  );
}