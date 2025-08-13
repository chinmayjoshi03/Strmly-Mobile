import React, { useRef, useState, useEffect, useCallback } from "react";
import { FlatList, Dimensions, ActivityIndicator, Text, Pressable } from "react-native";
import { router } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";
import GiftingMessage from "./_components/GiftingMessage";
import UnifiedVideoPlayer from "@/components/UnifiedVideoPlayer";
import CommentsSection from "./_components/CommentSection";
import VideoFeedDebug from "@/components/VideoFeedDebug";

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
  const { token } = useAuthStore();

  // State for overlays
  const [isWantToGift, setIsWantToGift] = useState(false);
  const [isGifted, setIsGifted] = useState(false);
  const [giftingData, setGiftingData] = useState<GiftType | null>(null);
  const [giftSuccessMessage, setGiftSuccessMessage] = useState<any>();
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // Debug log for comments modal state changes
  useEffect(() => {
    console.log('🎬 VideoFeed: Comments modal state changed:', showCommentsModal);
  }, [showCommentsModal]);

  const fetchTrendingVideos = async () => {
    setLoading(true);
    try {
      console.log('🔧 VideoFeed Debug Info:');
      console.log('📍 BACKEND_API_URL:', BACKEND_API_URL);
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token length:', token?.length || 0);
      console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'null');

      if (!BACKEND_API_URL) {
        throw new Error('Backend API URL is not configured');
      }

      if (!token) {
        throw new Error('Authentication token is missing - user may not be logged in');
      }

      const url = `${BACKEND_API_URL}/videos/trending?page=1&limit=10`;
      console.log('📡 Fetching from:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', res.status);
      console.log('📡 Response ok:', res.ok);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Fetch failed:');
        console.error('   Status:', res.status, res.statusText);
        console.error('   Response:', errorText);

        if (res.status === 401) {
          throw new Error('Authentication failed - please log in again');
        } else if (res.status === 403) {
          throw new Error('Access forbidden - invalid token');
        } else {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
      }

      const json = await res.json();
      console.log('✅ Videos fetched successfully:', json.data?.length || 0, 'videos');

      if (!json.data) {
        console.warn('⚠️ No data field in response:', json);
        setVideos([]);
      } else {
        setVideos(json.data);
      }
    } catch (err: any) {
      console.error('❌ Error fetching videos:', err);
      console.error('❌ Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack?.split('\n')[0]
      });
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔧 VideoFeed useEffect triggered');
    console.log('🔑 Token state:', {
      exists: !!token,
      length: token?.length || 0,
      preview: token ? `${token.substring(0, 10)}...` : 'null'
    });

    if (token) {
      console.log('✅ Token found, fetching videos...');
      fetchTrendingVideos();
    } else {
      console.log('❌ No token found, user may not be logged in');
      setError('Please log in to view videos');
      setLoading(false);
    }
  }, [token]);

  // OPTIMIZATION 1: Stabilize the onViewableItemsChanged callback
  // This prevents FlatList from re-rendering just because the parent re-rendered.
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  });

  // OPTIMIZATION 2: Memoize the renderItem function
  // This prevents creating a new render function on every parent render.
  const renderItem = useCallback(
    ({ item, index }: { item: VideoItemType; index: number }) => (
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
    ),
    [visibleIndex, showCommentsModal, adjustedHeight]
  );

  // OPTIMIZATION 3: If all your video items have the same height (full screen), use getItemLayout
  // This is a major performance boost as it avoids on-the-fly layout calculations.
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: adjustedHeight,
      offset: adjustedHeight * index,
      index,
    }),
    [adjustedHeight]
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
      <VideoFeedDebug />
      {isGifted && giftingData ? (
        <GiftingMessage
          isVisible={isGifted}
          creator={giftingData}
          amount={giftSuccessMessage}
          onClose={(value: boolean) => setIsGifted(value)}
        />
      ) : isWantToGift && giftingData ? (
        <VideoContentGifting
          creator={giftingData}
          videoId={videos[visibleIndex]?._id || ''}
          setIsWantToGift={setIsWantToGift}
          setIsGifted={setIsGifted}
        />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          style={{ flex: 1 }}
          getItemLayout={getItemLayout}
          pagingEnabled
          scrollEnabled={!showCommentsModal}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          snapToInterval={adjustedHeight}
          snapToAlignment="start"
          onScrollBeginDrag={() => {
            if (showCommentsModal) {
              console.log('🚫 VideoFeed: Scroll blocked - comments modal is open');
            }
          }}
        />
      )}

      {/* Comments modal - Rendered at VideoFeed level to cover entire screen */}
      {showCommentsModal && (
        <CommentsSection
          onClose={() => {
            console.log('🎬 VideoFeed: Closing comments modal');
            setShowCommentsModal(false);
          }}
          videoId={videos[visibleIndex]?._id || null}
          onPressUsername={(userId) => {
            console.log('Navigate to user profile:', userId);
            try {
              router.push(`/(dashboard)/profile/public/${userId}` as any);
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
          onPressTip={(commentId) => {
            console.log('Open tip modal for comment:', commentId);
            // You can implement tip modal logic here
          }}
        />
      )}
    </ThemedView>
  );
};

export default VideoFeed;
