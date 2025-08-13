import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  BackHandler,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import ThemedView from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import ProfileTopbar from "@/components/profileTopbar";
import VideoPlayer from "@/app/(dashboard)/long/_components/VideoPlayer";
import BottomNavBar from "@/components/BottomNavBar";
import { VideoItemType } from "@/types/VideosType";

const { height: screenHeight } = Dimensions.get("screen");

const HistoryPage = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { isLoggedIn, token, logout } = useAuthStore();
  const router = useRouter();

  // Video player state - simplified like VideosFeed
  const [isVideoPlayerActive, setIsVideoPlayerActive] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  const thumbnails = useThumbnailsGenerate(
    videos.map((video) => ({
      id: video._id,
      url: video.videoUrl,
    }))
  );

  // Handle back button when video player is active
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isVideoPlayerActive) {
          closeVideoPlayer();
          return true; // Prevent default back action
        }
        return false; // Allow default back action
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [isVideoPlayerActive])
  );

  // Video player functions - simplified like VideosFeed
  const openVideoPlayer = (videoData: any) => {
    console.log('🎬 Opening video player for:', videoData.title || videoData.name);
    const currentIndex = videos.findIndex(video => video._id === videoData._id);
    setCurrentVideoIndex(currentIndex >= 0 ? currentIndex : 0);
    setIsVideoPlayerActive(true);
  };

  const closeVideoPlayer = () => {
    setIsVideoPlayerActive(false);
    setCurrentVideoIndex(0);
    setShowCommentsModal(false);
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentVideoIndex(viewableItems[0].index);
    }
  }, []);

  const fetchUserHistory = async (token: string, page = 1, limit = 10) => {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/user/history?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch history");

      return await response.json();
    } catch (error) {
      console.error("History fetch error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (!isLoggedIn || !token) return;
      try {
        setIsLoadingVideos(true);
        const res = await fetchUserHistory(token);
        setVideos(()=> res.videos); // This is the formatted array from backend
        setVideos(()=> res.videos); // This is the formatted array from backend
        setVideos(()=> res.videos); // This is the formatted array from backend
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    loadHistory();
  }, [isLoggedIn, token]);

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden"
      onPress={() => openVideoPlayer(item)}
    >
      {item.thumbnailUrl != null || "" ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
          alt="video thumbnail"
          className="w-full h-full object-cover"
        />
      ) : thumbnails[item._id] ? (
        <Image
          source={{ uri: thumbnails[item._id] }}
          alt="video thumbnail"
          className="w-full h-full object-cover"
        />
      ) : (
        <View className="w-full h-full flex items-center justify-center">
          <Text className="text-white text-xs">Loading...</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView className="flex-1 pt-5">
      {/* Video Grid */}
      {isLoadingVideos ? (
        <View className="w-full h-96 flex-1 items-center justify-center mt-20">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <View className="gap-10">
          <ProfileTopbar isMore={false} hashtag={false} name={"History"} />

          <FlatList
            data={videos}
            keyExtractor={(item) => item._id}
            renderItem={renderGridItem}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: 0, paddingHorizontal: 0 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Video Player - same pattern as VideosFeed */}
      {isVideoPlayerActive && (
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
            data={videos}
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
              length: screenHeight,
              offset: screenHeight * index,
              index,
            })}
            pagingEnabled
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            snapToInterval={screenHeight}
            snapToAlignment="start"
          />
        </View>
      )}

      {/* Bottom Navigation Bar - only show when video player is active */}
      {isVideoPlayerActive && (
        <BottomNavBar />
      )}
    </ThemedView>
  );
};

export default HistoryPage;
