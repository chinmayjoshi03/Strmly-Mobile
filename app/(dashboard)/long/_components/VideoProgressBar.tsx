import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  GestureResponderEvent,
  Text,
} from "react-native";
import { VideoPlayer } from "expo-video";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";
import CONFIG from "@/Constants/config";

const PROGRESS_BAR_HEIGHT = 3;

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
  const progressBarContainerWidth = useRef<number>(0);

  const { seekTo } = usePlayerStore();
  const { token } = useAuthStore();
  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  const initialStartTime = access?.freeRange?.start_time ?? 0;
  const hasSeekedInitially = useRef(false);
  const hasTriggeredMilestone = useRef(false);
  const milestoneTime = duration * 0.02;
  const seekInProgress = useRef(false);
  const wasPlayingBeforeSeek = useRef(false);

  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (isActive && lastTimeRef.current > 0) {
      player.seekTo?.(lastTimeRef.current);
    }
  }, [isActive, player]);

  // History API
  const saveVideoToHistory = useCallback(async () => {
    if (!token || !videoId) return;
    try {
      await fetch(`${BACKEND_API_URL}/user/history`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  }, [token, videoId, BACKEND_API_URL]);

  // View API
  const incrementVideoViews = useCallback(async () => {
    if (!token || !videoId) return;
    try {
      await fetch(`${BACKEND_API_URL}/videos/${videoId}/view`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Failed to increment views:", err);
    }
  }, [token, videoId, BACKEND_API_URL]);

  // Initial seek logic
  useEffect(() => {
    if (isActive && !hasSeekedInitially.current && initialStartTime >= 0) {
      (async () => {
        hasSeekedInitially.current = true;
        await seekTo(initialStartTime);
        setCurrentTime(initialStartTime);
        player.play();
      })();
    }
  }, [isActive, initialStartTime, player, seekTo]);

  // Time sync and milestone tracking
  useEffect(() => {
    if (!isActive) {
      setCurrentTime(0);
      return;
    }

    const interval = setInterval(() => {
      if (!isDragging && !seekInProgress.current) {
        const time =
          typeof player.currentTime === "number"
            ? player.currentTime
            : currentTime;
        setCurrentTime(time);
      }
      // Removed interval logging to reduce console noise
    }, 500);

    return () => clearInterval(interval);
  }, [isActive, player, isDragging, currentTime]);

  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
  };

  const handleDragStart = () => {
    wasPlayingBeforeSeek.current = player.playing;
    setIsDragging(true);
  };

  const handleDragMove = (event: GestureResponderEvent) => {
    const containerWidth = progressBarContainerWidth.current;
    const touchX = event.nativeEvent.locationX;
    const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
    setDragTime(seekPercentage * duration);
  };

  const handleSeek = async (newTimeSeconds: number) => {
    if (seekInProgress.current) return;
    seekInProgress.current = true;
    try {
      if (newTimeSeconds < 0.5 || newTimeSeconds > duration - 0.1) {
        console.warn("Blocked seek: out of bounds");
        return;
      }

      await seekTo(newTimeSeconds); // Guaranteed to finish seeking

      // After seek, always read actual player time
      const current =
        typeof player.currentTime === "number"
          ? player.currentTime
          : newTimeSeconds;
      setCurrentTime(current);
    } catch (error) {
      console.error("Seek failed:", error);
      setCurrentTime(player.currentTime);
    } finally {
      seekInProgress.current = false;
    }
  };

  const handleDragEnd = async (event: GestureResponderEvent) => {
    if (!progressBarContainerWidth.current) return;

    const touchX = event.nativeEvent.locationX;
    const seekPercentage = Math.max(
      0,
      Math.min(1, touchX / progressBarContainerWidth.current)
    );
    const newTimeSeconds = Math.min(seekPercentage * duration, duration - 0.1);

    setIsDragging(false);
    setDragTime(null);

    await handleSeek(newTimeSeconds);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showProgressBar = duration > 0;

  if (!showProgressBar) return null;

  return (
    <Pressable
      style={styles.progressBarContainer}
      onLayout={handleProgressBarLayout}
      onPressIn={handleDragStart}
      onPressOut={handleDragEnd}
      onTouchMove={handleDragMove}
    >
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
      <View style={[styles.knob, { left: `${progress}%` }]} />

      {isDragging && dragTime !== null && (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>{formatTime(dragTime)}</Text>
        </View>
      )}
    </Pressable>
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
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 10,
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  knob: {
    position: "absolute",
    top: -6,
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "transparent",
    zIndex: 20,
  },
  timestampContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timestampText: {
    color: "white",
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 20,
  },
});

export default React.memo(VideoProgressBar);
