import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { useVideoPlayer, VideoView, type VideoPlayerStatus } from "expo-video";
import InteractOptions from "./_components/interactOptions";
import VideoDetails from "./_components/VideoDetails";
import { Play } from "lucide-react-native";
import CommentsSection from "./_components/CommentSection";
import { VideoItemType } from "@/types/VideosType";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { GiftType } from "./VideoFeed";
// ADDED: Import the new self-contained progress bar component
import VideoProgressBar from "./_components/VideoProgressBar";

type Props = {
  BACKEND_API_URL: string;
  uri: string;
  isActive: boolean;
  videoData: VideoItemType;
  showCommentsModal: boolean;
  setShowCommentsModal: any;
  setIsWantToGift: any;
  setGiftingData: (type: GiftType) => void;
};

const PROGRESS_BAR_HEIGHT = 2;
const FULL_SCREEN_PRESSABLE_BOTTOM_OFFSET = PROGRESS_BAR_HEIGHT;
const { height } = Dimensions.get("screen");
const actualHeight = height-50;

const VideoItem = ({
  BACKEND_API_URL,
  uri,
  isActive,
  videoData,
  showCommentsModal,
  setShowCommentsModal,
  setGiftingData,
  setIsWantToGift,
}: Props) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.volume = 1;
  });

  const [videoStatus, setVideoStatus] = useState<VideoPlayerStatus | null>(
    null
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasCalledWatchFunction, setHasCalledWatchFunction] = useState(false);
  const [screenSize, setScreenSize] = useState(Dimensions.get("screen"));
  const { token } = useAuthStore();

  const handleTwoPercentWatch = useCallback(() => {
    const saveVideoToHistory = async () => {
      if (!token || !videoData?._id) {
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
        console.log("Video Saved to history ---------------", data);
      } catch (err) {
        console.error("Failed to save video to history:", err);
      }
    };
    if (token || videoData?._id) {
      saveVideoToHistory();
    }
  }, [videoData?._id, token, BACKEND_API_URL]);

  const toggleFullScreen = async () => {
    /* ... your logic ... */
  };

  const togglePlayPause = () => {
    if (isPaused) {
      player.play();
    } else {
      player.pause();
    }
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    const subscription = player.addListener("statusChange", (event) => {
      setVideoStatus(event.status);
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
      setHasCalledWatchFunction(false);
    }
  }, [isActive, player]);

  // --- FIX START ---
  // This effect now waits until the video is ready to play before starting its check.
  useEffect(() => {
    // Exit if not the active video, if the function was already called, or if the video isn't ready.
    if (!isActive || hasCalledWatchFunction || videoStatus !== 'readyToPlay') {
      return;
    }

    const checkInterval = setInterval(() => {
      const videoDuration = player.duration ?? 0;
      if (videoDuration > 0) {
        const twoPercentMark = videoDuration * 0.02;
        if (player.currentTime > twoPercentMark) {
          handleTwoPercentWatch();
          setHasCalledWatchFunction(true);
          clearInterval(checkInterval); // IMPORTANT: Stop the interval once its job is done.
        }
      }
    }, 500);

    return () => clearInterval(checkInterval);
    // Add `videoStatus` to the dependency array.
  }, [isActive, player, hasCalledWatchFunction, handleTwoPercentWatch, videoStatus]);
  // --- FIX END ---

  const isBuffering = videoStatus === "loading";

  const handleOpenComments = useCallback(() => {
    setShowCommentsModal(true);
    player.pause();
    setIsPaused(true);
  }, [player]);

  const handleCloseComments = useCallback(() => {
    setShowCommentsModal(false);
    player.play();
    setIsPaused(false);
  }, [player]);

  return (
    <View
      style={[
        styles.container,
        {
          width: screenSize.width,
          height: isFullScreen ? screenSize.width : actualHeight,
        },
      ]}
    >
      {/* Double-tap Seek Left */}
      <Pressable
        style={styles.leftOverlay}
        onPress={() => {
          player.currentTime = Math.max(0, player.currentTime - 10);
        }}
      />

      {/* Double-tap Seek Right */}
      <Pressable
        style={styles.rightOverlay}
        onPress={() => {
          const duration = player.duration ?? 0;
          player.currentTime = Math.min(duration, player.currentTime + 10);
        }}
      />

      <Pressable
        style={[
          styles.fullScreenPressable,
          { bottom: FULL_SCREEN_PRESSABLE_BOTTOM_OFFSET },
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

        {isPaused && (
          <View pointerEvents="none" style={styles.overlayLayer}>
            <View style={styles.brownOverlay} />
            <Play size={40} color="white" />
          </View>
        )}
      </Pressable>

      {isBuffering && (
        <View style={styles.bufferingIndicator}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* REPLACED: The old progress bar JSX is replaced by our new component */}
      <VideoProgressBar player={player} isActive={isActive} />

      <View className="absolute w-fit top-16 left-5">
        <Pressable onPress={() => router.push("/(dashboard)/wallet/wallet")}>
          <Image
            source={require("../../../assets/images/Wallet.png")}
            className="size-8"
          />
        </Pressable>
      </View>

      <View style={styles.interact}>
        <InteractOptions
          creator={videoData.created_by}
          setGiftingData={setGiftingData}
          setIsWantToGift={setIsWantToGift}
          videoId={videoData._id}
          likes={videoData.likes}
          gifts={videoData.gifts}
          shares={videoData.shares}
          comments={videoData.comments?.length}
          onCommentPress={handleOpenComments}
        />
      </View>

      {showCommentsModal && (
        <CommentsSection
          isOpen={showCommentsModal}
          onClose={handleCloseComments}
          commentss={videoData.comments}
          videoId={videoData._id}
          longVideosOnly={false}
        />
      )}

      <View style={styles.details}>
        <VideoDetails
          videoId={videoData._id}
          type={videoData.type}
          name={videoData.name}
          is_monetized={videoData.is_monetized}
          community={videoData.community}
          series={videoData?.series}
          episode_number={videoData?.episode_number}
          createdBy={videoData?.created_by}
          onToggleFullScreen={toggleFullScreen}
          isFullScreen={isFullScreen}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
  rightOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "35%",
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
  fullScreenPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
  interact: {
    position: "absolute",
    bottom: "15%",
    right: 10,
    width: "auto",
  },
  details: {
    position: "absolute",
    bottom: "2%",
    width: "100%",
    paddingLeft: 10,
    paddingRight: 16,
  },
});

export default VideoItem;