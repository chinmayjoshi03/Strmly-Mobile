import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import VideoItem from "./VideoItem"; // Make sure this is the memoized version
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import { VideoItemType } from "@/types/VideosType";
import GiftingMessage from "./_components/GiftingMessage";
import VideoContentGifting from "@/app/(payments)/Video/Video-Gifting";

export type GiftType = {
  _id: string;
  name?: string;
  username: string;
  profile_photo: string;
};

const { height } = Dimensions.get("screen");

const VideoFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const { token } = useAuthStore();
  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  // State for overlays
  const [isWantToGift, setIsWantToGift] = useState(false);
  const [isGifted, setIsGifted] = useState(false);
  const [giftingData, setGiftingData] = useState<GiftType | null>(null);
  const [giftSuccessMessage, setGiftSuccessMessage] = useState<any>();
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const fetchTrendingVideos = async () => {
    // This function is fine as is.
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/videos/trending`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch videos");
      const json = await res.json();
      setVideos(json.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingVideos();
  }, []);

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
      <VideoItem
        BACKEND_API_URL={BACKEND_API_URL}
        setGiftingData={setGiftingData}
        showCommentsModal={showCommentsModal}
        setShowCommentsModal={setShowCommentsModal}
        setIsWantToGift={setIsWantToGift}
        uri={item.videoUrl}
        isActive={index === visibleIndex}
        videoData={item}
      />
    ),
    [visibleIndex, showCommentsModal, BACKEND_API_URL]
  ); // Dependencies that, when changed, should cause the item to update.

  // OPTIMIZATION 3: If all your video items have the same height (full screen), use getItemLayout
  // This is a major performance boost as it avoids on-the-fly layout calculations.
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [height]
  );

  if (loading) {
    return (
      <ThemedView style={{ height }} className="justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ height }} className="justify-center items-center">
        <Text className="text-white">{error}</Text>
      </ThemedView>
    );
  }

  // OPTIMIZATION 4: Refactored UI structure.
  // The FlatList is always rendered. Gifting components are rendered as overlays.
  return (
    <ThemedView style={{ flex: 1, backgroundColor: "black" }}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        getItemLayout={getItemLayout}
        pagingEnabled
        scrollEnabled={!showCommentsModal}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      />

      {/* Gifting components are now rendered on top of the list, not in place of it */}
      {isWantToGift && !isGifted && (
        <VideoContentGifting
          giftData={giftingData}
          setIsGifted={setIsGifted}
          setIsWantToGift={setIsWantToGift}
          giftMessage={setGiftSuccessMessage}
        />
      )}

      {isGifted && (
        <GiftingMessage
          isVisible={isGifted} // Control visibility with a boolean
          giftData={giftingData}
          setGiftData={setGiftingData}
          onClose={() => setIsGifted(false)} // Provide a way to close the message
          message={giftSuccessMessage}
          giftMessage={setGiftSuccessMessage}
        />
      )}
    </ThemedView>
  );
};

export default VideoFeed;
