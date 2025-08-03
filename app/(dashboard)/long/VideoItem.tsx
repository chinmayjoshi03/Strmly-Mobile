import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
  LayoutChangeEvent,
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

type Props = {
  uri: string;
  isActive: boolean;
  videoData: VideoItemType;
  showCommentsModal: boolean;
  setShowCommentsModal: any;
  setIsWantToGift: any;
  setGiftingData: {
    _id: string;
    profile?: string | undefined;
    username: string;
    email: string;
  };
};

// Define constants for layout to avoid magic numbers and make adjustments easier
const PROGRESS_BAR_HEIGHT = 2; // Keep your original height for the progress bar
const FULL_SCREEN_PRESSABLE_BOTTOM_OFFSET = PROGRESS_BAR_HEIGHT; // 10px buffer above progress bar

const VideoItem = ({
  uri,
  isActive,
  videoData,
  showCommentsModal,
  setShowCommentsModal,
  setGiftingData,
  setIsWantToGift,
}: Props) => {
  const { width, height } = Dimensions.get("screen");
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.volume = 1;
  });

  const [videoStatus, setVideoStatus] = useState<VideoPlayerStatus | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // ADDED: State to track if the watch function has been called for this video
  const [hasCalledWatchFunction, setHasCalledWatchFunction] = useState(false);

  // Ref to store the layout (width) of the progress bar container
  const progressBarContainerWidth = useRef<number>(0);

  const [screenSize, setScreenSize] = useState(Dimensions.get("screen"));

  // ADDED: The function to be called when the 2% watch time is reached
  const handleTwoPercentWatch = useCallback(() => {
    // You can replace this console.log with any function call you need, like an API request.
    console.log(
      `User has watched more than 2% of the video: ${videoData._id}`
    );
  }, [videoData._id]);

  const toggleFullScreen = async () => {
    // const newState = !isFullScreen;
    // console.log("Updated screen size:", screenSize);
    // setIsFullScreen(newState);
    // if (newState) {
    //   await ScreenOrientation.lockAsync(
    //     ScreenOrientation.OrientationLock.LANDSCAPE // Use LANDSCAPE as per your original
    //   );
    // } else {
    //   await ScreenOrientation.lockAsync(
    //     ScreenOrientation.OrientationLock.PORTRAIT_UP
    //   );
    // }
  };

  const togglePlayPause = () => {
    if (isPaused) {
      player.play();
    } else {
      player.pause();
    }
    setIsPaused(!isPaused); // Keep your original manual toggle of isPaused
  };

  useEffect(() => {
    const subscription = player.addListener("statusChange", (event) => {
      setVideoStatus(event.status);
      // Your original statusChange listener did not update isPaused,
      // so we will respect that and keep isPaused managed by togglePlayPause.
    });
    return () => subscription.remove();
  }, [player]);

  // MODIFIED: useEffect for isActive changes
  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0; // Keep your original currentTime reset
      // ADDED: Reset the flag when the video is no longer active
      setHasCalledWatchFunction(false);
    }
  }, [isActive, player]);

  // MODIFIED: This effect now starts the timer and checks for the 2% watch condition.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>; // Corrected type for setInterval return

    // We only need the timer when the video is the active one.
    if (isActive) {
      interval = setInterval(() => {
        const currentPlaybackTime = player.currentTime;
        const videoDuration = player.duration ?? 0;

        // This will now run consistently for the active video.
        setCurrentTime(currentPlaybackTime);

        // --- START: NEW LOGIC FOR 2% WATCH ---
        // 1. Find out 2% of video length
        const twoPercentMark = videoDuration * 0.02;

        // 2. Check if the user has crossed that margin and the function hasn't been called yet
        if (
          videoDuration > 0 &&
          !hasCalledWatchFunction &&
          currentPlaybackTime > twoPercentMark
        ) {
          handleTwoPercentWatch();
          setHasCalledWatchFunction(true); // Set the flag to true to prevent repeated calls
        }
        // --- END: NEW LOGIC FOR 2% WATCH ---
      }, 250);
    }
    // The cleanup function is crucial to stop the timer when the video is no longer active.
    return () => {
      // Ensure interval is defined before clearing it
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, player, hasCalledWatchFunction, handleTwoPercentWatch]); // MODIFIED: Added dependencies

  // Callback for when the progress bar container's layout is measured
  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
  };

  // Function to seek when the progress bar is pressed
  const handleProgressBarPress = (event: {
    nativeEvent: { locationX: number }; // Use number type
  }) => {
    if (progressBarContainerWidth.current > 0) {
      const containerWidth = progressBarContainerWidth.current;
      const touchX = event.nativeEvent.locationX;

      const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
      const newTimeSeconds = seekPercentage * (player.duration || 0);

      player.currentTime = newTimeSeconds; // Set the video playback position
      setCurrentTime(newTimeSeconds); // Immediately update local state for UI responsiveness

      // After seeking, always ensure the player is in the 'playing' state
      // This will ensure it continues playing from the new point.
      player.play();
      setIsPaused(false); // Update local state to reflect playing status immediately
    }
  };

  const duration = player.duration ?? 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showProgressBar = duration > 0;

  // Use `videoStatus ?? ""` to handle null for the includes method
  const isBuffering = ["buffering", "loading"].includes(videoStatus ?? "");

  // Function to open comments modal
  const handleOpenComments = useCallback(() => {
    setShowCommentsModal(true);
    player.pause(); // Optional: Pause video when comments modal opens
    setIsPaused(true);
  }, [player]);

  // Function to close comments modal
  const handleCloseComments = useCallback(() => {
    setShowCommentsModal(false);
    player.play(); // Optional: Resume video when comments modal closes
    setIsPaused(false);
  }, [player]);

  return (
    <View
      style={[
        styles.container,
        {
          width: screenSize.width,
          height: isFullScreen ? screenSize.width : screenSize.height,
        },
      ]}
    >
      {/* Double-tap Seek Left */}
      <Pressable
        style={styles.leftOverlay}
        onPress={() => {
          const newTime = Math.max(0, player.currentTime - 10);
          player.currentTime = newTime;
          setCurrentTime(newTime);
        }}
      />

      {/* Double-tap Seek Right */}
      <Pressable
        style={styles.rightOverlay}
        onPress={() => {
          const newTime = Math.min(
            player.duration ?? 0,
            player.currentTime + 10
          );
          player.currentTime = newTime;
          setCurrentTime(newTime);
        }}
      />

      {/* Updated fullScreenPressable to not cover the progress bar area */}
      <Pressable
        style={[
          styles.fullScreenPressable,
          { bottom: FULL_SCREEN_PRESSABLE_BOTTOM_OFFSET },
        ]}
        onPress={togglePlayPause}
      >
        {/* Video Layer */}
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />

        {/* Brown Overlay & Pause Icon */}
        {isPaused && (
          <View pointerEvents="none" style={styles.overlayLayer}>
            <View style={styles.brownOverlay} />
            <Play size={40} color="white" />
          </View>
        )}
      </Pressable>

      {/* Buffering Indicator - moved it out of the main overlay view to control zIndex better */}
      {isBuffering && (
        <View style={styles.bufferingIndicator}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Progress Bar Container - now a Pressable for interaction */}
      {showProgressBar && (
        <Pressable
          style={styles.progressBarContainer}
          onLayout={handleProgressBarLayout} // Measure its width
          onPress={handleProgressBarPress} // Handle taps to seek
        >
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </Pressable>
      )}

      {/* Wallet Button */}
      <View className="absolute w-fit top-16 left-5">
        <Pressable onPress={() => router.push("/(dashboard)/wallet/wallet")}>
          <Image
            source={require("../../../assets/images/Wallet.png")}
            className="size-8"
          />
        </Pressable>
      </View>

      {/* Interact Buttons */}
      <View style={styles.interact}>
        <InteractOptions
          creator={videoData.created_by}
          setGiftingData={setGiftingData}
          setIsWantToGift={setIsWantToGift}
          videoId={videoData._id}
          likes={videoData.likes}
          comments={videoData.comments?.length}
          onCommentPress={handleOpenComments}
        />
      </View>

      {/* Conditionally render the CommentSection modal */}
      {showCommentsModal && (
        <CommentsSection
          isOpen={showCommentsModal} // Pass the state controlling its visibility
          onClose={handleCloseComments}
          commentss={videoData.comments}
          videoId={videoData._id}
          longVideosOnly={false} // Or true, depending on your logic
        />
      )}

      {/* Video Info */}
      <View style={styles.details}>
        <VideoDetails
          videoId={videoData._id}
          type={videoData.type}
          name={videoData.name}
          series={videoData?.series}
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
    // zIndex: 10,
  },

  rightOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "35%",
    // zIndex: 10,
  },

  // Separate buffering indicator styles for better z-index control
  bufferingIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    width: "100%",
    position: "absolute",
    bottom: 0, // Keep at the very bottom
    height: PROGRESS_BAR_HEIGHT, // Use the defined constant
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  // The fullScreenPressable's bottom is now set dynamically based on progress bar height
  fullScreenPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    // bottom property is set inline now
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