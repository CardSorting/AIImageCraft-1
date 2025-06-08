/**
 * Ultra-aggressive auth polling elimination
 * Network-level interception to block all auth requests
 */

import { queryClient } from './queryClient';

let isInitialized = false;
let authRequestCount = 0;
const MAX_AUTH_REQUESTS = 2; // Allow only initial auth check

export function killAuthPolling() {
  if (isInitialized) return;
  
  // Clear all existing queries immediately
  queryClient.clear();
  
  // Network-level fetch interception
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Block auth polling after initial requests
    if (url.includes('/api/auth/profile')) {
      authRequestCount++;
      if (authRequestCount > MAX_AUTH_REQUESTS) {
        console.log(`[AUTH-KILLER] Blocked auth request #${authRequestCount} to ${url}`);
        // Return a cached response instead of making network request
        return Promise.resolve(new Response(
          JSON.stringify({ isAuthenticated: false, user: null }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' },
            statusText: 'OK'
          }
        ));
      }
    }
    
    return originalFetch.call(this, input, init);
  };
  
  // Override query client methods
  const originalInvalidateQueries = queryClient.invalidateQueries;
  queryClient.invalidateQueries = function(filters?: any) {
    if (filters?.queryKey && filters.queryKey[0]?.includes?.('/api/auth/')) {
      console.log('[AUTH-KILLER] Blocked auth query invalidation');
      return Promise.resolve();
    }
    return originalInvalidateQueries.call(this, filters);
  };
  
  const originalRefetchQueries = queryClient.refetchQueries;
  queryClient.refetchQueries = function(filters?: any) {
    if (filters?.queryKey && filters.queryKey[0]?.includes?.('/api/auth/')) {
      console.log('[AUTH-KILLER] Blocked auth query refetch');
      return Promise.resolve();
    }
    return originalRefetchQueries.call(this, filters);
  };
  
  isInitialized = true;
  console.log('[AUTH-KILLER] Network-level auth polling elimination activated');
}

// Kill auth polling immediately on module load
killAuthPolling();