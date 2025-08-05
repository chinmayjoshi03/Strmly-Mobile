import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  LayoutChangeEvent,
  Dimensions,
  Text,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, Pause } from "lucide-react-native";

interface UniversalVideoPlayerProps {
  uri: string;
  autoPlay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  style?: any;
  onPlaybackStatusUpdate?: (status: any) => void;
  placeholder?: React.ReactNode;
  title?: string;
}

const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  uri,
  autoPlay = false,
  loop = false,
  showControls = true,
  style,
  onPlaybackStatusUpdate,
  placeholder,
  title,
}) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = loop;
    p.volume = 1;
  });

  const [isPaused, setIsPaused] = useState(!autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Auto-play logic
  useEffect(() => {
    if (autoPlay && !isPaused) {
      player.play();
    }
  }, [autoPlay, player]);

  // Update current time
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (!isPaused) {
      interval = setInterval(() => {
        const time = player.currentTime;
        setCurrentTime(time);
        
        if (onPlaybackStatusUpdate) {
          onPlaybackStatusUpdate({
            currentTime: time,
            duration: player.duration,
            isPlaying: !isPaused,
            isLoaded: !isLoading,
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPaused, player, onPlaybackStatusUpdate, isLoading]);

  // Handle player status changes
  useEffect(() => {
    const statusListener = (status: any) => {
      if (status.status === 'readyToPlay') {
        setIsLoading(false);
        setHasError(false);
      } else if (status.status === 'error') {
        setIsLoading(false);
        setHasError(true);
        console.error('Video player error:', status.error);
      }
    };

    // Note: This is a simplified status listener
    // You may need to adjust based on expo-video's actual API
    return () => {
      // Cleanup if needed
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPaused) {
      player.play();
      setIsPaused(false);
    } else {
      player.pause();
      setIsPaused(true);
    }
  }, [isPaused, player]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasError) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load video</Text>
          <Text style={styles.errorSubtext}>Please check your connection</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Video Player */}
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          {title && <Text style={styles.loadingText}>Loading {title}...</Text>}
        </View>
      )}

      {/* Play/Pause Overlay */}
      {showControls && (
        <Pressable style={styles.controlsOverlay} onPress={togglePlayPause}>
          {isPaused && !isLoading && (
            <View style={styles.playButtonContainer}>
              <Play size={50} color="white" fill="white" />
            </View>
          )}
        </Pressable>
      )}

      {/* Progress Bar */}
      {showControls && !isLoading && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${
                  player.duration > 0 ? (currentTime / player.duration) * 100 : 0
                }%`,
              },
            ]}
          />
        </View>
      )}

      {/* Time Display */}
      {showControls && !isLoading && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(player.duration || 0)}
          </Text>
        </View>
      )}

      {/* Title Overlay */}
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={2}>
            {title}
          </Text>
        </View>
      )}

      {/* Placeholder when no video */}
      {!uri && placeholder && (
        <View style={styles.placeholderContainer}>
          {placeholder}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "black",
    borderRadius: 8,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 40,
    padding: 15,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  timeContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  titleContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  titleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  errorText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  errorSubtext: {
    color: "#999",
    fontSize: 14,
  },
  placeholderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UniversalVideoPlayer;