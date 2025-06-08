/**
 * Ultra-aggressive auth polling elimination
 * Completely disables all automatic query refetching
 */

import { queryClient } from './queryClient';

let isInitialized = false;

export function killAuthPolling() {
  if (isInitialized) return;
  
  // Clear all existing queries immediately
  queryClient.clear();
  
  // Override the query client to prevent any auth polling
  const originalInvalidateQueries = queryClient.invalidateQueries;
  queryClient.invalidateQueries = function(filters?: any) {
    // Block invalidation of auth-related queries
    if (filters?.queryKey && filters.queryKey[0]?.includes?.('/api/auth/')) {
      console.log('[AUTH-KILLER] Blocked auth query invalidation');
      return Promise.resolve();
    }
    return originalInvalidateQueries.call(this, filters);
  };
  
  // Override refetch methods to prevent auth polling
  const originalRefetchQueries = queryClient.refetchQueries;
  queryClient.refetchQueries = function(filters?: any) {
    if (filters?.queryKey && filters.queryKey[0]?.includes?.('/api/auth/')) {
      console.log('[AUTH-KILLER] Blocked auth query refetch');
      return Promise.resolve();
    }
    return originalRefetchQueries.call(this, filters);
  };
  
  isInitialized = true;
  console.log('[AUTH-KILLER] Auth polling elimination activated');
}

// Kill auth polling immediately on module load
killAuthPolling();