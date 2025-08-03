import React, { useRef, useState, useEffect } from "react";
import { FlatList, Dimensions, ActivityIndicator, Text } from "react-native";
import VideoItem from "./VideoItem";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import { VideoItemType } from "@/types/VideosType";
import VideoContentGifting from "@/app/(payments)/Video/VideoContentGifting";

const videoData = [
  {
    id: "1",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "2",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: "3",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
];

type GiftType = {
  _id: string;
  profile?: string;
  username: string;
  email: string;
};

const VideoFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const [visibleIndex, setVisibleIndex] = useState(0);
  const { token, user, isLoggedIn } = useAuthStore();

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isWantToGift, setIsWantToGift] = useState(false);
  const [giftingData, setGiftingData] = useState<GiftType | undefined>();

  const { height } = Dimensions.get("screen");

  const fetchTrendingVideos = async () => {
    try {
      const res = await fetch(
        `${BACKEND_API_URL}/videos/trending?page=1&limit=10`
      );

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

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setVisibleIndex(newIndex);
    }
  });

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

  return (
    <>
      {isWantToGift ? (
        <VideoContentGifting creator={giftingData} />
      ) : (
        <ThemedView style={{ height }}>
          <FlatList
            data={videos}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <VideoItem
                setGiftingData={setGiftingData}
                showCommentsModal={showCommentsModal}
                setShowCommentsModal={setShowCommentsModal}
                setIsWantToGift={setIsWantToGift}
                key={`${item._id}-${visibleIndex === index}`}
                uri={item.videoUrl}
                isActive={index === visibleIndex}
                videoData={item}
              />
            )}
            pagingEnabled
            scrollEnabled={!showCommentsModal}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
          />
        </ThemedView>
      )}
    </>
  );
};

export default VideoFeed;
