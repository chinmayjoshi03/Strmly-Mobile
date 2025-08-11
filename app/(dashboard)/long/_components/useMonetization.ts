import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useMonetizationStore } from '@/store/useMonetizationStore';

export const useMonetization = (enablePolling = false, pollingInterval = 10000) => {
  const { token } = useAuthStore();
  const appState = useRef(AppState.currentState);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    monetizationStatus,
    loading,
    error,
    fetchMonetizationStatus,
    clearError,
  } = useMonetizationStore();

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchMonetizationStatus(token, true); // Force refresh on initial load
    }
  }, [token, fetchMonetizationStatus]);

  // Polling mechanism
  useEffect(() => {
    if (enablePolling && token && appState.current === 'active') {
      pollingRef.current = setInterval(() => {
        fetchMonetizationStatus(token, true);
      }, pollingInterval);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [enablePolling, token, pollingInterval, fetchMonetizationStatus]);

  // Listen for app state changes to refresh when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active' && token) {
        fetchMonetizationStatus(token, true); // Force refresh when coming to foreground

        // Restart polling if enabled
        if (enablePolling && !pollingRef.current) {
          pollingRef.current = setInterval(() => {
            fetchMonetizationStatus(token, true);
          }, pollingInterval);
        }
      } else if (nextAppState.match(/inactive|background/) && pollingRef.current) {
        // Stop polling when app goes to background
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [token, fetchMonetizationStatus, enablePolling, pollingInterval]);

  const refetch = useCallback(() => {
    if (token) {
      clearError();
      fetchMonetizationStatus(token, true); // Force refresh
    }
  }, [token, fetchMonetizationStatus, clearError]);

  return {
    monetizationStatus,
    commentMonetizationEnabled: monetizationStatus?.comment_monetization_status || false,
    videoMonetizationEnabled: monetizationStatus?.video_monetization_status || false,
    loading,
    error,
    refetch,
  };
};