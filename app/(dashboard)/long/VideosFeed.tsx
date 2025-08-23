import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
  Pressable,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";
import { Link, router, useFocusEffect } from "expo-router";
import VideoPlayer from "./_components/VideoPlayer";
import VideoItem from "./VideoItem";

export type GiftType = {
  creator: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  videoId: string;
};

const { height: screenHeight } = Dimensions.get("window");
const BOTTOM_NAV_HEIGHT = -25; // Height of your bottom navigation

const VideosFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const { token, isLoggedIn } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Calculate the actual video height accounting for navigation bar
  const VIDEO_HEIGHT = screenHeight - BOTTOM_NAV_HEIGHT - insets.bottom;

  // If user is not logged in, redirect to sign-in
  useFocusEffect(
    useCallback(() => {
      if (!token || !isLoggedIn) {
        router.replace("/(auth)/Sign-up");
        return;
      }
    }, [token, isLoggedIn])
  );

  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  const fetchTrendingVideos = async (nextPage?: number) => {
    const targetPage = nextPage ?? page;

    if (!hasMore || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      console.log("calling...");
      const res = await fetch(
        `${BACKEND_API_URL}/recommendations/videos?page=${targetPage}`, //recommendations/videos
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch videos");
      const json = await res.json();
      
      setVideos((prev) => {
        const existingIds = new Set(prev.map((v) => v._id));
        const uniqueNew = json.recommendations.filter(
          (v: { _id: string }) => !existingIds.has(v._id)
        );
        return [...prev, ...uniqueNew];
      });

      if (json.recommendations.length < limit) setHasMore(false);
      console.log(json.recommendations.length, "recommendations.length");
      setPage(targetPage + 1); // increment only once
    } catch (err: any) {
      console.log(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTrendingVideos(page);
    } else {
      setError("Please log in to view videos");
      setLoading(false);
    }
  }, [token]);

  // OPTIMIZATION 1: Stabilize the onViewableItemsChanged callback
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const currentIndex = viewableItems[0].index;
        setVisibleIndex(currentIndex);
      }
    },
    []
  );

  // OPTIMIZATION 2: Memoize the renderItem function with containerHeight prop
  const renderItem = useCallback(
    ({ item, index }: { item: VideoItemType; index: number }) => (
      <VideoPlayer
        videoData={item}
        isActive={index === visibleIndex}
        showCommentsModal={showCommentsModal}
        setShowCommentsModal={setShowCommentsModal}
        containerHeight={VIDEO_HEIGHT}
      />
    ),
    [visibleIndex, showCommentsModal, VIDEO_HEIGHT]
  );

  // OPTIMIZATION 3: Use the adjusted VIDEO_HEIGHT for layout calculations
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: VIDEO_HEIGHT,
      offset: VIDEO_HEIGHT * index,
      index,
    }),
    [VIDEO_HEIGHT]
  );

  // Show loading while checking authentication or fetching videos
  if (loading || !token || !isLoggedIn) {
    return (
      <ThemedView
        style={{ height: VIDEO_HEIGHT }}
        className="justify-center items-center"
      >
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">
          {!token || !isLoggedIn
            ? "Checking authentication..."
            : "Loading videos..."}
        </Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView
        style={{ height: VIDEO_HEIGHT }}
        className="justify-center items-center px-4"
      >
        <Text className="text-white text-center mb-4">
          Oops something went wrong!
        </Text>
        <Pressable
          onPress={() => {
            setLoading(() => true);
            setError(() => null);
            fetchTrendingVideos();
          }}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </Pressable>
      </ThemedView>
    );
  }

  if (videos.length === 0) {
    return (
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
    );
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor: 'black' }}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        getItemLayout={getItemLayout}
        pagingEnabled
        scrollEnabled={!showCommentsModal}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        snapToInterval={VIDEO_HEIGHT}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        onEndReachedThreshold={0.85}
        onEndReached={() => fetchTrendingVideos()}
        style={{ 
          height: VIDEO_HEIGHT,
          flex: 1
        }}
        removeClippedSubviews={true}
      />
    </ThemedView>
  );
};

export default VideosFeed;