import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { GeneratedImage } from "@shared/schema";
import { ImageCard } from "./ImageCard";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface PaginatedImagesResponse {
  images: GeneratedImage[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface InfiniteImageGridProps {
  initialLimit?: number;
  onImageClick?: (image: GeneratedImage) => void;
}

export function InfiniteImageGrid({ initialLimit = 20, onImageClick }: InfiniteImageGridProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery<PaginatedImagesResponse>({
    queryKey: ["/api/images", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/images?limit=${initialLimit}&offset=${pageParam}`);
      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Intersection Observer for infinite scroll
  const observerRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          setIsIntersecting(true);
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (node) observer.observe(node);
    
    return () => {
      if (node) observer.disconnect();
    };
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Auto-fetch when intersecting
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      setIsIntersecting(false);
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: initialLimit }).map((_, index) => (
          <div key={index} className="aspect-square animate-pulse">
            <div className="w-full h-full bg-muted rounded-3xl" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Failed to load images"}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const allImages = data?.pages.flatMap((page) => page.images) || [];
  const totalCount = data?.pages[0]?.pagination.total || 0;

  if (allImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground mb-2">No images yet</p>
        <p className="text-muted-foreground">Be the first to create something amazing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Showing {allImages.length} of {totalCount.toLocaleString()} amazing creations
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allImages.map((image, index) => (
          <ImageCard
            key={`${image.id}-${index}`}
            image={image}
            isNewest={index < initialLimit}
            onClick={() => onImageClick?.(image)}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={observerRef} className="flex justify-center py-8">
          {isFetchingNextPage ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more amazing images...</span>
            </div>
          ) : (
            <Button 
              onClick={() => fetchNextPage()} 
              variant="outline"
              className="px-8 py-3"
            >
              Load More Images
            </Button>
          )}
        </div>
      )}

      {/* End Message */}
      {!hasNextPage && allImages.length >= initialLimit && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            You've seen all {totalCount.toLocaleString()} images! 🎉
          </p>
        </div>
      )}
    </div>
  );
}