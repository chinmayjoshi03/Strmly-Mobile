import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
  FlatList,
} from "react-native";
import {
  IndianRupee,
  HeartIcon,
  VideoIcon,
  PaperclipIcon,
} from "lucide-react-native"; // React Native Lucide icons
import { useAuthStore } from "@/store/useAuthStore";
import { useLocalSearchParams, useRouter } from "expo-router"; // Expo Router for navigation
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import ThemedView from "@/components/ThemedView";
import ProfileTopbar from "@/components/profileTopbar";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";

const profileData = {
  id: 1,
  name: "Tech Entrepreneurs",
  description: "A community for tech entrepreneurs to share ideas and network",
  image: "https://via.placeholder.com/60", // Replaced with a direct URL for placeholder
  banner: "https://via.placeholder.com/400x200", // Replaced with a direct URL for placeholder
  followers: 12500,
  creators: 12500,
  videos: 1250,
  category: "Business",
  isPrivate: false,
  isJoined: true,
  communityFee: 30,
  role: "member",
  tags: ["startup", "technology", "business"],
  owner: {
    name: "John Doe",
    avatar: "https://via.placeholder.com/32", // Replaced with a direct URL for placeholder
  },
};

export default function PersonalCommunityPage() {
  const [activeTab, setActiveTab] = useState("long");
  const [communityData, setCommunityData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { isLoggedIn, token } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams(); // Use useLocalSearchParams for route parameters

  const id = "686cc5084b2928ecdc64f263"; // Get id from params
  // const id = params.id;

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const thumbnails = useThumbnailsGenerate(
    useMemo(
      () =>
        videos.map((video) => ({
          id: video._id,
          url: video.videoUrl,
        })),
      [videos]
    )
  );

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/(auth)/Sign-in"); // Use router.push for navigation in Expo Router
      return;
    }

    const fetchUserVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("type", activeTab);
        const response = await fetch(
          `${BACKEND_API_URL}/community/${id}/videos?videoType=${activeTab}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch community videos");
        }

        setVideos(data.videos);
      } catch (err) {
        console.error("Error fetching community videos:", err);
        Alert.alert(
          "Error",
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching videos."
        );
      } finally {
        setIsLoadingVideos(false);
      }
    };

    if (token && id) {
      fetchUserVideos();
    }
  }, [isLoggedIn, activeTab, router, token, id]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/(auth)/Sign-in");
      return;
    }

    const fetchCommunityData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BACKEND_API_URL}/community/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch community profile");
        }

        setCommunityData(data);
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "An unknown error occurred while fetching community data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token && id) {
      fetchCommunityData();
    }
  }, [isLoggedIn, router, id, token]);

  const changeCommunityFounder = async () => {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/community/change-founder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Assuming JWT token
          },
          body: JSON.stringify({
            communityId: id,
            // newFounderId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change founder");
      }

      Alert.alert("Success", "Founder changed successfully");
      console.log("Updated community:", data.community);
    } catch (err) {
      console.error("Change founder error:", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Something went wrong"
      );
      return null;
    }
  };

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden">
      {item.thumbnailUrl !== "" ? (
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
    <ThemedView className="flex-1">
      {/* Cover Image */}
      {!isLoading && (
        <View className="h-48 relative">
          <ProfileTopbar
            isMore={true}
            hashtag={true}
            name={communityData?.name || profileData.name}
          />
        </View>
      )}

      {isLoading ? (
        <View className="w-full flex items-center justify-center h-full">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <View className="max-w-4xl -mt-28 relative mx-6">
          <View className="flex flex-col items-center">
            <View className="relative flex flex-col items-center w-full">
              {/* Replaced Avatar with Image for simplicity, you can create a custom Avatar component */}
              <View className="size-24 rounded-full border border-white overflow-hidden">
                <Image
                  source={{
                    uri: communityData?.profile_photo || profileData.image,
                  }}
                  className="w-full h-full object-cover rounded-full"
                />
              </View>
              <View className="flex flex-row items-center justify-center w-full mt-2">
                <Text className="text-gray-400">
                  {communityData?.founder &&
                    `By @ ${communityData?.founder.username}`}
                </Text>
                {profileData.isPrivate && (
                  <Text className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Private
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View className="mt-6 flex flex-row justify-around items-center">
            <TouchableOpacity
              className="flex flex-col gap-1 items-center"
              onPress={() => setActiveTab("followers")}
            >
              <Text className="font-bold text-lg text-white">
                {communityData?.followers?.length || 0}
              </Text>
              <Text className="text-gray-400 text-md">Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex flex-col gap-1 items-center"
              onPress={() => setActiveTab("following")}
            >
              <Text className="font-bold text-lg text-white">
                {communityData?.creators?.length || 0}
              </Text>
              <Text className="text-gray-400 text-md">Creators</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex flex-col gap-1 items-center"
              onPress={() => setActiveTab("posts")}
            >
              <Text className="font-bold text-lg text-white">
                {communityData?.total_uploads || 0}
              </Text>
              <Text className="text-gray-400 text-md">Videos</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View className="flex-row w-full items-center justify-center gap-2 mt-5 md:mt-0">
            <TouchableOpacity
              onPress={() => router.push("/(communities)/EditCommunity")}
              className="flex-1 px-4 py-2 rounded-xl bg-transparent border border-gray-400"
            >
              <Text className="text-white text-center">Edit Community</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(demo)/CommunityAnalyticsDemo")}
              className="flex-1 px-4 py-2 rounded-xl bg-transparent border border-gray-400"
            >
              <Text className="text-white text-center">View Analytics</Text>
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity
            onPress={() => changeCommunityFounder()}
            className="px-4 w-fit items-center justify-center mt-3 py-2 rounded-xl border border-gray-400"
          >
            <Text className="text-white text-center">Transfer Ownership</Text>
          </TouchableOpacity> */}

          {/* Bio */}
          <View className="mt-6 flex flex-col items-center justify-center px-4">
            <Text className="text-gray-400 text-xs text-center">
              {communityData?.bio || profileData.description}
            </Text>
          </View>

          {/* Tabs */}
          {/* <View className="mt-6 border-gray-700">
            <View className="flex flex-row justify-around items-center">
              <TouchableOpacity
                className={`pb-4 flex-1 items-center justify-center`}
                onPress={() => setActiveTab("long")}
              >
                <PaperclipIcon
                  color={activeTab === "long" ? "white" : "gray"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className={`pb-4 flex-1 items-center justify-center`}
                onPress={() => setActiveTab("likes")}
              >
                <HeartIcon
                  color={activeTab === "likes" ? "white" : "gray"}
                  fill={activeTab === "likes" ? "white" : ""}
                />
              </TouchableOpacity>
            </View>
          </View> */}
        </View>
      )}

      <>
        {isLoadingVideos ? (
          <View className="w-full flex items-center justify-center mt-20">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(item) => item._id}
            renderItem={renderGridItem}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: 30, paddingTop: 10, paddingHorizontal: 0 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </>
    </ThemedView>
  );
}
