import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Text,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { VideoPlayer } from "expo-video";

const PROGRESS_BAR_HEIGHT = 4; // Thicker progress bar like YouTube/TikTok

type AccessType = {
  isPlayable: boolean;
  freeRange: {
    start_time: number;
    display_till_time: number;
  };
  isPurchased: boolean;
  accessType: string;
  price: number;
};

type Props = {
  videoId: string;
  player: VideoPlayer;
  isActive: boolean;
  duration: number;
  access: AccessType;
};

const VideoProgressBar = ({
  videoId,
  player,
  isActive,
  duration,
  access,
}: Props) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const [dragProgress, setDragProgress] = useState(0);
  const progressBarContainerWidth = useRef<number>(0);

  const initialStartTime = access?.freeRange?.start_time ?? 0;
  const hasSeekedInitially = useRef(false);
  const seekInProgress = useRef(false);
  const wasPlayingBeforeSeek = useRef(false);
  const userInteracting = useRef(false);
  const touchStartTime = useRef(0);

  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (isActive && lastTimeRef.current > 0) {
      const currentPlayerTime = player.currentTime || 0;
      if (Math.abs(lastTimeRef.current - currentPlayerTime) > 1) {
        console.log("Restoring position to:", lastTimeRef.current);
        const offset = lastTimeRef.current - currentPlayerTime;
        player.seekBy(offset);
      }
    }
  }, [isActive, player]);

  // Initial seek logic
  useEffect(() => {
    if (isActive && !hasSeekedInitially.current && initialStartTime >= 0) {
      hasSeekedInitially.current = true;
      if (initialStartTime > 0) {
        console.log("Initial seek to:", initialStartTime);
        player.seekBy(initialStartTime);
      }
      setCurrentTime(initialStartTime);
      player.play();
    }
  }, [isActive, initialStartTime, player]);

  // Time sync and milestone tracking
  useEffect(() => {
    if (!isActive) {
      setCurrentTime(0);
      return;
    }

    const interval = setInterval(() => {
      // Only sync time when user is definitely not interacting
      if (!isDragging && !seekInProgress.current && !userInteracting.current) {
        const time = typeof player.currentTime === "number" ? player.currentTime : 0;

        // Only update if we have a valid time and it makes sense
        if (time >= 0) {
          const timeDiff = Math.abs(time - lastTimeRef.current);
          
          // Handle looping: if time is much smaller than lastTime, it's likely a loop restart
          const isLoopRestart = time < 2 && lastTimeRef.current > duration - 2;
          
          // Only allow natural progression or loop restarts
          // Be very conservative to avoid interfering with seeks
          if (isLoopRestart) {
            console.log("Video looped - restarting from beginning");
            setCurrentTime(time);
            lastTimeRef.current = time;
          } else if (time >= lastTimeRef.current - 0.5 && timeDiff < 2) {
            // Only allow small, forward progression
            setCurrentTime(time);
            lastTimeRef.current = time;
          }
          // Block all other updates to prevent interference with seeks
        }
      }
    }, 200); // Slower updates to reduce interference

    return () => clearInterval(interval);
  }, [isActive, player, isDragging, duration]);

  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
  };

  const handleSeek = (newTimeSeconds: number) => {
    if (seekInProgress.current) return;

    seekInProgress.current = true;

    try {
      if (newTimeSeconds < 0 || newTimeSeconds > duration) {
        console.warn("Blocked seek: out of bounds", newTimeSeconds, duration);
        return;
      }

      console.log("Seeking to absolute position:", newTimeSeconds, "seconds");

      // Disable time sync for a longer period during seeking
      userInteracting.current = true;

      // Update our local state immediately to show the seek position
      setCurrentTime(newTimeSeconds);
      lastTimeRef.current = newTimeSeconds;

      // Try multiple seek methods to ensure it works
      try {
        // Method 1: Direct assignment
        player.currentTime = newTimeSeconds;
      } catch (e) {
        console.log("Direct assignment failed, trying seekBy");
        // Method 2: Seek by offset
        const currentPlayerTime = player.currentTime || 0;
        const seekOffset = newTimeSeconds - currentPlayerTime;
        if (Math.abs(seekOffset) > 0.1) {
          player.seekBy(seekOffset);
        }
      }

      console.log("Seek initiated to:", newTimeSeconds);
    } catch (error) {
      console.error("Seek failed:", error);
    } finally {
      // Allow next seek immediately but keep user interaction flag longer
      seekInProgress.current = false;
    }
  };

  const handleTouchStart = (event: GestureResponderEvent) => {
    const containerWidth = progressBarContainerWidth.current;
    if (containerWidth > 0) {
      console.log("Touch start - preparing to seek");
      touchStartTime.current = Date.now();
      userInteracting.current = true;
      wasPlayingBeforeSeek.current = player.playing;

      setIsDragging(true);

      const touchX = event.nativeEvent.locationX;
      const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
      const newTime = seekPercentage * duration;

      console.log("Touch start - will seek to:", newTime, "seconds");

      setDragProgress(seekPercentage);
      setDragTime(newTime);

      // Don't seek immediately, wait for touch end for more reliable seeking
    }
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (!isDragging) return;

    const containerWidth = progressBarContainerWidth.current;
    if (containerWidth > 0) {
      const touchX = event.nativeEvent.locationX;
      const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
      const newTime = seekPercentage * duration;

      setDragProgress(seekPercentage);
      setDragTime(newTime);

      // Update visual progress immediately, but don't seek continuously during drag
      // This provides smooth visual feedback without overwhelming the player
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    console.log("Touch end - finalizing seek and resuming playback");

    // Get the final seek position from dragTime if available
    const finalSeekTime = dragTime !== null ? dragTime : currentTime;

    setIsDragging(false);
    setDragTime(null);

    // Ensure we're at the correct position
    if (finalSeekTime !== null && finalSeekTime >= 0 && finalSeekTime <= duration) {
      console.log("Final seek to:", finalSeekTime);
      handleSeek(finalSeekTime);
    }

    // Keep user interaction flag active for much longer to prevent time sync interference
    setTimeout(() => {
      userInteracting.current = false;
      console.log("Re-enabling time sync after seek");
    }, 2000); // 2 seconds delay
  };

  const progress = isDragging ? dragProgress : (duration > 0 ? (currentTime / duration) : 0);
  const showProgressBar = duration > 0;

  if (!showProgressBar) return null;

  return (
    <View style={styles.progressBarContainer} onLayout={handleProgressBarLayout}>
      {/* Background track - gray/transparent */}
      <View style={styles.progressBarBackground} />

      {/* Filled progress - white bar that fills up as video progresses */}
      <View style={[styles.progressBar, {
        width: `${progress * 100}%`,
        opacity: isDragging ? 0.9 : 1,
      }]} />

      <Pressable
        style={styles.touchArea}
        onPressIn={handleTouchStart}
        onTouchMove={handleTouchMove}
        onPressOut={handleTouchEnd}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onPress={(event) => {
          // Handle quick taps
          const containerWidth = progressBarContainerWidth.current;
          if (containerWidth > 0 && !isDragging) {
            const touchX = event.nativeEvent.locationX;
            const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
            const newTime = seekPercentage * duration;

            console.log("Quick tap - seeking to:", newTime);
            handleSeek(newTime);

            // Ensure video continues playing
            if (!player.playing) {
              player.play();
            }
          }
        }}
      />

      {isDragging && dragTime !== null && (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>{formatTime(dragTime)}</Text>
        </View>
      )}
    </View>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: 20, // Increased height for better touch area
    justifyContent: "center",
    zIndex: 10,
    position: "relative",
  },
  progressBarBackground: {
    position: "absolute",
    width: "100%",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Semi-transparent white background
    borderRadius: 2,
  },
  progressBar: {
    position: "absolute",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "white", // Solid white fill
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  touchArea: {
    position: "absolute",
    width: "100%",
    height: 16,
    top: -6,
    justifyContent: "center",
  },
  timestampContainer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timestampText: {
    color: "white",
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 20,
  },
});

export default React.memo(VideoProgressBar);
