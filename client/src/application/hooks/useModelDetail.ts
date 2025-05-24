/**
 * Model Detail Hook - Application Layer
 * Follows Apple's philosophy of elegant, intuitive interfaces
 * Implements Clean Architecture with proper separation of concerns
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ModelDetailAggregate, ModelDetailState, ModelDetailFactory } from '../../domain/models/ModelDetail';
import { ModelDetailService } from '../../infrastructure/services/ModelDetailService';
import { useToast } from '@/hooks/use-toast';

/**
 * Model Detail Hook
 * Provides comprehensive model data management
 * Follows Single Responsibility Principle
 */
export function useModelDetail(modelId: number, userId?: number) {
  const [state, setState] = useState<ModelDetailState>(ModelDetailFactory.createEmpty());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const modelDetailService = new ModelDetailService();

  // Main model detail query
  const {
    data: modelDetail,
    isLoading,
    error,
    refetch
  } = useQuery<ModelDetailAggregate>({
    queryKey: ['modelDetail', modelId, userId],
    queryFn: () => modelDetailService.getModelDetail(modelId, userId),
    enabled: modelId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update state based on query status
  useEffect(() => {
    if (isLoading) {
      setState(ModelDetailFactory.createLoading());
    } else if (error) {
      setState(ModelDetailFactory.createError((error as Error).message));
    } else if (modelDetail) {
      setState(ModelDetailFactory.createSuccess(modelDetail));
    }
  }, [modelDetail, isLoading, error]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (liked: boolean) => {
      const url = liked ? `/api/likes` : `/api/likes/1/${modelId}`;
      const method = liked ? 'POST' : 'DELETE';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: liked ? JSON.stringify({ userId: userId || 1, modelId }) : undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['modelDetail', modelId, userId]);
      toast({
        title: "Updated Successfully",
        description: "Your preference has been saved",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Unable to update preference",
        variant: "destructive",
      });
    }
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (bookmarked: boolean) => {
      const url = bookmarked ? `/api/bookmarks` : `/api/bookmarks/1/${modelId}`;
      const method = bookmarked ? 'POST' : 'DELETE';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: bookmarked ? JSON.stringify({ userId: userId || 1, modelId }) : undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['modelDetail', modelId, userId]);
      toast({
        title: "Bookmark Updated",
        description: "Your collection has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bookmark Failed",
        description: error.message || "Unable to update bookmark",
        variant: "destructive",
      });
    }
  });

  return {
    // State
    state,
    modelDetail: state.data,
    isLoading: state.loading,
    error: state.error,
    
    // Actions
    toggleLike: (liked: boolean) => likeMutation.mutate(liked),
    toggleBookmark: (bookmarked: boolean) => bookmarkMutation.mutate(bookmarked),
    refetch,
    
    // Status
    isLiking: likeMutation.isPending,
    isBookmarking: bookmarkMutation.isPending,
  };
}