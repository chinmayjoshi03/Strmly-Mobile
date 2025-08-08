import React, { useRef, useState, useEffect, useCallback } from "react";
import { FlatList, Dimensions, ActivityIndicator, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";
import GiftingMessage from "./_components/GiftingMessage";
import UnifiedVideoPlayer from "@/components/UnifiedVideoPlayer";
import VideoItem from "./VideoItem";
import { VideoContentGifting } from "@/app/(payments)/Video/Video-Gifting";

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

  const BACKEND_API_URL = CONFIG.API_BASE_URL;
  console.log('🔧 VideoFeed API URL:', BACKEND_API_URL);
  const { height } = Dimensions.get("screen");
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 55; // Height of the bottom navigation bar (reduced from 70)
  const TAB_BAR_PADDING = 10; // paddingBottom from tab bar (reduced from 15)
  const BUFFER = 10; // Additional buffer to ensure no overlap

  // Calculate available height more precisely
  // We need to account for the tab bar height plus its padding plus safe area
  const adjustedHeight = height - TAB_BAR_HEIGHT - TAB_BAR_PADDING - BUFFER;

  console.log('Screen height:', height);
  console.log('Tab bar total space needed:', TAB_BAR_HEIGHT + TAB_BAR_PADDING + BUFFER);
  console.log('Adjusted height:', adjustedHeight);

  const [visibleIndex, setVisibleIndex] = useState(0);
  const { token, user, isLoggedIn } = useAuthStore();
  const [videosPage, setVideosPage] = useState(1);

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
      if (!BACKEND_API_URL) {
        throw new Error('Backend API URL is not configured');
      }

      if (!token) {
        throw new Error('Authentication token is missing');
      }

      console.log('Fetching videos from:', `${BACKEND_API_URL}/videos/trending?page=1&limit=10`);

      const res = await fetch(
        `${BACKEND_API_URL}/videos/trending?page=1&limit=10`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.error('Fetch failed with status:', res.status, res.statusText);
        throw new Error(`Failed to fetch videos: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      console.log('Videos fetched successfully:', json.data?.length, 'videos');

      setVideos(json.data);
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTrendingVideos();
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
      <ThemedView style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: adjustedHeight,
        backgroundColor: 'black'
      }} className="justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: adjustedHeight,
        backgroundColor: 'black'
      }} className="justify-center items-center px-4">
        <Text className="text-white text-center mb-4">Failed to load videos</Text>
        <Text className="text-red-400 text-center text-sm mb-4">{error}</Text>
        <Text className="text-gray-400 text-center text-xs">
          API URL: {BACKEND_API_URL || 'Not configured'}
        </Text>
        <Pressable
          onPress={fetchTrendingVideos}
          className="mt-4 bg-blue-600 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </Pressable>
      </ThemedView>
    );
  }

  // OPTIMIZATION 4: Refactored UI structure.
  // The FlatList is always rendered. Gifting components are rendered as overlays.
  return (
    <ThemedView style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: adjustedHeight,
      backgroundColor: 'black'
    }}>
      {isGifted && giftingData ? (
        <GiftingMessage
          isVisible={modalVisible}
          giftData={giftingData}
          setGiftData={setGiftingData}
          onClose={setModalVisible}
          message={giftSuccessMessage}
          giftMessage={setGiftSuccessMessage}
        />
      ) : isWantToGift && giftingData ? (
        <VideoContentGifting
          giftData={giftingData}
          setIsGifted={setIsGifted}
          setIsWantToGift={setIsWantToGift}
          giftMessage={setGiftSuccessMessage}
        />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <UnifiedVideoPlayer
              key={`${item._id}-${visibleIndex === index}`}
              uri={item.videoUrl}
              videoData={item}
              mode="feed"
              isActive={index === visibleIndex}
              autoPlay={index === visibleIndex}
              loop={true}
              showControls={true}
              showInteractions={true}
              showDetails={true}
              showComments={true}
              containerHeight={adjustedHeight}
              setGiftingData={setGiftingData}
              setIsWantToGift={setIsWantToGift}
              showCommentsModal={showCommentsModal}
              setShowCommentsModal={setShowCommentsModal}
            />
          )}
          style={{ flex: 1 }}
          getItemLayout={(_, index) => ({
            length: adjustedHeight,
            offset: adjustedHeight * index,
            index,
          })}
          pagingEnabled
          scrollEnabled={!showCommentsModal}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          snapToInterval={adjustedHeight}
          snapToAlignment="start"
        />
      )}
    </ThemedView>
  );
};

export default VideoFeed;
