import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CONFIG } from '../../../Constants/config';
import { useAuthStore } from '../../../store/useAuthStore';
import UnifiedVideoPlayer from '../../../components/UnifiedVideoPlayer';
import { VideoItemType } from '../../../types/VideosType';

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
  const { token } = useAuthStore();
  const { width, height } = Dimensions.get('screen');

  useEffect(() => {
    if (id) {
      fetchEpisodeData();
    }
  }, [id]);

  const fetchEpisodeData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('Authentication required');
      }

      // First try to get episode from series API
      const seriesResponse = await fetch(`${CONFIG.API_BASE_URL}/series/user`, {
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

  if (loading) {
    return (
      <View style={[styles.container, { width, height }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F1C40F" />
        </View>
      </View>
    );
  }

  if (error || !episode) {
    return (
      <View style={[styles.container, { width, height }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
      </View>
    );
  }

  // Convert episode to VideoItemType format for unified player
  const videoData: VideoItemType = {
    _id: episode._id,
    video: episode.videoUrl,
    videoUrl: episode.videoUrl,
    start_time: 0,
    display_till_time: 0,
    visibility: 'public',
    hidden_at: null,
    name: episode.name,
    description: episode.description,
    thumbnailUrl: episode.thumbnailUrl,
    likes: episode.likes || 0,
    gifts: 0,
    shares: episode.shares || 0,
    views: episode.views || 0,
    genre: '',
    type: 'episode',
    is_monetized: false,
    language: '',
    age_restriction: false,
    season_number: episode.season_number,
    is_standalone: false,
    created_by: {
      _id: episode.created_by._id,
      username: episode.created_by.username,
      profile_photo: ''
    },
    community: null,
    series: episode.series ? {
      _id: episode.series._id,
      title: episode.series.title,
      type: 'series',
      price: 0,
      total_episodes: 0,
      episodes: []
    } : null,
    episode_number: episode.episode_number,
    comments: []
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <UnifiedVideoPlayer
        uri={episode.videoUrl}
        videoData={videoData}
        mode="episode"
        autoPlay={true}
        loop={false}
        showControls={true}
        showInteractions={true}
        showDetails={true}
        showComments={true}
        showWallet={true}
        episodeTitle={episodeName || episode.name}
        seriesTitle={seriesTitle || episode.series?.title}
        episodeNumber={episodeNumber ? parseInt(episodeNumber, 10) : episode.episode_number}
        seasonNumber={seasonNumber ? parseInt(seasonNumber, 10) : episode.season_number}
        style={{ width, height }}
        setGiftingData={() => {}} // Add empty handlers for now
        setIsWantToGift={() => {}}
        setShowCommentsModal={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "black",
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
});

export default EpisodePlayerScreen;