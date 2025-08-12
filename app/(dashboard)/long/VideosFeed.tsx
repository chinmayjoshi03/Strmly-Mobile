import React, { useState, useEffect, useCallback } from "react";
import { FlatList, Dimensions, ActivityIndicator, Text, Pressable } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";
import VideoPlayer from "./_components/VideoPlayer";
import { Link, router } from "expo-router";

export type GiftType = {
  creator: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  videoId: string;
};

const { height: screenHeight } = Dimensions.get("screen");
const VIDEO_HEIGHT = screenHeight;

const VideosFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const { token, isLoggedIn } = useAuthStore();

  // If user is not logged in, redirect to sign-in
  useEffect(() => {
    if (!token || !isLoggedIn) {
      router.replace('/(auth)/Sign-in');
      return;
    }
  }, [token, isLoggedIn]);

  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  const fetchTrendingVideos = async () => {
    setLoading(true);
    try {
      if (!BACKEND_API_URL) {
        throw new Error('Backend API URL is not configured');
      }

      if (!token) {
        throw new Error('Authentication token is missing - user may not be logged in');
      }

      const res = await fetch(`${BACKEND_API_URL}/recommendations/videos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication failed - please log in again');
        } else if (res.status === 403) {
          throw new Error('Access forbidden - invalid token');
        } else {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
      }

      const json = await res.json();
      setVideos(json.recommendations || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTrendingVideos();
    } else {
      setError('Please log in to view videos');
      setLoading(false);
    }
  }, [token]);

  // OPTIMIZATION 1: Stabilize the onViewableItemsChanged callback
  // This prevents FlatList from re-rendering just because the parent re-rendered.
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  }, []); // Empty dependency array means this function is created only once.

  // OPTIMIZATION 2: Memoize the renderItem function
  // This prevents creating a new render function on every parent render.
  const renderItem = useCallback(
    ({ item, index }: { item: VideoItemType; index: number }) => (
      <VideoPlayer 
        videoData={item} 
        isActive={index === visibleIndex}
        showCommentsModal={showCommentsModal}
        setShowCommentsModal={setShowCommentsModal}
      />
    ),
    [visibleIndex, showCommentsModal]
  );

  // OPTIMIZATION 3: Use consistent VIDEO_HEIGHT for layout calculations
  // This ensures all videos have the same height and prevents layout issues
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: VIDEO_HEIGHT,
      offset: VIDEO_HEIGHT * index,
      index,
    }),
    [router]
  );

  // Show loading while checking authentication or fetching videos
  if (loading || !token || !isLoggedIn) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <ThemedView
            style={{ height: VIDEO_HEIGHT }}
            className="justify-center items-center"
          >
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-4">
              {!token || !isLoggedIn ? 'Checking authentication...' : 'Loading videos...'}
            </Text>
          </ThemedView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <ThemedView
            style={{ height: VIDEO_HEIGHT }}
            className="justify-center items-center px-4"
          >
            <Text className="text-white text-center mb-4">Failed to fetch videos</Text>
            <Text className="text-red-400 text-center text-sm mb-4">{error}</Text>
            <Text className="text-gray-400 text-center text-xs mb-4">
              API URL: {BACKEND_API_URL || 'Not configured'}
            </Text>
            <Pressable
              onPress={fetchTrendingVideos}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              <Text className="text-white">Retry</Text>
            </Pressable>
          </ThemedView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (videos.length === 0) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <ThemedView
            style={{ height: VIDEO_HEIGHT }}
            className="justify-center items-center"
          >
            <Text className="text-lg text-white">No Videos Available</Text>
            <Text className="text-lg text-white">
              Want to Upload your own{" "}
              <Link href={"/studio"} className="text-blue-500">
                Upload
              </Link>
            </Text>
          </ThemedView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    // <SafeAreaProvider>
    //   <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ThemedView>
         
          <FlatList
            data={videos}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            getItemLayout={getItemLayout}
            pagingEnabled
            scrollEnabled={!showCommentsModal}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic" // iOS
            contentContainerStyle={{ paddingBottom: 0 }}
            style={{ height: VIDEO_HEIGHT }}
            onScrollBeginDrag={() => {
              if (showCommentsModal) {
                console.log('🚫 VideosFeed: Scroll blocked - comments modal is open');
              }
            }}
          />
        </ThemedView>
    //   </SafeAreaView>
    // </SafeAreaProvider>
  );
};

export default VideosFeed;
