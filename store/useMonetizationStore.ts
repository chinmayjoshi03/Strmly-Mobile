import { create } from 'zustand';
import { getUserMonetizationStatus, toggleCommentMonetization as apiToggleCommentMonetization, MonetizationStatus } from '@/api/user/userActions';

interface MonetizationStore {
  monetizationStatus: MonetizationStatus | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  fetchMonetizationStatus: (token: string, forceRefresh?: boolean) => Promise<void>;
  updateMonetizationStatus: (status: Partial<MonetizationStatus>) => void;
  toggleCommentMonetization: (token: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const CACHE_DURATION = 300000; // 5 minutes cache (increased from 30 seconds)

export const useMonetizationStore = create<MonetizationStore>((set, get) => ({
  monetizationStatus: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchMonetizationStatus: async (token: string, forceRefresh = false) => {
    const state = get();
    const now = Date.now();
    
    // Check if we have recent data (within cache duration) and not forcing refresh
    if (!forceRefresh && state.monetizationStatus && state.lastFetched && (now - state.lastFetched) < CACHE_DURATION) {
      console.log('💰 Using cached monetization status');
      return;
    }

    // Prevent multiple simultaneous requests
    if (state.loading) {
      console.log('💰 Monetization fetch already in progress, skipping');
      return;
    }

    set({ loading: true, error: null });

    try {
      console.log('💰 Fetching fresh monetization status');
      const status = await getUserMonetizationStatus(token);
      
      set({
        monetizationStatus: status,
        loading: false,
        error: null,
        lastFetched: now,
      });
    } catch (err: any) {
      console.error('❌ Failed to fetch monetization status:', err);
      
      set({
        loading: false,
        error: err.message || 'Failed to fetch monetization status',
        // Keep existing status if available, otherwise set defaults
        monetizationStatus: state.monetizationStatus || {
          message: 'Error fetching status',
          comment_monetization_status: false,
          video_monetization_status: false,
        },
      });
    }
  },

  updateMonetizationStatus: (updates: Partial<MonetizationStatus>) => {
    const state = get();
    if (state.monetizationStatus) {
      set({
        monetizationStatus: {
          ...state.monetizationStatus,
          ...updates,
        },
        lastFetched: Date.now(), // Update timestamp
      });
    }
  },

  toggleCommentMonetization: async (token: string) => {
    set({ loading: true, error: null });

    try {
      console.log('💰 Toggling comment monetization...');
      const updatedStatus = await apiToggleCommentMonetization(token);
      
      set({
        monetizationStatus: updatedStatus,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      });

      console.log('✅ Comment monetization toggled successfully:', updatedStatus);
    } catch (err: any) {
      console.error('❌ Failed to toggle comment monetization:', err);
      
      set({
        loading: false,
        error: err.message || 'Failed to toggle comment monetization',
      });

      throw err; // Re-throw so the UI can handle it
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    monetizationStatus: null,
    loading: false,
    error: null,
    lastFetched: null,
  }),
}));