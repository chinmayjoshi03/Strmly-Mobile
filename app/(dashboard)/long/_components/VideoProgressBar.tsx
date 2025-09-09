import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Text,
  Pressable,
  Alert,
} from "react-native";
import { VideoPlayer } from "expo-video";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";

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
  const progressBarContainerWidth = useRef<number>(0);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const initialStartTime = access?.freeRange?.start_time ?? 0;
  const endTime = access?.freeRange?.display_till_time ?? duration;
  const hasSeekedInitially = useRef(false);
  const hasShownAccessModal = useRef(false);
  const modalDismissed = useRef(false);

  const { token } = useAuthStore();
  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  useEffect(() => {
    console.log(
      "freeRange start:",
      initialStartTime,
      "end:",
      endTime,
      "duration:",
      duration,
      "isPurchased:",
      access?.isPurchased,
      "for video:",
      videoId
    );
  }, [initialStartTime, endTime, duration, access?.isPurchased, videoId]);

  // ✅ API logic (untouched)
  const saveVideoToHistory = useCallback(async () => {
    if (!token || !videoId) return;
    try {
      const res = await fetch(`${BACKEND_API_URL}/user/history`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.message || "Failed to save video to history");
        return;
      }
      console.log("Video saved to history:", data.message);
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  }, [token, videoId, BACKEND_API_URL]);

  const incrementVideoViews = useCallback(async () => {
    if (!token || !videoId) return;
    try {
      const res = await fetch(`${BACKEND_API_URL}/videos/${videoId}/view`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.message || "Failed to increment video count");
        return;
      }
      console.log(data.message);
    } catch (err) {
      console.error("Failed to increment views:", err);
    }
  }, [token, videoId, BACKEND_API_URL]);

  // ✅ Track 2% milestone
  const hasTriggered2Percent = useRef(false);
  useEffect(() => {
    if (!isActive || duration <= 0) return;
    const percentWatched = (currentTime / duration) * 100;
    if (!hasTriggered2Percent.current && percentWatched >= 2) {
      hasTriggered2Percent.current = true;
      // saveVideoToHistory();
      // incrementVideoViews();
    }
  }, [currentTime, duration, isActive]);

  useEffect(() => {
    if (!isActive) hasTriggered2Percent.current = false;
  }, [isActive]);

  // ✅ Sync current time with interval and handle end time restriction
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const currentPlayerTime = player.currentTime || 0;
      setCurrentTime(currentPlayerTime);
      
      // Check if video has reached the end time and user doesn't have access
      if (!access?.isPurchased && endTime > 0 && currentPlayerTime >= endTime) {
        if (!hasShownAccessModal.current && !modalDismissed.current) {
          hasShownAccessModal.current = true;
          player.pause();
          setShowAccessModal(true);
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [isActive, player, access?.isPurchased, endTime]);

  // ✅ Handle initial seek if freeRange applies
  useEffect(() => {
    if (isActive && !hasSeekedInitially.current && initialStartTime > 0) {
      hasSeekedInitially.current = true;
      player.currentTime = initialStartTime;
      setCurrentTime(initialStartTime);
      player.play();
    }
  }, [isActive, initialStartTime, player]);

  // Reset modal state when video changes or becomes inactive
  useEffect(() => {
    if (!isActive) {
      hasShownAccessModal.current = false;
      setShowAccessModal(false);
    }
  }, [isActive, videoId]);

  // Reset state when video changes (new videoId)
  useEffect(() => {
    hasShownAccessModal.current = false;
    hasSeekedInitially.current = false;
    modalDismissed.current = false;
    setShowAccessModal(false);
  }, [videoId]);

  // Handle access modal close
  const handleAccessModalClose = () => {
    setShowAccessModal(false);
    modalDismissed.current = true; // Mark as dismissed for this video
    
    // If user has purchased access, restart from beginning
    if (access?.isPurchased) {
      player.currentTime = 0;
      setCurrentTime(0);
      player.play();
      hasShownAccessModal.current = false;
      modalDismissed.current = false; // Reset since they have access now
    } else {
      // If not purchased, pause the video and don't restart
      // This allows user to scroll to next video
      player.pause();
    }
  };

  // Layout width
  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
  };

  // ✅ Seek function with access restriction
  const handleSeek = (locationX: number) => {
    const containerWidth = progressBarContainerWidth.current;
    if (!duration || !player || containerWidth <= 0) return;

    const seekPercentage = Math.max(0, Math.min(1, locationX / containerWidth));
    const newTimeSeconds = seekPercentage * duration;

    // If user doesn't have access and tries to seek beyond end time, restrict it
    if (!access?.isPurchased && endTime > 0 && newTimeSeconds > endTime) {
      Alert.alert(
        "Content Access Required",
        "You need to purchase this content to access the full video.",
        [{ text: "OK" }]
      );
      return;
    }

    // If user doesn't have access and tries to seek before start time, restrict it
    if (!access?.isPurchased && initialStartTime > 0 && newTimeSeconds < initialStartTime) {
      Alert.alert(
        "Content Access Required", 
        "You need to purchase this content to access the full video.",
        [{ text: "OK" }]
      );
      return;
    }

    player.currentTime = newTimeSeconds;
    setCurrentTime(newTimeSeconds);
    player.play();
    console.log(
      "Seeking to:",
      seekPercentage,
      newTimeSeconds,
      "for video:",
      videoId
    );
  };

  // Progress %
  const progress = duration > 0 ? currentTime / duration : 0;

  if (duration <= 0) return null;

  // Calculate restricted progress for visual indication
  const restrictedProgress = !access?.isPurchased && endTime > 0 ? endTime / duration : 1;

  return (
    <>
      <View
        style={styles.progressBarContainer}
        onLayout={handleProgressBarLayout}
      >
        <View style={styles.progressBarBackground} />
        {/* Show restricted area if user doesn't have access */}
        {!access?.isPurchased && endTime > 0 && (
          <View 
            style={[
              styles.restrictedArea, 
              { width: `${restrictedProgress * 100}%` }
            ]} 
          />
        )}
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        <Pressable
          style={styles.touchArea}
          onPress={(event) => handleSeek(event.nativeEvent.locationX)}
        />
      </View>

      {showAccessModal && (
        <View style={styles.accessModalOverlay}>
          <View style={styles.accessModalContent}>
            <Text style={styles.accessModalText}>
              You don't have content access. Purchase this content to watch the full video.
            </Text>
            <Pressable
              onPress={handleAccessModalClose}
              style={styles.accessModalButton}
            >
              <Text style={styles.accessModalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: 20,
    justifyContent: "center",
    zIndex: 10,
    position: "relative",
  },
  progressBarBackground: {
    position: "absolute",
    width: "100%",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  restrictedArea: {
    position: "absolute",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "rgba(255, 255, 0, 0.5)", // Yellow tint for free preview area
    borderRadius: 2,
  },
  progressBar: {
    position: "absolute",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "white",
    borderRadius: 2,
  },
  touchArea: {
    position: "absolute",
    width: "100%",
    height: 16,
    top: -6,
    justifyContent: "center",
  },
  accessModalOverlay: {
    position: "absolute",
    top: -200,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
  accessModalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  accessModalText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  accessModalButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  accessModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default React.memo(VideoProgressBar, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.duration === next.duration &&
    prev.videoId === next.videoId &&
    prev.player === next.player
  );
});
