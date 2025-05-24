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
    sessionId,
    imageFeed
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
    <>
      {/* Mobile Layout - Full Screen Single Image */}
      <div 
        ref={containerRef}
        className="min-h-screen bg-black overflow-hidden relative md:hidden"
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
              className="w-full h-full object-cover"
            />
            
            {/* Subtle overlay with prompt hint */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4">
              <p className="text-white/90 text-sm line-clamp-2">
                "{currentImage.prompt}"
              </p>
              <p className="text-white/60 text-xs mt-1">
                Tap to recreate
              </p>
            </div>
          </div>
        </div>

        {/* Navigation indicators - mobile */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 z-10">
          {Array.from({ length: Math.min(totalImages, 8) }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`
                w-1 h-6 rounded-full transition-all duration-200
                ${index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/40 hover:bg-white/60'
                }
              `}
            />
          ))}
        </div>

        {/* Progress info - mobile */}
        <div className="absolute top-4 left-4 text-white/70 text-xs z-10 bg-black/30 rounded-lg px-2 py-1">
          <div>{remainingCount} unique left</div>
        </div>

        {/* Swipe hint - mobile */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-xs z-10">
          Swipe up for next unique image
        </div>
      </div>

      {/* Desktop Layout - Masonry Grid */}
      <div className="hidden md:block min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Discover Unique AI Art
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Session: {sessionId.slice(0, 8)}... • {remainingCount} unique images remaining
            </p>
          </div>

          {/* True Masonry Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 auto-rows-[10px]">
            {/* Actual Images */}
            {imageFeed && imageFeed.images.map((image, index) => {
              if (!image) return null;

              // Calculate random span for masonry effect
              const spanOptions = [20, 25, 30, 35, 40, 45, 50];
              const randomSpan = spanOptions[index % spanOptions.length];

              return (
                <div
                  key={image.id}
                  className="group cursor-pointer"
                  style={{ gridRowEnd: `span ${randomSpan}` }}
                  onClick={() => handleImageClick(image)}
                >
                  <div className="relative h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt || 'AI Generated Image'}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs line-clamp-2 mb-1">
                          "{image.prompt}"
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-xs">
                            Click to recreate
                          </span>
                          {index === currentIndex && (
                            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Skeleton Loading Cards to Fill Space */}
            {imageFeed && imageFeed.images.length > 0 && imageFeed.images.length < 30 && 
              Array.from({ length: 30 - imageFeed.images.length }).map((_, index) => {
                const spanOptions = [20, 25, 30, 35, 40, 45, 50];
                const randomSpan = spanOptions[index % spanOptions.length];
                
                return (
                  <div
                    key={`skeleton-${index}`}
                    className="animate-pulse"
                    style={{ gridRowEnd: `span ${randomSpan}` }}
                  >
                    <div className="relative h-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700"></div>
                      
                      {/* Skeleton overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            }

            {/* Loading state - show only skeletons when loading */}
            {(!imageFeed || imageFeed.images.length === 0) && !error &&
              Array.from({ length: 24 }).map((_, index) => {
                const spanOptions = [20, 25, 30, 35, 40, 45, 50];
                const randomSpan = spanOptions[index % spanOptions.length];
                
                return (
                  <div
                    key={`loading-skeleton-${index}`}
                    className="animate-pulse"
                    style={{ gridRowEnd: `span ${randomSpan}` }}
                  >
                    <div className="relative h-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700"></div>
                      
                      {/* Skeleton overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>

          {/* Load More Button */}
          {remainingCount > 0 && imageFeed && imageFeed.images.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={goToNext}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Load More Unique Images ({remainingCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}