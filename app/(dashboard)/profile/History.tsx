import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import ProfileTopbar from "@/components/profileTopbar";

const HistoryPage = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { isLoggedIn, token, logout } = useAuthStore();
  const router = useRouter();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const thumbnails = useThumbnailsGenerate(
    videos.map((video) => ({
      id: video._id,
      url: video.videoUrl,
    }))
  );

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
    <TouchableOpacity className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden">
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
    </ThemedView>
  );
};

export default HistoryPage;
