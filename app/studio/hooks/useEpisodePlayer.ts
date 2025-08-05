import { useState, useCallback } from 'react';

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
}

interface UseEpisodePlayerProps {
  onPlaybackUpdate?: (state: PlaybackState) => void;
}

export const useEpisodePlayer = ({ onPlaybackUpdate }: UseEpisodePlayerProps = {}) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
  });

  const handlePlaybackStatusUpdate = useCallback((status: any) => {
    const newState: PlaybackState = {
      isPlaying: status.isPlaying || false,
      currentTime: status.currentTime || 0,
      duration: status.duration || 0,
      isLoaded: status.isLoaded || false,
    };

    setPlaybackState(newState);
    
    if (onPlaybackUpdate) {
      onPlaybackUpdate(newState);
    }
  }, [onPlaybackUpdate]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getProgressPercentage = useCallback((): number => {
    if (playbackState.duration === 0) return 0;
    return (playbackState.currentTime / playbackState.duration) * 100;
  }, [playbackState.currentTime, playbackState.duration]);

  return {
    playbackState,
    handlePlaybackStatusUpdate,
    formatTime,
    getProgressPercentage,
  };
};