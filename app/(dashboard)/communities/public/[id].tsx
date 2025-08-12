import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { IndianRupee, HeartIcon, PaperclipIcon } from "lucide-react-native"; // React Native Lucide icons
import { useAuthStore } from "@/store/useAuthStore";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import ThemedView from "@/components/ThemedView";
import ProfileTopbar from "@/components/profileTopbar";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { useRoute } from "@react-navigation/native";
import { useGiftingStore } from "@/store/useGiftingStore";
import { router, useFocusEffect } from "expo-router";
import CommunityPassBuyMessage from "./CommPassBuyMessage";

export default function PublicCommunityPage() {
  const [activeTab, setActiveTab] = useState("long");
  const [communityData, setCommunityData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFollowingCommunity, setIsFollowingCommunity] = useState(false);
  const [isFollowingLoading, setFollowingLoading] = useState(false);
  const [hasCommunityPass, setHasCommunityPass] = useState<boolean>(false);

  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { token, user } = useAuthStore();
  const {
    isPurchasedCommunityPass,
    clearCommunityPassData,
    creator,
    giftSuccessMessage,
  } = useGiftingStore();

  const route = useRoute();
  const { id } = route.params as { id: string };
  // const id = "6890586c8039a7684646c364";

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
    const fetchUserVideos = async () => {
      setIsLoadingVideos(true);
      try {
        console.log("🔄 Fetching videos for tab:", activeTab);
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
        console.log("✅ Videos fetched:", data.videos?.length || 0);
        setVideos(data.videos || []);
      } catch (err) {
        console.error("❌ Error fetching community videos:", err);
        setVideos([]);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    const fetchUserLikeVideos = async () => {
      setIsLoadingVideos(true);
      try {
        console.log("🔄 Fetching Like videos for tab:", activeTab);
        const response = await fetch(
          `${BACKEND_API_URL}/user/liked-videos-community/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch community like videos"
          );
        }
        console.log("✅ Like Videos fetched:", data.videos?.length || 0);
        setVideos(data.videos || []);
      } catch (err) {
        console.error("❌ Error fetching community like videos:", err);
        setVideos([]);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    if (token && id) {
      if (activeTab == "long") {
        fetchUserVideos();
      } else {
        fetchUserLikeVideos();
      }
    }
  }, [activeTab, token, id]);

  useEffect(() => {
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

        console.log(data);
        setCommunityData(data);
        setIsFollowingCommunity(
          data.followers.some(
            (follower: { _id: string }) => follower._id === user?.id
          )
        );
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
  }, [id, token]);

  const followCommunity = async () => {
    try {
      setFollowingLoading(true);
      const response = await fetch(
        `${BACKEND_API_URL}/${isFollowingCommunity ? "caution/community/unfollow" : "community/follow"}`,
        {
          method: !isFollowingCommunity ? "POST" : "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ communityId: id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to follow community profile");
      }

      console.log(data.message);
      setIsFollowingCommunity(data.isFollowingCommunity);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "An unknown error occurred while following community."
      );
    } finally {
      setFollowingLoading(false);
    }
  };

  // Check if Community pass is already purchased
  useFocusEffect(
    useCallback(() => {
      const HasCommunityPass = async () => {
        try {
          const response = await fetch(
            `${BACKEND_API_URL}/user/has-community-access/${id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to fetch user creator pass"
            );
          }

          console.log("has Creator pass", data);
          setHasCommunityPass(data.data.hasCommunityAccess);
        } catch (error) {
          console.log(error);
          Alert.alert(
            "Error",
            error instanceof Error
              ? error.message
              : "An unknown error occurred while following user."
          );
        } finally {
          setIsLoading(false);
        }
      };

      if (id && token) {
        HasCommunityPass();
      }
    }, [id, token])
  );

  const renderVideoItem = ({ item }: { item: any }) => (
    <Pressable className="w-full h-[100vh] mb-4 relative rounded-lg overflow-hidden bg-black">
      {thumbnails[item._id] ? (
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
    </Pressable>
  );

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="relative aspect-[9/16] m-1 flex-1 rounded-sm overflow-hidden">
      {thumbnails[item._id] ? (
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
      {/* Cover Image */}
      {!isLoading && (
        <View className="h-48 relative">
          <ProfileTopbar
            isMore={false}
            hashtag={true}
            name={communityData?.name}
          />
        </View>
      )}

      {isLoading ? (
        <View className="w-full flex items-center justify-center h-full">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <View className="max-w-4xl -mt-28 relative mx-6">
          <View className="flex flex-col items-center md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <View className="relative flex flex-col items-center w-full">
              {/* Replaced Avatar with Image for simplicity, you can create a custom Avatar component */}
              <View className="size-24 rounded-full border border-white overflow-hidden">
                <Image
                  source={{
                    uri: communityData?.profile_photo,
                  }}
                  className="w-full h-full object-cover rounded-full"
                />
              </View>
              <View className="flex flex-row items-center justify-center w-full mt-2">
                <Text className="text-gray-400">
                  {communityData?.founder &&
                    `By @ ${communityData?.founder.username}`}
                </Text>
                {/* {profileData.isPrivate && (
                  <Text className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Private
                  </Text>
                )} */}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View className="mt-6 flex flex-row justify-around items-center">
            <TouchableOpacity
              className="flex flex-col gap-1 items-center"
              // onPress={() => setActiveTab("followers")}
            >
              <Text className="font-bold text-lg text-white">
                {communityData?.followers?.length || 0}
              </Text>
              <Text className="text-gray-400 text-md">Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex flex-col gap-1 items-center"
              // onPress={() => setActiveTab("following")}
            >
              <Text className="font-bold text-lg text-white">
                {communityData?.creators?.length || 0}
              </Text>
              <Text className="text-gray-400 text-md">Creators</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex flex-col gap-1 items-center"
              // onPress={() => setActiveTab("posts")}
            >
              <Text className="font-bold text-lg text-white">
                {communityData?.total_uploads || 0}
              </Text>
              <Text className="text-gray-400 text-md">Videos</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View className="flex flex-row w-full items-center justify-center gap-2 mt-5 md:mt-0">
            <TouchableOpacity
              onPress={followCommunity}
              className="flex-1 px-4 py-2 rounded-xl bg-transparent border border-gray-400"
            >
              <Text className="text-white text-center">
                {!isFollowingCommunity ? "Follow" : "Following"}
              </Text>
            </TouchableOpacity>

            {communityData?.community_fee_type !== "free" &&
              !hasCommunityPass && (
                <TouchableOpacity
                  onPress={() => router.push(`/(demo)/PurchaseCommPass/${id}`)}
                  className="rounded-xl overflow-hidden"
                >
                  <LinearGradient
                    colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-[1px] rounded-xl flex-1"
                  >
                    <View className="flex-1 px-4 py-2 rounded-xl bg-black items-center justify-center">
                      <View className="flex-row items-center justify-center">
                        <Text className="text-white">Join at</Text>
                        <Text>
                          <IndianRupee color={"white"} size={13} />
                        </Text>
                        <Text className="text-white text-center">
                          {communityData?.community_fee_amount}
                          /month
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}

            {hasCommunityPass && (
              <TouchableOpacity className="rounded-xl overflow-hidden">
                <LinearGradient
                  colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-[1px] rounded-xl flex-1"
                >
                  <View className="flex-1 px-4 rounded-xl bg-black items-center justify-center">
                    <View className="items-center justify-center">
                      <Text className="text-white text-lg text-center">
                        Purchased
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Bio */}
          <View className="mt-6 flex flex-col items-center justify-center px-4">
            <Text className="text-gray-400 text-xs text-center">
              {communityData?.bio}
            </Text>
          </View>

          {/* Tabs */}
          <View className="mt-6 border-gray-700">
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
                onPress={() => setActiveTab("liked")}
              >
                <HeartIcon
                  color={activeTab === "liked" ? "white" : "gray"}
                  fill={activeTab === "liked" ? "white" : ""}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <>
        {isLoadingVideos ? (
          <View className="w-full h-96 flex items-center justify-center mt-20">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : activeTab === "long" ? (
          <FlatList
            key="long-videos" // Add key to force re-render
            data={videos}
            keyExtractor={(item) => item._id}
            renderItem={renderVideoItem}
            contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 0 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            key="liked-videos"
            data={videos}
            keyExtractor={(item) => item._id}
            renderItem={renderGridItem}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 0 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {isPurchasedCommunityPass && (
          <CommunityPassBuyMessage
            isVisible={true}
            onClose={clearCommunityPassData}
            creator={creator}
            amount={giftSuccessMessage}
          />
        )}
      </>
    </ThemedView>
  );
}
