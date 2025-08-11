import React, { useState, useEffect, useRef } from "react";
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

  const { seekTo } = usePlayerStore.getState();
  const { token } = useAuthStore();
  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  const initialStartTime = access?.freeRange?.start_time ?? 0;
  const hasSeekedInitially = useRef(false);
  const isMounted = useRef(false);
  const hasTriggeredMilestone = useRef(false);
  const milestoneTime = duration * 0.02;

  // Reset seek flag on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      hasSeekedInitially.current = false;
    };
  }, []);

  // Initial seek logic
  useEffect(() => {
    if (isActive && !hasSeekedInitially.current && initialStartTime >= 0) {
      hasSeekedInitially.current = true;

      player.currentTime = initialStartTime;
      setCurrentTime(initialStartTime);
      seekTo(initialStartTime);
      console.log("Initial seek triggered:", initialStartTime);
      console.log("Player currentTime after seek:", player.currentTime);
    }
  }, [isActive, initialStartTime, player, seekTo]);

  // History API
  const saveVideoToHistory = async () => {
    if (!token || !videoId) {
      return;
    }
    try {
      const response = await fetch(`${BACKEND_API_URL}/user/history`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: videoId }),
      });
      if (!response.ok) throw new Error("Failed to save video to history");
      const data = await response.json();
      console.log("Video Saved to history ---------------", data);
    } catch (err) {
      console.error("Failed to save video to history:", err);
    }
  };

  // View API
  const incrementVideoViews = async () => {
    if (!token || !videoId) {
      return;
    }
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/videos/${videoId}/view`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to save video to history");
      const data = await response.json();
      console.log(data.message);
    } catch (err) {
      console.error("Failed to update the video count:", err);
    }
  };

  // Poll current time only when active
  useEffect(() => {
    if (!isActive) {
      setCurrentTime(0);
      return;
    }

    const interval = setInterval(() => {
      if (!isDragging) {
        const time = player.currentTime;
        setCurrentTime(time);

        if (!hasTriggeredMilestone.current && time >= milestoneTime) {
          hasTriggeredMilestone.current = true;
          saveVideoToHistory();
          incrementVideoViews();
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isActive, player, isDragging, milestoneTime]);

  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragMove = (event: GestureResponderEvent) => {
    const containerWidth = progressBarContainerWidth.current;
    const touchX = event.nativeEvent.locationX;
    const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
    const newTimeSeconds = seekPercentage * duration;
    setDragTime(newTimeSeconds);
  };

  const handleDragEnd = (event: GestureResponderEvent) => {
    setIsDragging(false);
    const containerWidth = progressBarContainerWidth.current;
    const touchX = event.nativeEvent.locationX;
    const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
    const newTimeSeconds = seekPercentage * duration;

    player.currentTime = newTimeSeconds;
    setCurrentTime(newTimeSeconds);
    seekTo(newTimeSeconds);
    console.log("Seeking to:", newTimeSeconds);
    player.play();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showProgressBar = duration > 0;

  if (!showProgressBar) return null;

  return (
    <Pressable
      style={styles.progressBarContainer}
      onLayout={handleProgressBarLayout}
      onPress={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
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
