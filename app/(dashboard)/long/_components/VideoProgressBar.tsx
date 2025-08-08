import React, { useState, useEffect, useRef } from "react";
import { View, Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
import { VideoPlayer } from "expo-video";

const PROGRESS_BAR_HEIGHT = 3;

type Props = {
  player: VideoPlayer;
  isActive: boolean;
};

const VideoProgressBar = ({ player, isActive }: Props) => {
  const [currentTime, setCurrentTime] = useState(0);
  const progressBarContainerWidth = useRef<number>(0);

  // This effect tracks the video's current time to update the UI
  useEffect(() => {
    // If the video is not the active one, don't run the timer
    if (!isActive) {
      setCurrentTime(0);
      return;
    }

    const interval = setInterval(() => {
      // Update the state within this small component, causing only it to re-render
      setCurrentTime(player.currentTime);
    }, 250);

    return () => clearInterval(interval);
  }, [isActive, player]);

  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
  };

  // Function to seek when the progress bar is pressed
  const handleProgressBarPress = (event: {
    nativeEvent: { locationX: number };
  }) => {
    if (progressBarContainerWidth.current > 0) {
      const containerWidth = progressBarContainerWidth.current;
      const touchX = event.nativeEvent.locationX;
      const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
      const newTimeSeconds = seekPercentage * (player.duration || 0);

      player.currentTime = newTimeSeconds;
      setCurrentTime(newTimeSeconds); // Immediately update UI for responsiveness
      player.play(); // Ensure video plays after seeking
    }
  };

  const duration = player.duration ?? 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showProgressBar = duration > 0; 
  
  // Don't render anything if there's no duration (e.g., video is still loading) 
  if (!showProgressBar) return null;

  return (
    <Pressable
      style={styles.progressBarContainer}
      onLayout={handleProgressBarLayout}
      onPress={handleProgressBarPress}
    >
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 10, // Ensure it's visible on top of other content
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
});

// Memoize the component to prevent it from re-rendering if its props don't change.
export default React.memo(VideoProgressBar);