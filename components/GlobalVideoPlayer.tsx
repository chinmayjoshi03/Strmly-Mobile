import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import { VideoItemType } from "@/types/VideosType";
import { router, useLocalSearchParams } from "expo-router";
import VideoPlayer from "@/app/(dashboard)/long/_components/VideoPlayer";

export type GiftType = {
  creator: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  videoId: string;
};

const { height: screenHeight } = Dimensions.get("screen");
const BOTTOM_NAV_HEIGHT = 50;
const VIDEO_HEIGHT = screenHeight - BOTTOM_NAV_HEIGHT;

const GlobalVideoPlayer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const {id, data} = useLocalSearchParams();
  
  const videos = data ? JSON.parse(data as string) : [];

  const { token } = useAuthStore();
  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;


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
      />
    ),
    [visibleIndex]
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

  if (loading) {
    return (
      <ThemedView style={{ height: VIDEO_HEIGHT }} className="justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ height: VIDEO_HEIGHT }} className="justify-center items-center">
        <Text className="text-white">{error}</Text>
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
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        showsVerticalScrollIndicator={false}
        style={{ height: VIDEO_HEIGHT }}
      />
    </ThemedView>
  );
};

export default GlobalVideoPlayer;