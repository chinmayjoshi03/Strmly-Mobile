import React from 'react';
import { View, StyleSheet } from 'react-native';
import UnifiedVideoPlayer, { VideoPlayerMode, UnifiedVideoPlayerProps } from './UnifiedVideoPlayer';
import { VideoItemType } from '@/types/VideosType';

// Simplified wrapper components for common use cases

interface FeedVideoPlayerProps {
  uri: string;
  videoData: VideoItemType;
  isActive: boolean;
  containerHeight?: number;
  setGiftingData: (data: any) => void;
  setIsWantToGift: (value: boolean) => void;
  showCommentsModal: boolean;
  setShowCommentsModal: (value: boolean) => void;
}

export const FeedVideoPlayer: React.FC<FeedVideoPlayerProps> = (props) => (
  <UnifiedVideoPlayer
    {...props}
    mode="feed"
    autoPlay={props.isActive}
    loop={true}
    showControls={true}
    showInteractions={true}
    showDetails={true}
    showComments={true}
  />
);

interface EpisodeVideoPlayerProps {
  uri: string;
  episodeTitle: string;
  seriesTitle?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  style?: any;
}

export const EpisodeVideoPlayer: React.FC<EpisodeVideoPlayerProps> = (props) => (
  <UnifiedVideoPlayer
    {...props}
    mode="episode"
    autoPlay={true}
    loop={false}
    showControls={true}
  />
);

interface StudioVideoPlayerProps {
  uri: string;
  title?: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  style?: any;
}

export const StudioVideoPlayer: React.FC<StudioVideoPlayerProps> = (props) => (
  <UnifiedVideoPlayer
    {...props}
    mode="studio"
    autoPlay={false}
    loop={false}
    showControls={true}
  />
);

interface PreviewVideoPlayerProps {
  uri: string;
  title?: string;
  autoPlay?: boolean;
  style?: any;
}

export const PreviewVideoPlayer: React.FC<PreviewVideoPlayerProps> = (props) => (
  <UnifiedVideoPlayer
    {...props}
    mode="preview"
    autoPlay={props.autoPlay || false}
    loop={false}
    showControls={true}
  />
);

interface FullscreenVideoPlayerProps {
  uri: string;
  videoData?: VideoItemType;
  title?: string;
  onClose?: () => void;
}

export const FullscreenVideoPlayer: React.FC<FullscreenVideoPlayerProps> = (props) => (
  <UnifiedVideoPlayer
    {...props}
    mode="fullscreen"
    autoPlay={true}
    loop={false}
    showControls={true}
    showInteractions={!!props.videoData}
    showDetails={!!props.videoData}
  />
);

// Navigation helpers for consistent video player routing
export const VideoPlayerRoutes = {
  // Navigate to fullscreen video player
  openFullscreenPlayer: (videoId: string, videoData?: VideoItemType) => {
    // Implementation depends on your routing setup
    // router.push(`/video/fullscreen/${videoId}`);
  },
  
  // Navigate to episode player
  openEpisodePlayer: (episodeId: string, params?: {
    seriesTitle?: string;
    episodeNumber?: number;
    seasonNumber?: number;
    episodeName?: string;
  }) => {
    // router.push(`/studio/episode-player/${episodeId}`, { params });
  },
  
  // Navigate to studio video player
  openStudioPlayer: (videoId: string, type: 'draft' | 'episode') => {
    // router.push(`/studio/${type}/${videoId}`);
  },
};

export default UnifiedVideoPlayer;