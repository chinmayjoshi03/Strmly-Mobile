import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
  FlatList,
  Dimensions,
  BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CONFIG } from '@/Constants/config';
import { useAuthStore } from '@/store/useAuthStore';
import { router } from 'expo-router';
import EpisodeList from '../components/EpisodeList';
import VideoPlayer from '@/app/(dashboard)/long/_components/VideoPlayer';
import Constants from 'expo-constants';

interface SeriesDetailsScreenProps {
  seriesId: string;
  onBack: () => void;
  onAddNewEpisode: () => void;
}

interface SeriesData {
  _id: string;
  title: string;
  description: string;
  price: number;
  genre: string;
  language: string;
  type: string;
  status: string;
  total_episodes: number;
  episodes: Episode[];
  release_date: string;
  seasons: number;
  likes: number;
  shares: number;
  views: number;
  earned_till_date: number;
  total_earned: number;
  created_by: {
    _id: string;
    username: string;
    email: string;
  };
  analytics: {
    total_likes: number;
    total_views: number;
    total_shares: number;
    total_reshares: number;
    followers_gained_through_series: number;
    engagement_rate: number;
  };
  createdAt: string;
  updatedAt: string;
}

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
  views?: number;
  likes?: number;
}

const SeriesDetailsScreen: React.FC<SeriesDetailsScreenProps> = ({
  seriesId,
  onBack,
  onAddNewEpisode
}) => {
  const [seriesData, setSeriesData] = useState<SeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video player state
  const [isVideoPlayerActive, setIsVideoPlayerActive] = useState(false);
  const [currentVideoData, setCurrentVideoData] = useState<any>(null);
  const [currentVideoList, setCurrentVideoList] = useState<any[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const fetchSeriesDetails = async (showLoadingIndicator = true) => {
    try {
      const { token } = useAuthStore.getState();

      if (!token) {
        setError('Authentication required');
        if (showLoadingIndicator) {
          setLoading(false);
        }
        setRefreshing(false);
        return;
      }

      console.log(`Fetching series details for ID: ${seriesId}`);

      // Use the user series API to get series with episodes
      const response = await fetch(`${CONFIG.API_BASE_URL}/series/user?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('User series response:', result);

      if (response.ok && result.data) {
        // Find the specific series by ID
        const foundSeries = result.data.find((series: any) => series._id === seriesId);

        if (foundSeries) {
          console.log('Found series:', foundSeries);
          console.log('Episodes data:', foundSeries.episodes);
          console.log('Total episodes:', foundSeries.total_episodes);
          setSeriesData(foundSeries);
        } else {
          setError('Series not found');
        }
      } else {
        setError(result.error || 'Failed to fetch series details');
      }
    } catch (error) {
      console.error('Error fetching series details:', error);
      setError('Network error occurred');
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSeriesDetails();
  }, [seriesId]);

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (isVideoPlayerActive) {
        closeVideoPlayer();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isVideoPlayerActive]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSeriesDetails(false);
  }, [seriesId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Video player functions
  const handleVideoPlayerOpen = (episode: Episode, allEpisodes: Episode[]) => {
    console.log('🎬 Opening video player for episode:', episode.name);

    // Convert episodes to video format
    const videoList = allEpisodes.map(ep => ({
      _id: ep._id,
      name: ep.name,
      title: ep.name,
      videoUrl: ep.videoUrl,
      thumbnailUrl: ep.thumbnailUrl,
      description: ep.description,
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      created_by: ep.created_by,
      views: ep.views || 0,
      likes: ep.likes || 0,
      type: 'episode',
      comments: []
    }));

    const currentIndex = allEpisodes.findIndex(ep => ep._id === episode._id);

    setCurrentVideoData(videoList[currentIndex]);
    setCurrentVideoList(videoList);
    setCurrentVideoIndex(currentIndex >= 0 ? currentIndex : 0);
    setIsVideoPlayerActive(true);
  };

  const closeVideoPlayer = () => {
    setIsVideoPlayerActive(false);
    setCurrentVideoData(null);
    setCurrentVideoList([]);
    setCurrentVideoIndex(0);
    setShowCommentsModal(false);
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentVideoIndex(viewableItems[0].index);
    }
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 mt-12">
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-medium">Series Details</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F1C40F" />
          <Text className="text-gray-400 mt-4">Loading series details...</Text>
        </View>
      </View>
    );
  }

  if (error || !seriesData) {
    return (
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 mt-12">
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-medium">Series Details</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-red-400 text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchSeriesDetails(true)}
            className="bg-gray-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-12">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-medium">{seriesData.title}</Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={["#FFFFFF"]}
          />
        }
      >
        {/* Series Info */}
        <View className="px-4 py-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-lg font-medium">
                Total episode: {(seriesData.total_episodes || 0).toString().padStart(2, '0')}
              </Text>
              <Text className="text-gray-400 text-sm">
                Launch on {formatDate(seriesData.release_date)}
              </Text>
            </View>
          </View>

          {/* Analytics */}
          <View className="flex-row justify-between mb-8">
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {formatNumber(seriesData.analytics?.total_views || 0)}
              </Text>
              <Text className="text-gray-400 text-sm">Total view</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                ₹{formatNumber(seriesData.total_earned || 0)}
              </Text>
              <Text className="text-gray-400 text-sm">Total earning</Text>
            </View>
          </View>
        </View>

        {/* Episodes List */}
        <View className="px-4">
          <EpisodeList
            episodes={seriesData.episodes || []}
            seriesTitle={seriesData.title}
            seriesId={seriesData._id}
            onEpisodeDeleted={() => fetchSeriesDetails(false)}
            onVideoPlayerOpen={handleVideoPlayerOpen}
          />
        </View>

        {/* Add some bottom padding */}
        <View className="h-20" />
      </ScrollView>

      {/* Add New Episode Button */}
      <View className="px-4 py-4" style={{ marginBottom: 80 }}>
        <TouchableOpacity
          onPress={onAddNewEpisode}
          className="bg-gray-200 rounded-full py-4 items-center"
        >
          <Text className="text-black text-lg font-medium">Add new episode</Text>
        </TouchableOpacity>
      </View>

      {/* Integrated Video Player */}
      {isVideoPlayerActive && currentVideoData && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'black',
          zIndex: 1000,
        }}>
          <FlatList
            data={currentVideoList}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <VideoPlayer
                key={`${item._id}-${index === currentVideoIndex}`}
                videoData={item}
                isActive={index === currentVideoIndex}
                showCommentsModal={showCommentsModal}
                setShowCommentsModal={setShowCommentsModal}
              />
            )}
            initialScrollIndex={currentVideoIndex}
            getItemLayout={(_, index) => ({
              length: Dimensions.get('window').height,
              offset: Dimensions.get('window').height * index,
              index,
            })}
            pagingEnabled
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            snapToInterval={Dimensions.get('window').height}
            snapToAlignment="start"
          />
        </View>
      )}
    </View>
  );
};

export default SeriesDetailsScreen;