import { useMonetizationStore } from '@/store/useMonetizationStore';

/**
 * Utility functions for managing monetization status across the app
 */

/**
 * Force refresh monetization status from the API
 * Call this after making changes to monetization settings
 */
export const refreshMonetizationStatus = async (token: string) => {
  const { fetchMonetizationStatus } = useMonetizationStore.getState();
  await fetchMonetizationStatus(token, true); // Force refresh
};

/**
 * Update monetization status locally (optimistic update)
 * Use this for immediate UI updates before API confirmation
 */
export const updateMonetizationStatus = (updates: {
  comment_monetization_status?: boolean;
  video_monetization_status?: boolean;
}) => {
  const { updateMonetizationStatus } = useMonetizationStore.getState();
  updateMonetizationStatus(updates);
};

/**
 * Get current monetization status without subscribing to changes
 */
export const getCurrentMonetizationStatus = () => {
  const { monetizationStatus } = useMonetizationStore.getState();
  return monetizationStatus;
};

/**
 * Check if comment monetization is currently enabled
 */
export const isCommentMonetizationEnabled = () => {
  const status = getCurrentMonetizationStatus();
  return status?.comment_monetization_status || false;
};

/**
 * Check if video monetization is currently enabled
 */
export const isVideoMonetizationEnabled = () => {
  const status = getCurrentMonetizationStatus();
  return status?.video_monetization_status || false;
};