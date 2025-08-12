/**
 * Debug script to test monetization status changes
 * Run this in the console or as a standalone script
 */

import { useMonetizationStore } from '../store/useMonetizationStore';
import { refreshMonetizationStatus, updateMonetizationStatus } from '../utils/monetizationUtils';

// Test functions for debugging monetization
export const testMonetizationFunctions = {
  // Get current status
  getCurrentStatus: () => {
    const { monetizationStatus } = useMonetizationStore.getState();
    console.log('Current monetization status:', monetizationStatus);
    return monetizationStatus;
  },

  // Force refresh from API
  forceRefresh: async (token) => {
    console.log('🔄 Force refreshing monetization status...');
    await refreshMonetizationStatus(token);
    console.log('✅ Refresh complete');
  },

  // Toggle comment monetization locally (for testing UI updates)
  toggleCommentMonetization: () => {
    const current = testMonetizationFunctions.getCurrentStatus();
    const newStatus = !current?.comment_monetization_status;
    console.log(`🔄 Toggling comment monetization to: ${newStatus}`);
    updateMonetizationStatus({
      comment_monetization_status: newStatus
    });
  },

  // Simulate API response change (for testing)
  simulateAPIChange: (commentEnabled, videoEnabled) => {
    console.log('🎭 Simulating API response change...');
    updateMonetizationStatus({
      comment_monetization_status: commentEnabled,
      video_monetization_status: videoEnabled
    });
  },

  // Test polling mechanism
  startTestPolling: (token, interval = 5000) => {
    console.log(`🔄 Starting test polling every ${interval}ms`);
    return setInterval(async () => {
      console.log('📡 Polling...');
      await refreshMonetizationStatus(token);
    }, interval);
  },

  stopTestPolling: (intervalId) => {
    console.log('⏹️ Stopping test polling');
    clearInterval(intervalId);
  }
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.testMonetization = testMonetizationFunctions;
}

// Usage examples:
// testMonetization.getCurrentStatus()
// testMonetization.toggleCommentMonetization()
// testMonetization.forceRefresh(token)
// const polling = testMonetization.startTestPolling(token, 3000)
// testMonetization.stopTestPolling(polling)