/**
 * Bookmark Button Component
 * Apple Design Philosophy: "Delight users with intuitive interactions"
 * 
 * ✓ Fluid Animations
 * ✓ Immediate Visual Feedback
 * ✓ Error Recovery
 * ✓ Accessibility First
 */

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkService } from "@/application/services/BookmarkService";

interface BookmarkButtonProps {
  userId: number;
  modelId: number;
  variant?: "default" | "icon" | "minimal";
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
  onStateChange?: (isBookmarked: boolean) => void;
}

export function BookmarkButton({
  userId,
  modelId,
  variant = "icon",
  size = "md",
  showCount = false,
  className = "",
  onStateChange
}: BookmarkButtonProps) {
  const bookmarkService = new BookmarkService();
  const [isOptimistic, setIsOptimistic] = useState(false);
  
  // Use React Query hooks for real-time state
  const { data: status, isLoading } = bookmarkService.useBookmarkStatus(userId, modelId);
  const toggleMutation = bookmarkService.useToggleBookmark();

  const isBookmarked = status?.isBookmarked || false;
  const displayBookmarked = isOptimistic || isBookmarked;

  useEffect(() => {
    onStateChange?.(isBookmarked);
  }, [isBookmarked, onStateChange]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setIsOptimistic(!displayBookmarked);
    
    try {
      await toggleMutation.mutateAsync({ userId, modelId });
      setIsOptimistic(false); // Reset optimistic state
    } catch (error) {
      // Revert optimistic update on error
      setIsOptimistic(false);
      console.error('Bookmark failed:', error);
    }
  };

  const buttonSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  if (variant === "minimal") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading || toggleMutation.isPending}
        className={`
          transition-all duration-300 hover:scale-110 disabled:opacity-50
          ${className}
        `}
        aria-label={displayBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        <Bookmark 
          className={`
            ${iconSizes[size]} transition-all duration-300
            ${displayBookmarked 
              ? 'fill-blue-500 text-blue-500 scale-110' 
              : 'text-gray-400 hover:text-blue-400'
            }
          `} 
        />
      </button>
    );
  }

  return (
    <Button
      size="sm"
      variant={displayBookmarked ? "default" : "secondary"}
      onClick={handleClick}
      disabled={isLoading || toggleMutation.isPending}
      className={`
        ${variant === "icon" ? buttonSizes[size] + " p-0" : ""}
        rounded-full shadow-lg backdrop-blur-sm
        transition-all duration-300 hover:scale-105
        ${displayBookmarked 
          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
          : 'bg-white/80 hover:bg-blue-50 text-gray-700'
        }
        ${className}
      `}
      aria-label={displayBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark 
        className={`
          ${iconSizes[size]} transition-all duration-300
          ${displayBookmarked ? 'fill-current scale-110' : ''}
        `} 
      />
      {variant !== "icon" && showCount && (
        <span className="ml-2 text-sm font-medium">
          {/* Count can be added later if needed */}
        </span>
      )}
    </Button>
  );
}