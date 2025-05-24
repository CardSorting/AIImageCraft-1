import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type GeneratedImage } from "@shared/schema";

export default function SimpleHome() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get images from the API
  const { data: images, isLoading } = useQuery({
    queryKey: ["/api/images"],
  });

  const imageList = Array.isArray(images) ? images : [];

  // Handle scroll to navigate between images
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY > 0 && currentIndex < imageList.length - 1) {
        // Scroll down
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // Scroll up
        setCurrentIndex(prev => prev - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [currentIndex, imageList.length]);

  // Handle touch gestures for mobile
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0 && currentIndex < imageList.length - 1) {
          // Swipe up - next image
          setCurrentIndex(prev => prev + 1);
        } else if (diff < 0 && currentIndex > 0) {
          // Swipe down - previous image
          setCurrentIndex(prev => prev - 1);
        }
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
  }, [currentIndex, imageList.length]);

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
        <div className="text-white text-lg">Loading images...</div>
      </div>
    );
  }

  if (imageList.length === 0) {
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
      {imageList.map((image, index) => (
        <div
          key={image.id}
          ref={(el) => itemRefs.current[index] = el}
          className={`
            absolute inset-0 transition-transform duration-700 ease-in-out cursor-pointer
            ${index === currentIndex ? 'translate-y-0' : 
              index < currentIndex ? '-translate-y-full' : 'translate-y-full'
            }
          `}
          onClick={() => handleImageClick(image)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={image.imageUrl}
              alt={image.prompt || 'AI Generated Image'}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Subtle overlay with prompt hint */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-6">
              <p className="text-white/80 text-sm line-clamp-2 max-w-2xl">
                "{image.prompt}"
              </p>
              <p className="text-white/50 text-xs mt-2">
                Click to recreate with these settings
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation indicators */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-10">
        {imageList.map((_, index) => (
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

      {/* Scroll hint */}
      {imageList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm z-10">
          Scroll or swipe to explore
        </div>
      )}
    </div>
  );
}