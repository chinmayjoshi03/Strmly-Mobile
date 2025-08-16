import React, { useEffect, useRef } from "react";
import { View, Dimensions, Pressable, Image, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  usePlayerStore,
  setActivePlayer,
  clearActivePlayer,
} from "@/store/usePlayerStore";
import VideoControls from "./VideoControls";
import { VideoItemType } from "@/types/VideosType";
import CommentsSection from "./CommentSection";
import GiftingMessage from "./GiftingMessage";
import { router } from "expo-router";
import VideoProgressBar from "./VideoProgressBar";
import { useGiftingStore } from "@/store/useGiftingStore";
import SeriesPurchaseMessage from "./SeriesPurcchaseMessaage";
import CreatorPassBuyMessage from "./CreatorPassBuyMessage";
import VideoBuyMessage from "./VideoBuyMessage";

const { height: screenHeight } = Dimensions.get("window");
const VIDEO_HEIGHT = screenHeight;

type Props = {
  videoData: VideoItemType;
  isActive: boolean;
  showCommentsModal?: boolean;
  setShowCommentsModal?: (show: boolean) => void;
  onEpisodeChange?: (episodeData: any) => void;
  onStatsUpdate?: (stats: { likes?: number; gifts?: number; shares?: number; comments?: number }) => void;
};

const VideoPlayer = ({
  videoData,
  isActive,
  showCommentsModal = false,
  setShowCommentsModal,
  onEpisodeChange,
  onStatsUpdate,
}: Props) => {
  const {
    isGifted,
    isVideoPurchased,
    giftSuccessMessage,
    creator,
    videoName,
    series,
    isPurchasedPass,
    isPurchasedSeries,
    clearGiftingData,
    clearSeriesData,
    clearVideoAccessData,
    clearPassData
  } = useGiftingStore();

  const { _updateStatus } = usePlayerStore.getState();
  const isMutedFromStore = usePlayerStore((state) => state.isMuted);

  // Create refs for tracking component state
  const mountedRef = useRef(true);
  const statusListenerRef = useRef<any>(null);
  const prevUrlRef = useRef<string | null>(null);

  // FIX: Move the conditional check after hooks but handle gracefully
  const player = useVideoPlayer(videoData?.videoUrl || "", (p) => {
    p.loop = true;
    p.muted = isMutedFromStore;
  });

  // Track component mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isGifted) {
      player.pause();
    } else {
      player.play();
    }
  }, [isGifted]);

  // Optimized lifecycle management
  useEffect(() => {
    // Don't proceed if no video URL
    if (!videoData?.videoUrl) return;

    const handleStatus = (payload: any) => {
      if (isActive) {
        _updateStatus(payload.status, payload.error);
      }
    };

    const statusSubscription = player.addListener("statusChange", handleStatus);

    // 👇 Add this for continuous position updates
    const timeSub = player.addListener("timeUpdate", handleStatus);

    if (isActive) {
      // This video is visible and should play
      setActivePlayer(player);
      // Use the smart play function to handle audio interaction logic
      const { smartPlay } = usePlayerStore.getState();
      smartPlay();
    } else {
      // This video is not visible, pause and reset
      player.pause();

      // Reset to beginning for better UX, but don't block UI
      if (videoData?.videoUrl !== prevUrlRef.current) {
        prevUrlRef.current = videoData?.videoUrl;
        setTimeout(() => {
          if (mountedRef.current) player.currentTime = 0;
        }, 100);
      }
    }

    // Cleanup function
    return () => {
      // Always remove the listener
      statusSubscription.remove();
      timeSub.remove();
      // If this was the active player, clear the global reference
      if (isActive) {
        clearActivePlayer();
      }
    };
  }, [isActive, player, _updateStatus, videoData?.videoUrl]);

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;

      if (statusListenerRef.current) {
        statusListenerRef.current.remove();
      }

      // Use setTimeout to avoid blocking the UI thread during cleanup
      setTimeout(() => {
        try {
          player.replaceAsync(null);
        } catch (error) {
          // Ignore cleanup errors
        }
      }, 0);
    };
  }, [player]);

  // Render empty container if no video URL
  if (!videoData?.videoUrl) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        nativeControls={false}
        style={styles.video}
        contentFit="cover"
      />

      <VideoControls
        videoData={videoData}
        setShowCommentsModal={setShowCommentsModal}
        onEpisodeChange={onEpisodeChange}
        onStatsUpdate={onStatsUpdate}
      />

      <View className="absolute bottom-[2.56rem] left-0 h-5 z-10 right-0">
        <VideoProgressBar
          player={player}
          isActive={isActive}
          videoId={videoData._id}
          duration={
            videoData.duration || videoData.access?.freeRange?.display_till_time || 0
          }
          access={
            videoData.access || {
              isPlayable: true,
              freeRange: { start_time: 0, display_till_time: 0 },
              isPurchased: false,
              accessType: "free",
              price: 0,
            }
          }
        />
      </View>

      <View className="z-10 absolute top-10 left-5">
        <Pressable onPress={() => router.push("/(dashboard)/wallet")}>
          <Image
            source={require("../../../../assets/images/Wallet.png")}
            className="size-10"
          />
        </Pressable>
      </View>

      {isGifted && (
        <GiftingMessage
          isVisible={true}
          onClose={clearGiftingData}
          creator={creator}
          amount={giftSuccessMessage}
        />
      )}

      {isVideoPurchased && (
        <VideoBuyMessage
          isVisible={true}
          onClose={clearVideoAccessData}
          creator={creator}
          name={videoName}
          amount={giftSuccessMessage}
        />
      )}

      {isPurchasedPass && (
        <CreatorPassBuyMessage
          isVisible={true}
          onClose={clearPassData}
          creator={creator}
          amount={giftSuccessMessage}
        />
      )}

      {isPurchasedSeries && series && (
        <SeriesPurchaseMessage
          isVisible={true}
          onClose={clearSeriesData}
          series={series}
        />
      )}

      {showCommentsModal && setShowCommentsModal && (
        <CommentsSection
          onClose={() => setShowCommentsModal(false)}
          videoId={videoData._id}
          onPressUsername={(userId) => {
            // Navigate to user profile
            console.log("Navigate to user profile:", userId);
            try {
              router.push(`/(dashboard)/profile/public/${userId}`);
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}
          onPressTip={(commentId) => {
            // Open tip modal for comment
            console.log("Open tip modal for comment:", commentId);
            // You can implement tip modal logic here
          }}
          onCommentAdded={() => {
            // Update comment count when a new comment is added
            if (onStatsUpdate) {
              const newCommentCount = (videoData.comments?.length || 0) + 1;
              onStatsUpdate({ comments: newCommentCount });
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: VIDEO_HEIGHT,
    // flex: 1,
    width: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});

export default React.memo(VideoPlayer);
