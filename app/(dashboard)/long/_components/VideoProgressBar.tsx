// import React, { useState, useEffect, useRef } from "react";
// import { View, Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
// import { VideoPlayer } from "expo-video";

// const PROGRESS_BAR_HEIGHT = 2;

// type Props = {
//   player: VideoPlayer;
//   isActive: boolean;
// };

// const VideoProgressBar = ({ player, isActive }: Props) => {
//   const [currentTime, setCurrentTime] = useState(0);
//   const progressBarContainerWidth = useRef<number>(0);

//   // This effect tracks the video's current time to update the UI
//   useEffect(() => {
//     // If the video is not the active one, don't run the timer
//     if (!isActive) {
//       setCurrentTime(0);
//       return;
//     }

//     const interval = setInterval(() => {
//       // Update the state within this small component, causing only it to re-render
//       setCurrentTime(player.currentTime);
//     }, 250);

//     return () => clearInterval(interval);
//   }, [isActive, player]);

//   const handleProgressBarLayout = (event: LayoutChangeEvent) => {
//     progressBarContainerWidth.current = event.nativeEvent.layout.width;
//   };

//   // Function to seek when the progress bar is pressed
//   const handleProgressBarPress = (event: {
//     nativeEvent: { locationX: number };
//   }) => {
//     if (progressBarContainerWidth.current > 0) {
//       const containerWidth = progressBarContainerWidth.current;
//       const touchX = event.nativeEvent.locationX;
//       const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
//       const newTimeSeconds = seekPercentage * (player.duration || 0);

//       player.currentTime = newTimeSeconds;
//       setCurrentTime(newTimeSeconds); // Immediately update UI for responsiveness
//       player.play(); // Ensure video plays after seeking
//     }
//   };

//   const duration = player.duration ?? 0;
//   const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
//   const showProgressBar = duration > 0;

//   // Don't render anything if there's no duration (e.g., video is still loading)
//   if (!showProgressBar) {
//     return null; 
//   }

//   return (
//     <Pressable
//       style={styles.progressBarContainer}
//       onLayout={handleProgressBarLayout}
//       onPress={handleProgressBarPress}
//     >
//       <View style={[styles.progressBar, { width: `${progress}%` }]} />
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   progressBarContainer: {
//     width: "100%",
//     position: "absolute",
//     bottom: 0,
//     height: PROGRESS_BAR_HEIGHT,
//     backgroundColor: "rgba(255, 255, 255, 0.3)",
//     zIndex: 10, // Ensure it's visible on top of other content
//   },
//   progressBar: {
//     height: "100%",
//     backgroundColor: "white",
//   },
// });

// // Memoize the component to prevent it from re-rendering if its props don't change.
// export default React.memo(VideoProgressBar);


// Fixed VideoProgressBar.tsx
import React, { useRef } from 'react';
import { View, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { usePlayerStore } from '@/store/usePlayerStore';

const PROGRESS_BAR_HEIGHT = 4;

const VideoProgressBar = () => {
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const buffered = usePlayerStore((state) => state.buffered);
  const seekTo = usePlayerStore((state) => state.seekTo);

  const barWidth = useRef<number>(0);

  const onLayout = (event: LayoutChangeEvent) => {
    barWidth.current = event.nativeEvent.layout.width;
  };

  const onSeek = (event: any) => {
    const { locationX } = event.nativeEvent;
    if (barWidth.current > 0 && duration > 0) {
      const percentage = Math.max(0, Math.min(1, locationX / barWidth.current));
      const newPosition = percentage * duration;
      seekTo(newPosition);
    }
  };

  // Don't render if no duration
  if (!duration || duration === 0) return null;

  const progressPercent = Math.max(0, Math.min(100, (position / duration) * 100));
  const bufferedPercent = Math.max(0, Math.min(100, (buffered / duration) * 100));

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.pressable} 
        onLayout={onLayout} 
        onPress={onSeek}
        hitSlop={{ top: 10, bottom: 10, left: 0, right: 0 }}
      >
        {/* Background bar */}
        <View style={styles.backgroundBar} />
        
        {/* Buffered bar */}
        <View style={[styles.bar, styles.bufferedBar, { width: `${bufferedPercent}%` }]} />
        
        {/* Progress bar */}
        <View style={[styles.bar, styles.progressBar, { width: `${progressPercent}%` }]} />
        
        {/* Progress indicator dot */}
        <View style={[styles.progressDot, { left: `${progressPercent}%` }]} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    height: PROGRESS_BAR_HEIGHT + 10, // Extra height for touch area
    justifyContent: 'center',
    zIndex: 10
  },
  pressable: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
  },
  backgroundBar: {
    height: PROGRESS_BAR_HEIGHT,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
  },
  bar: {
    height: PROGRESS_BAR_HEIGHT,
    position: 'absolute',
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
  },
  bufferedBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressBar: {
    backgroundColor: '#ff6b6b',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    position: 'absolute',
    marginLeft: -4, // Center the dot
    top: '50%',
    marginTop: -4,
  },
});

export default React.memo(VideoProgressBar);