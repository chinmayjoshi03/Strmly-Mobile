import { useState, useCallback, useRef } from 'react';
import { VideoItemType } from '@/types/VideosType';

export interface VideoPlayerState {
  currentVideo: VideoItemType | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
}

export interface VideoPlayerActions {
  setCurrentVideo: (video: VideoItemType | null) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface UseUnifiedVideoPlayerReturn {
  state: VideoPlayerState;
  actions: VideoPlayerActions;
}

const initialState: VideoPlayerState = {
  currentVideo: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isFullscreen: false,
  volume: 1,
  playbackRate: 1,
  isLoading: false,
  error: null,
};

export const useUnifiedVideoPlayer = (): UseUnifiedVideoPlayerReturn => {
  const [state, setState] = useState<VideoPlayerState>(initialState);
  const playerRef = useRef<any>(null);

  const setCurrentVideo = useCallback((video: VideoItemType | null) => {
    setState(prev => ({
      ...prev,
      currentVideo: video,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      error: null,
    }));
  }, []);

  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlayPause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const seek = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const actions: VideoPlayerActions = {
    setCurrentVideo,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    setError,
    setLoading,
    reset,
  };

  return {
    state,
    actions,
  };
};

// Context for global video player state (optional)
import React, { createContext, useContext } from 'react';

const VideoPlayerContext = createContext<UseUnifiedVideoPlayerReturn | null>(null);

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const videoPlayer = useUnifiedVideoPlayer();
  
  return (
    <VideoPlayerContext.Provider value={videoPlayer}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayerContext = (): UseUnifiedVideoPlayerReturn => {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayerContext must be used within a VideoPlayerProvider');
  }
  return context;
};