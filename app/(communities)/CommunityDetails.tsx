import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  FlatList,
  Dimensions,
  BackHandler,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MoreHorizontal } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfilePhotoUrl } from "@/utils/profileUtils";
import ThemedView from "@/components/ThemedView";
import { communityActions } from "@/api/community/communityActions";
import VideoPlayer from "@/app/(dashboard)/long/_components/VideoPlayer";
import BottomNavBar from "@/components/BottomNavBar";

interface CommunityDetails {
  communityId: string;
  name: string;
  bio: string;
  profilePhoto: string;
  totalFollowers: number;
  totalCreators: number;
  totalVideos: number;
  founder: {
    id: string;
    username: string;
    profilePhoto: string;
  };
}

export default function CommunityDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [community, setCommunity] = useState<CommunityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);

  // Video player state
  const [isVideoPlayerActive, setIsVideoPlayerActive] = useState(false);
  const [currentVideoData, setCurrentVideoData] = useState<any>(null);
  const [currentVideoList, setCurrentVideoList] = useState<any[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const communityId = params.id as string;

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

  useEffect(() => {
    if (communityId && token) {
      fetchCommunityDetails();
    }
  }, [communityId, token]);

  const fetchCommunityDetails = async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await communityActions.getCommunityDetails(token, communityId);
      setCommunity(result);

      // Fetch videos if there are any
      if (result.totalVideos > 0) {
        try {
          const videosResult = await communityActions.getCommunityVideos(token, communityId);
          setVideos(videosResult.videos || []);
        } catch (videoError) {
          console.log('⚠️ Could not fetch videos:', videoError);
        }
      }

      console.log('✅ Community details fetched:', result);
    } catch (error) {
      console.error('❌ Error fetching community details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch community details');
      Alert.alert('Error', 'Failed to load community details');
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Video player functions
  const navigateToVideoPlayer = (videoData: any, allVideos: any[]) => {
    console.log('🎬 Opening video player for:', videoData.title || videoData.name);
    const currentIndex = allVideos.findIndex(video => video._id === videoData._id);

    setCurrentVideoData(videoData);
    setCurrentVideoList(allVideos);
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
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#F1C40F" />
        <Text className="text-white mt-2" style={{ fontFamily: 'Poppins' }}>
          Loading community...
        </Text>
      </ThemedView>
    );
  }

  if (error || !community) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <Text className="text-red-400 text-center" style={{ fontFamily: 'Poppins' }}>
          {error || 'Community not found'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-lg"
        >
          <Text className="text-white" style={{ fontFamily: 'Poppins' }}>Go Back</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'Poppins' }}>
          #{community.name}
        </Text>
        <TouchableOpacity>
          <MoreHorizontal size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Community Profile */}
        <View className="items-center py-6">
          <View className="w-24 h-24 rounded-full bg-gray-600 items-center justify-center mb-4 overflow-hidden">
            <Image
              source={{ uri: getProfilePhotoUrl(community.profilePhoto, 'community') }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <Text className="text-white text-xl font-bold mb-2" style={{ fontFamily: 'Poppins' }}>
            By @{community.founder?.username || 'Unknown'}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around items-center py-6">
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push({
              pathname: "/(communities)/CommunitySections",
              params: {
                section: "followers",
                communityId: community.communityId,
                communityName: community.name
              }
            })}
          >
            <Text className="text-white text-2xl font-bold" style={{ fontFamily: 'Poppins' }}>
              {formatCount(community.totalFollowers)}
            </Text>
            <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins' }}>
              Followers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push({
              pathname: "/(communities)/CommunitySections",
              params: {
                section: "creators",
                communityId: community.communityId,
                communityName: community.name
              }
            })}
          >
            <Text className="text-white text-2xl font-bold" style={{ fontFamily: 'Poppins' }}>
              {formatCount(community.totalCreators)}
            </Text>
            <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins' }}>
              Creators
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push({
              pathname: "/(communities)/CommunitySections",
              params: {
                section: "videos",
                communityId: community.communityId,
                communityName: community.name
              }
            })}
          >
            <Text className="text-white text-2xl font-bold" style={{ fontFamily: 'Poppins' }}>
              {formatCount(community.totalVideos)}
            </Text>
            <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins' }}>
              Videos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 px-6 py-4">
          <TouchableOpacity
            className="flex-1 py-3 border border-white rounded-lg"
            onPress={() => router.push({
              pathname: "/(communities)/EditCommunity",
              params: { communityId: community.communityId }
            })}
          >
            <Text className="text-white text-center font-semibold" style={{ fontFamily: 'Poppins' }}>
              Edit Community
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-3 border border-white rounded-lg"
            onPress={() => router.push({
              pathname: "/(communities)/public/CommunityAnalytics",
              params: { communityId: community.communityId }
            })}
          >
            <Text className="text-white text-center font-semibold" style={{ fontFamily: 'Poppins' }}>
              View Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bio */}
        {community.bio && (
          <View className="px-6 py-4">
            <Text className="text-gray-400 text-center" style={{ fontFamily: 'Poppins' }}>
              {community.bio}
            </Text>
          </View>
        )}

        {/* Video Thumbnails Grid - Only show if there are actual videos */}
        {videos.length > 0 && (
          <View className="px-4 py-4">
            <View className="flex-row flex-wrap justify-between">
              {videos.slice(0, 9).map((video, index) => (
                <TouchableOpacity
                  key={video._id || index}
                  className="w-[32%] aspect-[9/16] bg-gray-800 rounded-lg mb-2 overflow-hidden"
                  onPress={() => navigateToVideoPlayer(video, videos)}
                >
                  {video.thumbnailUrl ? (
                    <Image
                      source={{ uri: video.thumbnailUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Poppins' }}>
                        {video.name || 'Video'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

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
      
      {/* Bottom Navigation Bar */}
      {!isVideoPlayerActive && (
        <BottomNavBar />
      )}
    </ThemedView>
  );
}