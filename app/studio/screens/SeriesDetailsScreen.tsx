import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CONFIG } from '@/Constants/config';
import { useAuthStore } from '@/store/useAuthStore';
import { router } from 'expo-router';

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
  name: string; // LongVideo uses 'name' not 'title'
  createdAt: string; // LongVideo uses 'createdAt' not 'upload_date'
  views: number;
  likes: number; // LongVideo has 'likes' not 'conversions'
  episode_number: number;
  season_number: number;
  thumbnailUrl?: string;
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

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/series/${seriesId}?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('Series details response:', result);
      console.log('Episodes data:', result.data?.episodes);
      console.log('Total episodes:', result.data?.total_episodes);

      if (response.ok && result.data) {
        setSeriesData(result.data);
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
                Total episode: {seriesData.total_episodes.toString().padStart(2, '0')}
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
                {formatNumber(seriesData.analytics.total_views)}
              </Text>
              <Text className="text-gray-400 text-sm">Total view</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                ₹{formatNumber(seriesData.total_earned)}
              </Text>
              <Text className="text-gray-400 text-sm">Total earning</Text>
            </View>
          </View>
        </View>

        {/* Episodes List */}
        <View className="px-4">
          {seriesData.episodes.length > 0 ? (
            seriesData.episodes.map((episode, index) => (
              <TouchableOpacity
                key={episode._id}
                onPress={() => {
                  console.log('🎬 Opening episode:', episode._id);
                  router.push(`/studio/components/EpisodeVideoPlayer?id=${episode._id}`);
                }}
                className="flex-row items-center mb-4 bg-gray-900 rounded-lg p-3"
              >
                {/* Episode Thumbnail */}
                <View className="w-12 h-12 rounded-lg mr-3 overflow-hidden bg-gray-700">
                  {episode.thumbnailUrl ? (
                    <Image
                      source={{ uri: episode.thumbnailUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Text className="text-gray-400 text-xs">EP</Text>
                    </View>
                  )}
                </View>

                {/* Episode Info */}
                <View className="flex-1">
                  <Text className="text-white text-base font-medium mb-1">
                    Episode {episode.episode_number}: {episode.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Upload on {formatDate(episode.createdAt)}
                  </Text>
                </View>

                {/* Episode Stats */}
                <View className="items-center mr-4">
                  <Text className="text-white text-base font-medium">
                    {formatNumber(episode.views)}
                  </Text>
                  <Text className="text-gray-400 text-xs">View</Text>
                </View>

                <View className="items-center mr-4">
                  <Text className="text-white text-base font-medium">
                    {formatNumber(episode.likes)}
                  </Text>
                  <Text className="text-gray-400 text-xs">Likes</Text>
                </View>

                {/* Menu Button */}
                <TouchableOpacity className="p-2">
                  <Ionicons name="ellipsis-vertical" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-8">
              <Text className="text-gray-400 text-center">No episodes yet</Text>
              <Text className="text-gray-500 text-center text-sm mt-2">
                Add your first episode to get started
              </Text>
            </View>
          )}
        </View>

        {/* Add some bottom padding */}
        <View className="h-20" />
      </ScrollView>

      {/* Add New Episode Button */}
      <View className="px-4 pb-8">
        <TouchableOpacity
          onPress={onAddNewEpisode}
          className="bg-gray-200 rounded-full py-4 items-center"
        >
          <Text className="text-black text-lg font-medium">Add new episode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SeriesDetailsScreen;