/**
 * Mobile-optimized category navigation with horizontal scrolling
 * Supports dynamic category loading and native app gestures
 */

import { useState, useRef, useEffect } from "react";
import { StyleCategory } from "@shared/cosplayStyles";

interface CategoryNavigationProps {
  categories: StyleCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export function CategoryNavigation({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  className = ""
}: CategoryNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Auto-scroll to active category
  useEffect(() => {
    const activeIndex = categories.findIndex(cat => cat.id === activeCategory);
    if (activeIndex !== -1 && scrollRef.current) {
      const container = scrollRef.current;
      const activeButton = container.children[activeIndex] as HTMLElement;
      
      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        
        // Calculate scroll position to center the active button
        const scrollLeft = activeButton.offsetLeft - (containerRect.width / 2) + (buttonRect.width / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeCategory, categories]);

  const handleScroll = () => {
    setShowScrollHint(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Horizontal scrolling category tabs */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-1"
        style={{
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {categories.map((category, index) => {
          const isActive = activeCategory === category.id;
          const Icon = category.icon;
          
          return (
            <button
              key={category.id}
              onClick={() => {
                onCategoryChange(category.id);
                // Add haptic feedback for mobile
                if (navigator.vibrate) navigator.vibrate(25);
              }}
              className={`
                flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm
                transition-all duration-200 active:scale-95 scroll-snap-align-center
                ${isActive 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm border-2 border-purple-200 dark:border-purple-700' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
                }
              `}
              style={{
                minWidth: 'fit-content'
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{category.shortName}</span>
              {category.featured && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Scroll hint indicator */}
      {showScrollHint && categories.length > 3 && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none flex items-center justify-end pr-2">
          <div className="w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}