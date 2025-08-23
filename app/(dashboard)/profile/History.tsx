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
import React, { useEffect, useState } from "react";
import ThemedView from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import ProfileTopbar from "@/components/profileTopbar";
import { VideoItemType } from "@/types/VideosType";
import { useVideosStore } from "@/store/useVideosStore";

const HistoryPage = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { isLoggedIn, token, logout } = useAuthStore();
  const router = useRouter();
  const { setVideosInZustand } = useVideosStore();
  const BACKEND_API_URL = CONFIG.API_BASE_URL;

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
        setVideos(res.videos); // This is the formatted array from backend
        setVideosInZustand(res.videos); // Store in Zustand for global access
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    loadHistory();
  }, [isLoggedIn, token]);

  const renderGridItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden"
      onPress={() =>
        router.push({
          pathname: "/(dashboard)/long/GlobalVideoPlayer",
          params: { startIndex: index.toString() },
        })
      }
    >
      {item.thumbnailUrl != null || "" ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
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
    </ThemedView>
  );
};

export default HistoryPage;
