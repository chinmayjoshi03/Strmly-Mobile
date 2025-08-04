import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, ArrowLeft, MoreVertical, SkipBack, SkipForward } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CONFIG } from '@/Constants/config';
import { useAuthStore } from '@/store/useAuthStore';

interface Episode {
  _id: string;
  name: string;
  description?: string;
  videoUrl: string;
  episode_number: number;
  season_number: number;
  views?: number;
  likes?: number;
  duration?: number;
  created_by?: {
    username: string;
  };
}

interface Series {
  title: string;
  episodes: Episode[];
}

const EpisodeVideoPlayer = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string>("");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  const authToken = useAuthStore((state) => state.token);
  
  // Initialize player with a default source, update when episode changes
  const player = useVideoPlayer("", (player) => {
    player.loop = false;
    player.showNowPlayingNotification = true;
  });
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // Update player source when episode changes
  useEffect(() => {
    if (episode?.videoUrl && player) {
      player.replace(episode.videoUrl);
    }
  }, [episode?.videoUrl, player]);

  // Fetch episode and series data from API
  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        
        if (!authToken) {
          setError("Authentication required");
          return;
        }

        console.log('Fetching episode data for ID:', id);
        
        // First, get the episode details
        const episodeResponse = await fetch(`${CONFIG.API_BASE_URL}/api/v1/episodes/${id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!episodeResponse.ok) {
          const errorText = await episodeResponse.text();
          console.error('Failed to fetch episode data:', {
            status: episodeResponse.status,
            statusText: episodeResponse.statusText,
            error: errorText,
            url: `${CONFIG.API_BASE_URL}/api/v1/episodes/${id}`
          });
          throw new Error(`Failed to fetch episode data: ${episodeResponse.status} ${episodeResponse.statusText}`);
        }

        const episodeData = await episodeResponse.json();
        console.log('Episode API response:', JSON.stringify(episodeData, null, 2));
        
        // Extract the series ID from the episode data
        const seriesId = episodeData.data?.series?._id || episodeData.series_id;
        if (!seriesId) {
          throw new Error('No series ID found in episode data');
        }
        
        // Now fetch the series data
        const seriesResponse = await fetch(`${CONFIG.API_BASE_URL}/api/v1/series/${seriesId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!seriesResponse.ok) {
          const errorText = await seriesResponse.text();
          console.error('Failed to fetch series data:', {
            status: seriesResponse.status,
            statusText: seriesResponse.statusText,
            error: errorText,
            url: `${CONFIG.API_BASE_URL}/api/v1/series/${seriesId}`
          });
          throw new Error(`Failed to fetch series data: ${seriesResponse.status} ${seriesResponse.statusText}`);
        }

        const seriesData = await seriesResponse.json();
        console.log('Series API response:', JSON.stringify(seriesData, null, 2));
        
        // Process the series data
        const series = seriesData.data || seriesData.series || seriesData;
        if (!series) {
          throw new Error('Invalid series data format');
        }

        const episodes = Array.isArray(series.episodes) 
          ? series.episodes 
          : [];
        
        if (episodes.length > 0) {
          // Find the current episode in the series episodes
          const currentEpisode = episodes.find((ep: Episode) => ep._id === id) || 
                               { ...episodeData.data, videoUrl: episodeData.data?.video_url || episodeData.data?.videoUrl };
          
          const episodeIndex = episodes.findIndex((ep: Episode) => ep._id === id);

          setEpisode({
            ...currentEpisode,
            videoUrl: currentEpisode.videoUrl || currentEpisode.video_url || ''
          });
          
          setSeries({
            title: series.title || series.name || 'Untitled Series',
            episodes: episodes.map((ep: any) => ({
              ...ep,
              videoUrl: ep.videoUrl || ep.video_url || ''
            }))
          });
          
          setCurrentEpisodeId(id as string);
          setCurrentEpisodeIndex(Math.max(0, episodeIndex));
        } else {
          console.warn('No episodes found in series data, using single episode');
          // If no episodes in series, just use the single episode we fetched
          const episodeToUse = episodeData.data || episodeData;
          setEpisode({
            ...episodeToUse,
            videoUrl: episodeToUse.video_url || episodeToUse.videoUrl || ''
          });
          
          setSeries({
            title: series.title || series.name || 'Untitled Series',
            episodes: [{
              ...episodeToUse,
              videoUrl: episodeToUse.video_url || episodeToUse.videoUrl || ''
            }]
          });
          
          setCurrentEpisodeId(id as string);
          setCurrentEpisodeIndex(0);
        }
      } catch (err) {
        console.error('Error fetching episode data:', err);
        setError(err instanceof Error ? err.message : "Failed to load episode");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEpisodeData();
    }
  }, [id, authToken]);

  const togglePlayPause = useCallback(() => {
    if (!player) return;
    
    if (isPlaying) {
      player.pause();
      setIsPaused(true);
    } else {
      player.play();
      setIsPaused(false);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, player]);

  const handleScreenPress = useCallback(() => {
    if (showControls) {
      setShowControls(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [showControls]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
    // Add fullscreen logic here
  }, [isFullScreen]);

  const playPreviousEpisode = useCallback(() => {
    if (series && currentEpisodeIndex > 0) {
      const prevEpisode = series.episodes[currentEpisodeIndex - 1];
      setEpisode(prevEpisode);
      setCurrentEpisodeId(prevEpisode._id);
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  }, [series, currentEpisodeIndex]);

  const playNextEpisode = useCallback(() => {
    if (series && currentEpisodeIndex < series.episodes.length - 1) {
      const nextEpisode = series.episodes[currentEpisodeIndex + 1];
      setEpisode(nextEpisode);
      setCurrentEpisodeId(nextEpisode._id);
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    }
  }, [series, currentEpisodeIndex]);

  const selectEpisode = useCallback((episodeId: string) => {
    if (series) {
      const episodeIndex = series.episodes.findIndex(ep => ep._id === episodeId);
      if (episodeIndex !== -1) {
        setEpisode(series.episodes[episodeIndex]);
        setCurrentEpisodeId(episodeId);
        setCurrentEpisodeIndex(episodeIndex);
        setShowEpisodeList(false);
      }
    }
  }, [series]);

  useEffect(() => {
    const subscription = player.addListener("statusChange", (event) => {
      if (typeof event.status === 'object' && event.status !== null && 'position' in event.status && 'isPlaying' in event.status) {
        const status = event.status as { position: number; isPlaying: boolean };
        setCurrentTime(status.position / 1000); 
        setIsPlaying(status.isPlaying);
        
        // Update duration if available
        if (player.duration) {
          setVideoDuration(player.duration / 1000);
        }
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [player]);

  const handleProgressBarPress = useCallback((event: any) => {
    const { locationX } = event.nativeEvent;
    const containerWidth = event.nativeEvent.target?.clientWidth || screenWidth;
    const progress = locationX / containerWidth;
    const duration = player.duration ?? 0;
    const seekTime = progress * duration; // Keep in milliseconds for expo-video
    
    // Try different seeking methods based on expo-video API
    try {
      if ('setPositionAsync' in player && typeof player.setPositionAsync === 'function') {
        (player as any).setPositionAsync(seekTime);
      } else if ('playFromPositionAsync' in player && typeof player.playFromPositionAsync === 'function') {
        (player as any).playFromPositionAsync(seekTime);
      } else if ('seekBy' in player && typeof player.seekBy === 'function') {
        const currentPos = currentTime * 1000; // Convert to milliseconds
        player.seekBy(seekTime - currentPos);
      } else if ('currentTime' in player) {
        // Direct assignment if available
        (player as any).currentTime = seekTime;
      } else {
        console.warn('Seek functionality not available on this player version');
      }
      
      setCurrentTime(seekTime / 1000); // Convert to seconds for display
    } catch (error) {
      console.error('Seek operation failed:', error);
    }
  }, [player, screenWidth, currentTime]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const duration = (player.duration ?? 0) / 1000; // Convert to seconds
  const progress = duration > 0 ? Math.floor((currentTime / duration) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.fixedBackButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!episode || !series) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Episode not found</Text>
        <TouchableOpacity style={styles.fixedBackButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={handleScreenPress} style={StyleSheet.absoluteFillObject}>
        <VideoView
          style={StyleSheet.absoluteFillObject}
          player={player}
        />

        {/* Pause Overlay - only show when paused */}
        {!isPlaying && !isBuffering && (
          <View pointerEvents="none" style={styles.overlayLayer}>
            <View style={styles.brownOverlay} />
            <Play size={60} color="white" />
          </View>
        )}

        {/* Buffering Indicator */}
        {isBuffering && (
          <View style={styles.bufferingIndicator}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}

        {/* Progress Bar */}
        {showProgressBar && (
          <Pressable
            style={styles.progressBarContainer}
            onPress={handleProgressBarPress}
          >
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </Pressable>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay} pointerEvents="box-none">
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity onPress={handleBack} style={styles.controlButton}>
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {series.title}
                </Text>
                <Text style={styles.videoSubtitle}>
                  S{episode.season_number}E{episode.episode_number} • {episode.name}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowEpisodeList(!showEpisodeList)} 
                style={styles.controlButton}
              >
                <MoreVertical size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <View style={styles.playbackControls}>
                <TouchableOpacity 
                  onPress={playPreviousEpisode} 
                  style={[styles.skipButton, { opacity: currentEpisodeIndex === 0 ? 0.5 : 1 }]}
                  disabled={currentEpisodeIndex === 0}
                >
                  <SkipBack size={30} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                  {isPlaying ? (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBar} />
                      <View style={styles.pauseBar} />
                    </View>
                  ) : (
                    <Play size={40} color="white" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={playNextEpisode} 
                  style={[styles.skipButton, { opacity: currentEpisodeIndex === series.episodes.length - 1 ? 0.5 : 1 }]}
                  disabled={currentEpisodeIndex === series.episodes.length - 1}
                >
                  <SkipForward size={30} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
              </Text>
              <TouchableOpacity onPress={toggleFullScreen} style={styles.fullscreenButton}>
                <Text style={styles.fullscreenText}>
                  {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>

      {/* Episode List Modal */}
      {showEpisodeList && (
        <View style={styles.episodeListModal}>
          <View style={styles.episodeListHeader}>
            <Text style={styles.episodeListTitle}>Episodes</Text>
            <TouchableOpacity onPress={() => setShowEpisodeList(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.episodeList}>
            {series.episodes.map((episodeItem, index) => (
              <TouchableOpacity
                key={episodeItem._id}
                style={[
                  styles.episodeItem,
                  episodeItem._id === currentEpisodeId && styles.currentEpisodeItem
                ]}
                onPress={() => selectEpisode(episodeItem._id)}
              >
                <View style={styles.episodeNumber}>
                  <Text style={styles.episodeNumberText}>
                    {episodeItem.episode_number}
                  </Text>
                </View>
                <View style={styles.episodeInfo}>
                  <Text style={styles.episodeName} numberOfLines={1}>
                    {episodeItem.name}
                  </Text>
                  <Text style={styles.episodeDescription} numberOfLines={2}>
                    {episodeItem.description || "No description available"}
                  </Text>
                  <Text style={styles.episodeStats}>
                    {episodeItem.views || 0} views • {episodeItem.likes || 0} likes
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  centered: {
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
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  brownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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
  progressBarContainer: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  topControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controlButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  videoTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  videoSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginTop: 2,
  },
  centerControls: {
    alignItems: "center",
    justifyContent: "center",
  },
  playbackControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },
  playButton: {
    padding: 20,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  pauseIcon: {
    flexDirection: "row",
    gap: 4,
  },
  pauseBar: {
    width: 6,
    height: 24,
    backgroundColor: "white",
    borderRadius: 3,
  },
  skipButton: {
    padding: 15,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: {
    color: "white",
    fontSize: 14,
  },
  fullscreenButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  fullscreenText: {
    color: "white",
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  fixedBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  episodeListModal: {
    position: "absolute",
    right: 20,
    top: 100,
    bottom: 100,
    width: 300,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 10,
    padding: 15,
  },
  episodeListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  episodeListTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  episodeList: {
    flex: 1,
  },
  episodeItem: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  currentEpisodeItem: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "white",
  },
  episodeNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  episodeNumberText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  episodeInfo: {
    flex: 1,
  },
  episodeName: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  episodeDescription: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginBottom: 4,
  },
  episodeStats: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
  },
});

export default EpisodeVideoPlayer;