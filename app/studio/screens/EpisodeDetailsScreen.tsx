import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import UnifiedVideoPlayer from '../../../components/UnifiedVideoPlayer';
import { CONFIG } from '../../../Constants/config';
import { useAuthStore } from '../../../store/useAuthStore';

interface EpisodeDetails {
  _id: string;
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string;
  type: string;
  language: string;
  episode_number: number;
  season_number: number;
  series: {
    _id: string;
    title: string;
  };
  created_by: {
    _id: string;
    username: string;
  };
  likes: number;
  views: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
}

const EpisodeDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [episode, setEpisode] = useState<EpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { token } = useAuthStore();
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    if (id) {
      fetchEpisodeDetails();
    }
  }, [id]);

  const fetchEpisodeDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}/videos/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch episode: ${response.status}`);
      }

      const data = await response.json();
      setEpisode(data.video);
    } catch (err) {
      console.error('Error fetching episode details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch episode');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEpisode = async () => {
    Alert.alert(
      'Delete Episode',
      'Are you sure you want to delete this episode? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);

              if (!token) {
                throw new Error('Authentication required');
              }

              const response = await fetch(`${CONFIG.API_BASE_URL}/videos/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) {
                throw new Error('Failed to delete episode');
              }

              Alert.alert('Success', 'Episode deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (err) {
              console.error('Error deleting episode:', err);
              Alert.alert('Error', 'Failed to delete episode');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Loading episode...</Text>
      </View>
    );
  }

  if (error || !episode) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-4">
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text className="text-red-400 text-lg mb-4">Error</Text>
        <Text className="text-white text-center mb-6">{error || 'Episode not found'}</Text>
        <TouchableOpacity
          onPress={handleBack}
          className="bg-gray-700 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-12">
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-medium">Episode Details</Text>
        <TouchableOpacity
          onPress={handleDeleteEpisode}
          disabled={deleting}
          className="p-2"
        >
          {deleting ? (
            <ActivityIndicator size="small" color="red" />
          ) : (
            <Ionicons name="trash-outline" size={24} color="red" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Video Player */}
        <View className="mx-4 mb-6" style={{ height: width * 0.56 }}>
          <UniversalVideoPlayer
            uri={episode.videoUrl}
            title={`${episode.series.title} - Episode ${episode.episode_number}`}
            autoPlay={false}
            loop={false}
            showControls={true}
            style={{ flex: 1 }}
          />
        </View>

        {/* Episode Information */}
        <View className="px-4">
          <View className="bg-gray-900 rounded-lg p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-3">Episode Information</Text>
            
            <View className="mb-3">
              <Text className="text-gray-400 text-sm">Series</Text>
              <Text className="text-white text-base font-medium">{episode.series.title}</Text>
            </View>

            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-gray-400 text-sm">Season</Text>
                <Text className="text-white text-base">{episode.season_number}</Text>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-400 text-sm">Episode</Text>
                <Text className="text-white text-base">{episode.episode_number}</Text>
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-sm">Title</Text>
              <Text className="text-white text-base">{episode.name}</Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-sm">Description</Text>
              <Text className="text-white text-base">{episode.description || 'No description'}</Text>
            </View>

            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-gray-400 text-sm">Genre</Text>
                <Text className="text-white text-base">{episode.genre}</Text>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-400 text-sm">Type</Text>
                <Text className="text-white text-base">{episode.type}</Text>
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-sm">Creator</Text>
              <Text className="text-white text-base">@{episode.created_by.username}</Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-sm">Created</Text>
              <Text className="text-white text-base">
                {new Date(episode.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Statistics */}
          <View className="bg-gray-900 rounded-lg p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-3">Statistics</Text>
            
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-white">{episode.views || 0}</Text>
                <Text className="text-gray-400 text-sm">Views</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-white">{episode.likes || 0}</Text>
                <Text className="text-gray-400 text-sm">Likes</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-white">{episode.shares || 0}</Text>
                <Text className="text-gray-400 text-sm">Shares</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EpisodeDetailsScreen;