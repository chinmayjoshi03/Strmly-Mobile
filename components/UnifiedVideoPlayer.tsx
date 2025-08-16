import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Dimensions,
  Image,
  Text,
} from "react-native";
import { useVideoPlayer, VideoView, type VideoPlayerStatus } from "expo-video";
import { Play } from "lucide-react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";

// Import all the components from VideoItem
import InteractOptions from "@/app/(dashboard)/long/_components/interactOptions";
import VideoDetails from "@/app/(dashboard)/long/_components/VideoDetails";
import VideoProgressBar from "@/app/(dashboard)/long/_components/VideoProgressBar";
import { VideoItemType } from "@/types/VideosType";

const BACKEND_API_URL = CONFIG.API_BASE_URL;

export type VideoPlayerMode = 'feed' | 'fullscreen' | 'preview' | 'episode' | 'studio';

export interface UnifiedVideoPlayerProps {
  // Core video props
  uri: string;
  videoData?: VideoItemType;

  // Player behavior
  mode: VideoPlayerMode;
  autoPlay?: boolean;
  loop?: boolean;
  isActive?: boolean;

  // UI customization - Default to true for unified experience
  showControls?: boolean;
  showInteractions?: boolean;
  showDetails?: boolean;
  showComments?: boolean;
  showWallet?: boolean;
  containerHeight?: number;

  // Callbacks
  onPlaybackStatusUpdate?: (status: any) => void;
  onVideoEnd?: () => void;
  onError?: (error: string) => void;
  onEpisodeChange?: (episodeData: any) => void;

  // Interaction props (always available for unified experience)
  setGiftingData?: (data: any) => void;
  setIsWantToGift?: (value: boolean) => void;
  showCommentsModal?: boolean;
  setShowCommentsModal?: (value: boolean) => void;

  // Episode-specific props
  episodeTitle?: string;
  seriesTitle?: string;
  episodeNumber?: number;
  seasonNumber?: number;

  // Studio-specific props
  onDelete?: () => void;
  showDeleteButton?: boolean;

  // Style overrides
  style?: any;
}

const UnifiedVideoPlayer: React.FC<UnifiedVideoPlayerProps> = ({
  uri,
  videoData,
  mode = 'preview',
  autoPlay = false,
  loop = false,
  isActive = true,
  showControls = true,
  showInteractions = true, // Default to true for unified experience
  showDetails = true, // Default to true for unified experience
  showComments = true, // Default to true for unified experience
  showWallet = true, // Default to true for unified experience
  containerHeight,
  onPlaybackStatusUpdate,
  onVideoEnd,
  onError,
  onEpisodeChange,
  setGiftingData,
  setIsWantToGift,
  showCommentsModal = false,
  setShowCommentsModal,
  episodeTitle,
  seriesTitle,
  episodeNumber,
  seasonNumber,
  onDelete,
  showDeleteButton = false,
  style,
}) => {
  const { width, height } = Dimensions.get("screen");
  const { token } = useAuthStore();

  // Player setup
  const player = useVideoPlayer(uri, (p) => {
    p.loop = loop;
    p.volume = 1;
  });

  // Player state
  const [videoStatus, setVideoStatus] = useState<VideoPlayerStatus | null>(null);
  const [isPaused, setIsPaused] = useState(!autoPlay);
  const [isFullScreen, setIsFullScreen] = useState(mode === 'fullscreen');
  const [hasCalledWatchFunction, setHasCalledWatchFunction] = useState(false);
  const [screenSize, setScreenSize] = useState(Dimensions.get("screen"));

  // Video stats state (to handle real-time updates)
  const [currentLikes, setCurrentLikes] = useState(videoData?.likes || 0);
  const [currentGifts, setCurrentGifts] = useState(videoData?.gifts || 0);
  const [currentShares, setCurrentShares] = useState(videoData?.shares || 0);
  const [currentComments, setCurrentComments] = useState(videoData?.comments?.length || 0);

  // Calculate container dimensions based on mode
  const getContainerStyle = () => {
    switch (mode) {
      case 'feed':
        return {
          width: screenSize.width,
          height: containerHeight || screenSize.height,
        };
      case 'fullscreen':
      case 'episode':
        return {
          width: screenSize.width,
          height: screenSize.height,
        };
      case 'preview':
        return {
          width: '100%',
          height: 200, // Default preview height
        };
      case 'studio':
        return {
          width: '100%',
          aspectRatio: 16 / 9,
        };
      default:
        return {
          width: '100%',
          height: 200,
        };
    }
  };

  // Determine which features to show based on mode and props
  const shouldShowInteractions = () => {
    if (mode === 'preview') return false; // No interactions in preview mode
    return showInteractions && videoData && setGiftingData && setIsWantToGift;
  };

  const shouldShowDetails = () => {
    if (mode === 'preview') return false; // No details in preview mode
    return showDetails && videoData;
  };

  const shouldShowComments = () => {
    if (mode === 'preview') return false; // No comments in preview mode
    return showComments && videoData && setShowCommentsModal && typeof setShowCommentsModal === 'function';
  };

  const shouldShowWallet = () => {
    return showWallet && (mode === 'feed' || mode === 'fullscreen');
  };

  // History tracking (for feed mode)
  const handleTwoPercentWatch = useCallback(() => {
    const saveVideoToHistory = async () => {
      if (!token || !videoData?._id || !BACKEND_API_URL) {
        return;
      }
      try {
        const response = await fetch(`${BACKEND_API_URL}/user/history`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoId: videoData._id }),
        });
        if (!response.ok) throw new Error("Failed to save video to history");
        const data = await response.json();
        console.log("Video Saved to history:", data);
      } catch (err) {
        console.error("Failed to save video to history:", err);
      }
    };

    if (mode === 'feed' && (token && videoData?._id)) {
      saveVideoToHistory();
    }
  }, [videoData?._id, token, mode]);

  // Player controls
  const togglePlayPause = useCallback(() => {
    if (isPaused) {
      player.play();
    } else {
      player.pause();
    }
    setIsPaused(!isPaused);
  }, [isPaused, player]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  // Player lifecycle
  useEffect(() => {
    const subscription = player.addListener("statusChange", (event) => {
      setVideoStatus(event.status);

      if (onPlaybackStatusUpdate) {
        onPlaybackStatusUpdate({
          status: event.status,
          currentTime: player.currentTime,
          duration: player.duration,
          isPlaying: !isPaused,
        });
      }
    });
    return () => subscription.remove();
  }, [player, isPaused, onPlaybackStatusUpdate]);

  // Auto-play logic
  useEffect(() => {
    if (isActive && autoPlay) {
      player.play();
      setIsPaused(false);
    } else if (!isActive) {
      player.pause();
      player.currentTime = 0;
      setHasCalledWatchFunction(false);
      setIsPaused(true);
    }
  }, [isActive, autoPlay, player]);

  // Update stats when videoData changes
  useEffect(() => {
    if (videoData) {
      setCurrentLikes(videoData.likes || 0);
      setCurrentGifts(videoData.gifts || 0);
      setCurrentShares(videoData.shares || 0);
      setCurrentComments(videoData.comments?.length || 0);
    }
  }, [videoData]);

  // Stat update callbacks
  const handleLikeUpdate = useCallback((newLikeCount: number, isLiked: boolean) => {
    setCurrentLikes(newLikeCount);
  }, []);

  const handleShareUpdate = useCallback((newShareCount: number, isShared: boolean) => {
    setCurrentShares(newShareCount);
  }, []);

  const handleGiftUpdate = useCallback((newGiftCount: number) => {
    setCurrentGifts(newGiftCount);
  }, []);

  // Watch tracking for feed mode
  useEffect(() => {
    if (mode !== 'feed' || !isActive || hasCalledWatchFunction || videoStatus !== 'readyToPlay') {
      return;
    }

    const checkInterval = setInterval(() => {
      const videoDuration = player.duration ?? 0;
      if (videoDuration > 0) {
        const twoPercentMark = videoDuration * 0.02;
        if (player.currentTime > twoPercentMark) {
          handleTwoPercentWatch();
          setHasCalledWatchFunction(true);
          clearInterval(checkInterval);
        }
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [mode, isActive, player, hasCalledWatchFunction, handleTwoPercentWatch, videoStatus]);

  // Comments handlers
  const handleOpenComments = useCallback(() => {
    if (setShowCommentsModal && typeof setShowCommentsModal === 'function') {
      setShowCommentsModal(true);
      player.pause();
      setIsPaused(true);
    } else {
      console.log('⚠️ Comments not available - setShowCommentsModal not provided');
    }
  }, [player, setShowCommentsModal]);

  const handleCloseComments = useCallback(() => {
    if (setShowCommentsModal && typeof setShowCommentsModal === 'function') {
      setShowCommentsModal(false);
      player.play();
      setIsPaused(false);
    }
  }, [player, setShowCommentsModal]);

  const isBuffering = videoStatus === "loading";
  const containerStyle = getContainerStyle();

  return (
    <View style={[styles.container, containerStyle, style]}>
      {/* Seek overlays for feed mode */}
      {mode === 'feed' && (
        <>
          <Pressable
            style={styles.leftOverlay}
            onPress={() => {
              player.currentTime = Math.max(0, player.currentTime - 10);
            }}
          />
          <Pressable
            style={styles.rightOverlay}
            onPress={() => {
              const duration = player.duration ?? 0;
              player.currentTime = Math.min(duration, player.currentTime + 10);
            }}
          />
        </>
      )}

      {/* Main video pressable */}
      <Pressable
        style={[
          styles.fullScreenPressable,
          mode === 'feed' && { bottom: 2 }, // Account for progress bar
        ]}
        onPress={togglePlayPause}
      >
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />

        {/* Play button overlay */}
        {isPaused && showControls && (
          <View pointerEvents="none" style={styles.overlayLayer}>
            <View style={styles.brownOverlay} />
            <Play size={mode === 'episode' ? 60 : 40} color="white" />
          </View>
        )}
      </Pressable>

      {/* Loading indicator */}
      {isBuffering && (
        <View style={styles.bufferingIndicator}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Progress bar */}
      {showControls && (
        <VideoProgressBar player={player} isActive={isActive} />
      )}

      {/* Wallet button - Show in feed and fullscreen modes */}
      {shouldShowWallet() && (
        <View className="absolute top-16 left-5 z-50">
          <Pressable
            onPress={() => {
              console.log('💰 Wallet button pressed in UnifiedVideoPlayer!');
              try {
                // Try multiple navigation methods
                console.log('Attempting navigation...');
                router.push("/(dashboard)/wallet");
                console.log('✅ Navigation to wallet initiated');
              } catch (error) {
                console.error('❌ Navigation error:', error);
                // Try alternative paths
                try {
                  router.push("/wallet/wallet" as any);
                } catch (error2) {
                  console.error('❌ Alternative navigation failed:', error2);
                }
              }
            }}
            className="p-2 bg-black/50 rounded-full"
            style={{ minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <Image
              source={require("../assets/images/Wallet.png")}
              className="size-8"
            />
          </Pressable>
        </View>
      )}

      {/* Back button for fullscreen modes */}
      {(mode === 'fullscreen' || mode === 'episode') && (
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={require("../assets/images/back.png")}
            style={{ width: 24, height: 24, tintColor: 'white' }}
          />
        </Pressable>
      )}

      {/* Interactions - Show in all modes except preview */}
      {shouldShowInteractions() && (
        <View style={styles.interact}>
          <InteractOptions
            creator={videoData!.created_by}
            videoId={videoData!._id}
            likes={currentLikes}
            gifts={currentGifts}
            shares={currentShares}
            comments={currentComments}
            onCommentPress={shouldShowComments() ? handleOpenComments : undefined}
            onLikeUpdate={handleLikeUpdate}
            onShareUpdate={handleShareUpdate}
            onGiftUpdate={handleGiftUpdate}
          />
        </View>
      )}

      {/* Video details - Show in all modes except preview */}
      {shouldShowDetails() && (
        <View style={styles.details}>
          <VideoDetails
            videoId={videoData!._id}
            type={videoData!.type}
            videoAmount={videoData!.amount}
            name={videoData!.name}
            is_monetized={videoData!.is_monetized}
            community={videoData!.community}
            series={videoData!.series}
            episode_number={videoData!.episode_number}
            createdBy={videoData!.created_by}
            creatorPass={videoData!.creatorPassDetails}
            onToggleFullScreen={toggleFullScreen}
            isFullScreen={isFullScreen}
            onEpisodeChange={onEpisodeChange}
          />
        </View>
      )}

      {/* Episode title overlay */}
      {mode === 'episode' && (episodeTitle || seriesTitle) && (
        <View style={styles.titleOverlay}>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {episodeTitle}
          </Text>
          {seriesTitle && (
            <Text style={styles.seriesInfo} numberOfLines={1}>
              {seriesTitle} • S{seasonNumber}E{episodeNumber}
            </Text>
          )}
        </View>
      )}

      {/* Comments modal is now handled at VideoFeed level */}

      {/* Delete button for studio mode */}
      {mode === 'studio' && showDeleteButton && onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  leftOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "35%",
    zIndex: 1,
  },
  rightOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "35%",
    zIndex: 1,
  },
  fullScreenPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  brownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  bufferingIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  interact: {
    position: "absolute",
    bottom: "15%",
    right: 10,
    width: "auto",
    zIndex: 1,
    elevation: 1,
  },
  details: {
    position: "absolute",
    bottom: "2%",
    width: "100%",
    paddingLeft: 10,
    paddingRight: 16,
    zIndex: 1,
    elevation: 1,
  },
  titleOverlay: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 12,
  },
  episodeTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  seriesInfo: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  deleteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default UnifiedVideoPlayer;