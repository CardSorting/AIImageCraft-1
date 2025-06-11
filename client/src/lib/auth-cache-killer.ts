/**
 * Ultra-aggressive auth polling elimination
 * Network-level interception to block all auth requests
 */

import { queryClient } from './queryClient';

let isInitialized = false;
let authRequestCount = 0;
const MAX_AUTH_REQUESTS = 2; // Allow only initial auth check

export function killAuthPolling() {
  // Disabled to prevent React hook interference
  console.log('[AUTH-KILLER] Disabled to prevent React hook conflicts');
  return;
}

// Temporarily disabled to fix React hook issues
// killAuthPolling();