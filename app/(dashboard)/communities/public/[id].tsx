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
import { IndianRupee, HeartIcon, PaperclipIcon } from "lucide-react-native"; // React Native Lucide icons
import { useAuthStore } from "@/store/useAuthStore";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import ThemedView from "@/components/ThemedView";
import ProfileTopbar from "@/components/profileTopbar";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { useRoute } from "@react-navigation/native";

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

export default function PublicCommunityPage() {
  const [activeTab, setActiveTab] = useState("long");
  const [communityData, setCommunityData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { token } = useAuthStore();

  // Valid video types for the API
  const validVideoTypes = ["long", "series"];

  //  const { id } = useLocalSearchParams();
  const route = useRoute();
  const { id } = route.params as { id: string };

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
      // Only fetch videos if activeTab is a valid video type
      if (!validVideoTypes.includes(activeTab)) {
        console.log('🔄 Skipping video fetch for non-video tab:', activeTab);
        setVideos([]);
        return;
      }

      setIsLoadingVideos(true);
      try {
        console.log('🔄 Fetching videos for tab:', activeTab);
        const response = await fetch(
          `${BACKEND_API_URL}/community/${id}/videos?type=${activeTab}`,
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
        console.log("✅ Videos fetched:", data.videos?.length || 0);
        setVideos(data.videos || []);
      } catch (err) {
        console.error("❌ Error fetching community videos:", err);
        setVideos([]); // Set empty array on error instead of showing alert
        console.error("❌ Error fetching community videos:", err);
        setVideos([]); // Set empty array on error instead of showing alert
      } finally {
        setIsLoadingVideos(false);
      }
    };

    if (token && id) {
      fetchUserVideos();
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

        console.log('🏘️ Community data received:', {
          name: data.name,
          profile_photo: data.profile_photo,
          founder: data.founder
        });
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
  }, [id, token]);

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
          <View className="flex flex-col items-center md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <View className="relative flex flex-col items-center w-full">
              {/* Replaced Avatar with Image for simplicity, you can create a custom Avatar component */}
              <View className="size-24 rounded-full border border-white overflow-hidden">
                <Image
                  source={{
                    uri: (communityData?.profile_photo && communityData.profile_photo.trim() !== '')
                      ? communityData.profile_photo
                      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(communityData?.name || 'community')}&backgroundColor=random`,
                  }}
                  className="w-full h-full object-cover rounded-full"
                  onError={(error) => {
                    console.log('🖼️ Failed to load community profile photo:', {
                      name: communityData?.name,
                      profile_photo: communityData?.profile_photo,
                      error: error.nativeEvent.error
                    });
                  }}
                  onLoad={() => {
                    console.log('🖼️ Community profile photo loaded successfully');
                  }}
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
            <TouchableOpacity className="flex flex-col gap-1 items-center">
              <Text className="font-bold text-lg text-white">
                {communityData?.followers?.length || 0}
              </Text>
              <Text className="text-gray-400 text-md">Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex flex-col gap-1 items-center">
              <Text className="font-bold text-lg text-white">
                {communityData?.creators?.length || 0}
              </Text>
              <Text className="text-gray-400 text-md">Creators</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex flex-col gap-1 items-center">
              <Text className="font-bold text-lg text-white">
                {communityData?.total_uploads || 0}
              </Text>
              <Text className="text-gray-400 text-md">Videos</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View className="flex flex-row w-full items-center justify-center gap-2 mt-5 md:mt-0">
            <TouchableOpacity className="flex-1 px-4 py-2 rounded-xl bg-transparent border border-gray-400">
              <Text className="text-white text-center">Follow</Text>
            </TouchableOpacity>

            {communityData?.community_fee_type !== "free" && (
              <TouchableOpacity className="rounded-xl overflow-hidden">
                <LinearGradient
                  colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-[1px] rounded-xl flex-1"
                >
                  <View className="flex-1 px-4 py-2 rounded-xl bg-black items-center justify-center">
                    {communityData?.community_fee_type === "free" ? (
                      <Text className="text-white text-center">Free</Text>
                    ) : (
                      <View className="flex-row items-center justify-center">
                        <Text className="text-white">Join at</Text>
                        <Text>
                          <IndianRupee color={"white"} size={13} />
                        </Text>
                        <Text className="text-white text-center">
                          {communityData?.community_fee_amount ||
                            profileData.communityFee}
                          /month
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Bio */}
          <View className="mt-6 flex flex-col items-center justify-center px-4">
            <Text className="text-gray-400 text-xs text-center">
              {communityData?.bio || profileData.description}
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
                onPress={() => setActiveTab("series")}
              >
                <HeartIcon
                  color={activeTab === "series" ? "white" : "gray"}
                  fill={activeTab === "series" ? "white" : ""}
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
        ) : validVideoTypes.includes(activeTab) ? (
          activeTab === "long" ? (
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
              key="series-videos" // Add key to force re-render
              data={videos}
              keyExtractor={(item) => item._id}
              renderItem={renderGridItem}
              numColumns={3}
              contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 0 }}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          <View className="w-full h-96 flex items-center justify-center mt-20">
            <Text className="text-gray-400 text-center">
              {activeTab === "followers" && "Community followers will be shown here"}
              {activeTab === "creators" && "Community creators will be shown here"}
              {activeTab === "stats" && "Community statistics will be shown here"}
            </Text>
          </View>
        )}
      </>
    </ThemedView>
  );
}
