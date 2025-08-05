// Updated usePlayerStore.ts
import { create } from 'zustand';
import { VideoPlayerStatus } from 'expo-video';

interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  buffered: number;
  error: string | null;
}

interface PlayerActions {
  _updateStatus: (status: any, error?: any) => void;
  seekTo: (positionInSeconds: number) => void;
  toggleMute: () => void;
  togglePlayPause: () => void;
}

// A reference to the currently active player, kept outside the store
let activePlayer: import('expo-video').VideoPlayer | null = null;

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  isPlaying: false,
  isMuted: true,
  isBuffering: false,
  position: 0,
  duration: 0,
  buffered: 0,
  error: null,

  _updateStatus: (status, error) => {
    // Handle error cases
    if (error) {
      set({ error: error.message || 'Playback error', isBuffering: false, isPlaying: false });
      return;
    }

    // Clear previous errors if status is good
    if (get().error && status) {
      set({ error: null });
    }

    // Handle different status types from expo-video
    if (status && typeof status === 'object') {
      const newState: Partial<PlayerState> = {};

      // Handle position and duration updates
      if (typeof status.positionMillis !== 'undefined') {
        newState.position = status.positionMillis / 1000;
      } else if (typeof status.position !== 'undefined') {
        newState.position = status.position;
      }

      if (typeof status.durationMillis !== 'undefined') {
        newState.duration = status.durationMillis / 1000;
      } else if (typeof status.duration !== 'undefined') {
        newState.duration = status.duration;
      }

      // Handle other status properties
      if (typeof status.isPlaying !== 'undefined') {
        newState.isPlaying = status.isPlaying;
      }

      if (typeof status.isMuted !== 'undefined') {
        newState.isMuted = status.isMuted;
      }

      if (typeof status.isBuffering !== 'undefined') {
        newState.isBuffering = status.isBuffering;
      }

      // Handle buffered time ranges
      if (status.buffered && Array.isArray(status.buffered) && status.buffered.length > 0) {
        const bufferedEnd = status.buffered[0].end || 0;
        newState.buffered = typeof bufferedEnd === 'number' ? bufferedEnd : bufferedEnd / 1000;
      }

      // Handle status string values
      if (typeof status === 'string' || status.status) {
        const statusValue = typeof status === 'string' ? status : status.status;
        
        switch (statusValue) {
          case 'idle':
            newState.isPlaying = false;
            newState.isBuffering = false;
            newState.position = 0;
            break;
          case 'loading':
            newState.isBuffering = true;
            break;
          case 'readyToPlay':
            newState.isBuffering = false;
            break;
          case 'error':
            newState.error = 'Video playback error';
            newState.isBuffering = false;
            newState.isPlaying = false;
            break;
        }
      }

      // Only update if we have changes
      if (Object.keys(newState).length > 0) {
        set(newState);
      }
    }
  },
  
  seekTo: (positionInSeconds) => {
    if (activePlayer && positionInSeconds >= 0) {
      activePlayer.currentTime = positionInSeconds;
      // Immediately update the position in store for responsive UI
      set({ position: positionInSeconds });
    }
  },

  toggleMute: () => {
    const newMutedState = !get().isMuted;
    if (activePlayer) {
      activePlayer.muted = newMutedState;
    }
    set({ isMuted: newMutedState });
  },

  togglePlayPause: () => {
    if (activePlayer) {
      if (get().isPlaying) {
        activePlayer.pause();
      } else {
        activePlayer.play();
      }
    }
  },
}));

// Helper functions to manage the single active player
export const setActivePlayer = (player: import('expo-video').VideoPlayer) => {
  activePlayer = player;
};

export const clearActivePlayer = () => {
  activePlayer = null;
};