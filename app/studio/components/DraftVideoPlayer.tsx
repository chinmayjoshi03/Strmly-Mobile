import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, ArrowLeft, MoreVertical, SkipBack, SkipForward } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CONFIG } from '@/Constants/config';
import { useAuthStore } from '@/store/useAuthStore';

interface Draft {
  _id: string;
  name: string;
  description?: string;
  videoUrl?: string; // Drafts might not have video uploaded yet
  genre: string;
  type: string;
  language: string;
  age_restriction: boolean;
  communityId?: string;
  seriesId?: string;
  created_at: string;
  updated_at: string;
}

const DraftVideoPlayer = () => {
  const { id } = useLocalSearchParams();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showDraftList, setShowDraftList] = useState(false);
  
  const authToken = useAuthStore((state) => state.token);
  
  // Initialize player with a default source, update when draft changes
  const player = useVideoPlayer("", (player) => {
    player.loop = false;
    player.showNowPlayingNotification = true;
  });

  // Update player source when draft changes
  useEffect(() => {
    if (currentDraft?.videoUrl && player) {
      player.replace(currentDraft.videoUrl);
    }
  }, [currentDraft?.videoUrl, player]);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch user's drafts from API
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoading(true);
        
        if (!authToken) {
          console.error('No auth token available');
          setError("Authentication required. Please log in again.");
          return;
        }

        console.log('Fetching drafts from:', `${CONFIG.API_BASE_URL}/api/v1/drafts/all`);
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/drafts/all`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch drafts:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Failed to fetch drafts: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Drafts API Response:', data);
        
        if (data && Array.isArray(data)) {
          // Handle case where API returns array directly
          const draftsList = data;
          setDrafts(draftsList);
          
          // Find the specific draft or use the first one
          const draftId = id as string;
          let targetDraft = draftsList.find((draft: Draft) => draft._id === draftId);
          
          if (!targetDraft && draftsList.length > 0) {
            targetDraft = draftsList[0];
          }

          if (targetDraft) {
            const draftIndex = draftsList.findIndex((draft: Draft) => draft._id === targetDraft._id);
            setCurrentDraft(targetDraft);
            setCurrentDraftIndex(draftIndex);
          } else {
            setError('No valid drafts found');
          }
        } else if (data.drafts && Array.isArray(data.drafts)) {
          // Handle case where drafts are nested in a 'drafts' property
          setDrafts(data.drafts);
          
          const draftId = id as string;
          let targetDraft = data.drafts.find((draft: Draft) => draft._id === draftId);
          
          if (!targetDraft && data.drafts.length > 0) {
            targetDraft = data.drafts[0];
          }

          if (targetDraft) {
            const draftIndex = data.drafts.findIndex((draft: Draft) => draft._id === targetDraft._id);
            setCurrentDraft(targetDraft);
            setCurrentDraftIndex(draftIndex);
          } else {
            setError('No valid drafts found');
          }
        } else {
          console.error('Unexpected API response format:', data);
          setError('Unexpected response format from server');
        }
      } catch (err) {
        console.error('Error fetching drafts:', err);
        setError(err instanceof Error ? err.message : "Failed to load drafts");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [id, authToken]);

  const togglePlayPause = useCallback(() => {
    if (!currentDraft?.videoUrl) return;
    
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, player, currentDraft]);

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

  const playPreviousDraft = useCallback(() => {
    if (drafts && currentDraftIndex > 0) {
      const prevDraft = drafts[currentDraftIndex - 1];
      setCurrentDraft(prevDraft);
      setCurrentDraftIndex(currentDraftIndex - 1);
    }
  }, [drafts, currentDraftIndex]);

  const playNextDraft = useCallback(() => {
    if (drafts && currentDraftIndex < drafts.length - 1) {
      const nextDraft = drafts[currentDraftIndex + 1];
      setCurrentDraft(nextDraft);
      setCurrentDraftIndex(currentDraftIndex + 1);
    }
  }, [drafts, currentDraftIndex]);

  const selectDraft = useCallback((draftId: string) => {
    const draftIndex = drafts.findIndex(draft => draft._id === draftId);
    if (draftIndex !== -1) {
      setCurrentDraft(drafts[draftIndex]);
      setCurrentDraftIndex(draftIndex);
      setShowDraftList(false);
    }
  }, [drafts]);

  // Video player event listener
  useEffect(() => {
    const subscription = player.addListener("statusChange", (event) => {
      if (typeof event.status === 'object' && event.status !== null && 'position' in event.status && 'isPlaying' in event.status) {
        const status = event.status as { position: number; isPlaying: boolean };
        setCurrentTime(status.position / 1000); 
        setIsPlaying(status.isPlaying);
        
        if (player.duration) {
          setVideoDuration(player.duration / 1000);
        }
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [player]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const duration = (player.duration ?? 0) / 1000;
  const progress = duration > 0 ? Math.floor((currentTime / duration) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading drafts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentDraft || !drafts.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>No drafts found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentDraft.videoUrl ? (
        <Pressable onPress={handleScreenPress} style={StyleSheet.absoluteFillObject}>
          <VideoView
            style={StyleSheet.absoluteFillObject}
            player={player}
          />

          {/* Pause Overlay - only show when paused */}
          {!isPlaying && (
            <View pointerEvents="none" style={styles.overlayLayer}>
              <View style={styles.brownOverlay} />
              <Play size={60} color="white" />
            </View>
          )}

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

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
                    {currentDraft.name}
                  </Text>
                  <Text style={styles.videoSubtitle}>
                    Draft • {currentDraft.genre} • {currentDraft.language}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowDraftList(!showDraftList)} 
                  style={styles.controlButton}
                >
                  <MoreVertical size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Center Controls */}
              <View style={styles.centerControls}>
                <View style={styles.playbackControls}>
                  <TouchableOpacity 
                    onPress={playPreviousDraft} 
                    style={[styles.skipButton, { opacity: currentDraftIndex === 0 ? 0.5 : 1 }]}
                    disabled={currentDraftIndex === 0}
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
                    onPress={playNextDraft} 
                    style={[styles.skipButton, { opacity: currentDraftIndex === drafts.length - 1 ? 0.5 : 1 }]}
                    disabled={currentDraftIndex === drafts.length - 1}
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
                <View style={styles.draftBadge}>
                  <Text style={styles.draftBadgeText}>DRAFT</Text>
                </View>
              </View>
            </View>
          )}
        </Pressable>
      ) : (
        // Show draft info when no video is uploaded yet
        <View style={styles.noVideoContainer}>
          <View style={styles.draftInfoContainer}>
            <Text style={styles.draftTitle}>{currentDraft.name}</Text>
            <Text style={styles.draftDescription}>{currentDraft.description || "No description"}</Text>
            <View style={styles.draftMetadata}>
              <Text style={styles.metadataText}>Genre: {currentDraft.genre}</Text>
              <Text style={styles.metadataText}>Language: {currentDraft.language}</Text>
              <Text style={styles.metadataText}>Type: {currentDraft.type}</Text>
            </View>
            <View style={styles.noVideoMessage}>
              <Text style={styles.noVideoText}>📹 Video not uploaded yet</Text>
              <Text style={styles.noVideoSubtext}>Complete this draft to add video content</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={20} color="white" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Draft List Modal */}
      {showDraftList && (
        <View style={styles.draftListModal}>
          <View style={styles.draftListHeader}>
            <Text style={styles.draftListTitle}>Your Drafts</Text>
            <TouchableOpacity onPress={() => setShowDraftList(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.draftList}>
            {drafts.map((draft, index) => (
              <TouchableOpacity
                key={draft._id}
                style={[
                  styles.draftItem,
                  draft._id === currentDraft._id && styles.currentDraftItem
                ]}
                onPress={() => selectDraft(draft._id)}
              >
                <View style={styles.draftItemInfo}>
                  <Text style={styles.draftName} numberOfLines={1}>
                    {draft.name}
                  </Text>
                  <Text style={styles.draftGenre}>{draft.genre} • {draft.language}</Text>
                  <Text style={styles.draftStatus}>
                    {draft.videoUrl ? "📹 Video Ready" : "📝 Draft Only"}
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
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
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
  progressBarContainer: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    height: 4,
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
  draftBadge: {
    backgroundColor: "rgba(255, 165, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  draftBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  errorText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  draftInfoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: "100%",
    maxWidth: 400,
  },
  draftTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  draftDescription: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  draftMetadata: {
    marginBottom: 20,
  },
  metadataText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 5,
  },
  noVideoMessage: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(255, 165, 0, 0.2)",
    borderRadius: 10,
  },
  noVideoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  noVideoSubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    textAlign: "center",
  },
  draftListModal: {
    position: "absolute",
    right: 20,
    top: 100,
    bottom: 100,
    width: 300,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 10,
    padding: 15,
  },
  draftListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  draftListTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  draftList: {
    flex: 1,
  },
  draftItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  currentDraftItem: {
    backgroundColor: "rgba(255, 165, 0, 0.3)",
    borderWidth: 1,
    borderColor: "orange",
  },
  draftItemInfo: {
    flex: 1,
  },
  draftName: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  draftGenre: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginBottom: 4,
  },
  draftStatus: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
  },
});

export default DraftVideoPlayer;