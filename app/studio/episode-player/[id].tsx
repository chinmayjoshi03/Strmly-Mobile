import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play } from 'lucide-react-native';
import { CONFIG } from '../../../Constants/config';
import { useAuthStore } from '../../../store/useAuthStore';

interface Episode {
  _id: string;
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  episode_number: number;
  season_number: number;
  created_by: {
    _id: string;
    username: string;
    email: string;
  };
  series?: {
    _id: string;
    title: string;
  };
  views?: number;
  likes?: number;
  shares?: number;
  createdAt: string;
}

const EpisodePlayerScreen: React.FC = () => {
  const { 
    id, 
    seriesTitle, 
    episodeNumber, 
    seasonNumber, 
    episodeName 
  } = useLocalSearchParams<{
    id: string;
    seriesTitle?: string;
    episodeNumber?: string;
    seasonNumber?: string;
    episodeName?: string;
  }>();

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { token } = useAuthStore();
  const { width, height } = Dimensions.get('screen');

  // Create video player
  const player = useVideoPlayer(episode?.videoUrl || '', (p) => {
    p.loop = false;
    p.volume = 1;
  });

  useEffect(() => {
    if (id) {
      fetchEpisodeData();
    }
  }, [id]);

  // Auto-play when episode is loaded
  useEffect(() => {
    if (episode && !isPaused) {
      player.play();
    }
  }, [episode, player, isPaused]);

  // Update current time
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (episode && !isPaused) {
      interval = setInterval(() => {
        setCurrentTime(player.currentTime);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [episode, isPaused, player]);

  const fetchEpisodeData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('Authentication required');
      }

      // First try to get episode from series API
      const seriesResponse = await fetch(`${CONFIG.API_BASE_URL}/api/v1/series/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (seriesResponse.ok) {
        const seriesData = await seriesResponse.json();
        console.log('Series data:', seriesData);

        // Find the episode in the series data
        let foundEpisode = null;
        for (const series of seriesData.data || []) {
          const episode = series.episodes?.find((ep: any) => ep._id === id);
          if (episode) {
            foundEpisode = {
              ...episode,
              series: {
                _id: series._id,
                title: series.title,
              },
            };
            break;
          }
        }

        if (foundEpisode) {
          setEpisode(foundEpisode);
        } else {
          throw new Error('Episode not found in series');
        }
      } else {
        throw new Error('Failed to fetch series data');
      }
    } catch (err) {
      console.error('Error fetching episode:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch episode');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const togglePlayPause = useCallback(() => {
    if (isPaused) {
      player.play();
      setIsPaused(false);
    } else {
      player.pause();
      setIsPaused(true);
    }
  }, [isPaused, player]);

  if (loading) {
    return (
      <View style={[styles.container, { width, height }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F1C40F" />
          <Text style={styles.loadingText}>Loading episode...</Text>
        </View>
        
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  if (error || !episode) {
    return (
      <View style={[styles.container, { width, height }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error</Text>
          <Text style={styles.errorSubtext}>{error || 'Episode not found'}</Text>
        </View>
        
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Video Player - Full Screen */}
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
      />

      {/* Play/Pause Overlay */}
      <Pressable style={styles.fullScreenPressable} onPress={togglePlayPause}>
        {isPaused && (
          <View style={styles.playButtonContainer}>
            <Play size={60} color="white" fill="white" />
          </View>
        )}
      </Pressable>

      {/* Progress Bar */}
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

      {/* Back Button */}
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Episode Title Overlay */}
      <View style={styles.titleOverlay}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {episodeName || episode.name}
        </Text>
        <Text style={styles.seriesInfo} numberOfLines={1}>
          {seriesTitle || episode.series?.title} • S{seasonNumber || episode.season_number}E{episodeNumber || episode.episode_number}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  fullScreenPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 2, // Account for progress bar
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    padding: 20,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  titleOverlay: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 12,
  },
  episodeTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  seriesInfo: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorSubtext: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

export default EpisodePlayerScreen;