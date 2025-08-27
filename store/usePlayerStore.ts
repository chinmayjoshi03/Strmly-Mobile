// Enhanced usePlayerStore.ts
import { VideoPlayer } from "expo-video";
import { create } from "zustand";

interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  buffered: number;
  error: string | null;
  // NEW: Track if user has ever interacted with audio
  hasUserInteractedWithAudio: boolean;
  wasPlayingBeforeSeek: boolean;
}

interface PlayerActions {
  _updateStatus: (status: any, error?: any) => void;
  seekTo: (positionInSeconds: number) => void;
  toggleMute: () => void;
  togglePlayPause: () => void;
  // NEW: Smart play that handles audio logic
  smartPlay: () => void;
  smartPause: () => void;
}

// A reference to the currently active player, kept outside the store
let activePlayer: import("expo-video").VideoPlayer | null = null;

export const usePlayerStore = create<PlayerState & PlayerActions>(
  (set, get) => ({
    isPlaying: false,
    isMuted: true, // Start muted by default
    isBuffering: false,
    position: 0,
    duration: 0,
    buffered: 0,
    error: null,
    hasUserInteractedWithAudio: false, // Track first interaction
    wasPlayingBeforeSeek: false,

    _updateStatus: (status, error) => {
      // Handle error cases
      if (error) {
        set({
          error: error.message || "Playback error",
          isBuffering: false,
          isPlaying: false,
        });
        return;
      }

      // Clear previous errors if status is good
      if (get().error && status) {
        set({ error: null });
      }

      // Handle different status types from expo-video
      if (status && typeof status === "object") {
        const newState: Partial<PlayerState> = {};

        // Handle position and duration updates
        if (typeof status.positionMillis !== "undefined") {
          newState.position = status.positionMillis / 1000;
        } else if (typeof status.position !== "undefined") {
          newState.position = status.position;
        }

        if (typeof status.durationMillis !== "undefined") {
          newState.duration = status.durationMillis / 1000;
        } else if (typeof status.duration !== "undefined") {
          newState.duration = status.duration;
        }

        // Handle other status properties
        if (typeof status.isPlaying !== "undefined") {
          newState.isPlaying = status.isPlaying;
        }

        if (typeof status.isMuted !== "undefined") {
          newState.isMuted = status.isMuted;
        }

        if (typeof status.isBuffering !== "undefined") {
          newState.isBuffering = status.isBuffering;
        }

        // Handle buffered time ranges
        if (Array.isArray(status.buffered) && status.buffered.length > 0) {
          const bufferedEnd = status.buffered[0]?.end || 0;
          newState.buffered =
            typeof bufferedEnd === "number" ? bufferedEnd : bufferedEnd / 1000;
        }

        // Handle status string values
        if (typeof status === "string" || status.status) {
          const statusValue =
            typeof status === "string" ? status : status.status;

          switch (statusValue) {
            case "idle":
              newState.isPlaying = false;
              newState.isBuffering = false;
              newState.position = 0;
              break;
            case "loading":
              newState.isBuffering = true;
              break;
            case "readyToPlay":
              newState.isBuffering = false;
              break;
            case "error":
              newState.error = "Video playback error";
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

    seekTo: async (positionInSeconds) => {
      if (
        !activePlayer ||
        typeof positionInSeconds !== "number" ||
        positionInSeconds < 0
      )
        return;

      try {
        set({ wasPlayingBeforeSeek: get().isPlaying });

        // Pause video before seeking (for stability)
        await activePlayer.pause();

        // Prefer seekTo
        if (typeof activePlayer.seekTo === "function") {
          await activePlayer.seekTo(positionInSeconds);
        } else if (typeof activePlayer.setPositionAsync === "function") {
          await activePlayer.setPositionAsync(positionInSeconds * 1000);
        } else {
          // fallback, probably unreliable!
          activePlayer.currentTime = positionInSeconds;
        }

        // After seeking, read back actual time to state
        let trueTime = positionInSeconds;
        if (typeof activePlayer.currentTime === "number") {
          trueTime = activePlayer.currentTime;
        }
        set({ position: trueTime });

        // Small buffer for async seek completion
        await new Promise((res) => setTimeout(res, 150));

        // Resume playback
        if (get().wasPlayingBeforeSeek) {
          await activePlayer.play();
          set({ isPlaying: true, isBuffering: false });
        } else {
          set({ isBuffering: false });
        }
      } catch (err) {
        console.error("Seek failed:", err);
        set({ error: "Seek failed", isBuffering: false });
      }
    },

    toggleMute: () => {
      const newMutedState = !get().isMuted;
      if (activePlayer) {
        activePlayer.muted = newMutedState;
      }
      set({
        isMuted: newMutedState,
        hasUserInteractedWithAudio: true, // Mark that user has interacted
      });
    },

    togglePlayPause: async () => {
      const currentState = get();
      if (activePlayer) {
        try {
          if (currentState.isPlaying) {
            // Pause
            await activePlayer.pause();
            set({ isPlaying: false });
          } else {
            // Play
            if (!currentState.hasUserInteractedWithAudio) {
              activePlayer.muted = false;
              set({
                isMuted: false,
                hasUserInteractedWithAudio: true,
              });
            }
            await activePlayer.play();
            set({ isPlaying: true });
          }
        } catch (err) {
          console.error("togglePlayPause error:", err);
        }
      }
    },

    smartPlay: async () => {
      if (activePlayer) {
        const state = get();
        if (!state.hasUserInteractedWithAudio) {
          activePlayer.muted = false;
          set({
            isMuted: false,
            hasUserInteractedWithAudio: true,
          });
        }
        await activePlayer.play();
        set({ isPlaying: true });
      }
    },

    smartPause: async () => {
      if (activePlayer) {
        await activePlayer.pause();
        set({ isPlaying: false });
      }
    },
  })
);

// Helper functions to manage the single active player
export const setActivePlayer = (player: VideoPlayer) => {
  activePlayer = player;
};

export const clearActivePlayer = () => {
  activePlayer = null;
};
