import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  Dimensions,
  BackHandler,

  Modal,
} from "react-native";
import {
  IndianRupee,
  HeartIcon,
  PaperclipIcon,
  X,
  Users,
  Video,
} from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import ThemedView from "@/components/ThemedView";
import ProfileTopbar from "@/components/profileTopbar";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { useRoute } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import VideoPlayer from "@/app/(dashboard)/long/_components/VideoPlayer";
import BottomNavBar from "@/components/BottomNavBar";
import { communityActions } from "@/api/community/communityActions";
import CommunityPassBuyMessage from "./CommPassBuyMessage";
import { useGiftingStore } from "@/store/useGiftingStore";

export default function PublicCommunityPage() {
  const [activeTab, setActiveTab] = useState<string>("videos");
  const [communityData, setCommunityData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowingCommunity, setIsFollowingCommunity] = useState(false);
  const [isFollowingLoading, setFollowingLoading] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  const [hasCommunityPass, setHasCommunityPass] = useState<boolean>(false);

  // Video player state
  const [isVideoPlayerActive, setIsVideoPlayerActive] = useState(false);
  const [currentVideoData, setCurrentVideoData] = useState<any>(null);
  const [currentVideoList, setCurrentVideoList] = useState<any[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // Section data states
  const [followers, setFollowers] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);
  const [videoType, setVideoType] = useState("long");

  const { token, user } = useAuthStore();
  const {
    isPurchasedCommunityPass,
    clearCommunityPassData,
    creator,
    giftSuccessMessage,
  } = useGiftingStore();

  const route = useRoute();
  const router = useRouter();

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
      if (activeTab !== "videos") {
        return;
      }

      setIsLoadingVideos(true);
      try {
        console.log("🔄 Fetching videos for type:", videoType);
        const response = await fetch(
          `${BACKEND_API_URL}/community/${id}/videos?videoType=${videoType}`,
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
      if (videoType == "long") {
        fetchUserVideos();
      } else if (videoType == "liked") {
        fetchUserLikeVideos();
      }
    }
  }, [activeTab, videoType, token, id, BACKEND_API_URL]);

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (isVideoPlayerActive) {
        closeVideoPlayer();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isVideoPlayerActive]);

  useFocusEffect(
    useCallback(() => {
      const fetchCommunityData = async () => {
        try {
          const response = await fetch(`${BACKEND_API_URL}/community/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to fetch community profile"
            );
          }

          console.log("🏘️ Community data received:", {
            name: data.name,
            profile_photo: data.profile_photo,
            founder: data.founder,
          });
          setCommunityData(data);
          setIsFollowingCommunity(
            data.followers.some(
              (follower: { _id: string }) => follower._id === user?.id
            )
          );
        } catch (error) {
          console.log(error);
          Alert.alert("An unknown error occurred.");
          // Alert.alert(
          //   "Error",
          //   error instanceof Error
          //     ? error.message
          //     : "An unknown error occurred while fetching community data."
          // );
        } finally {
          setIsLoading(false);
        }
      };

      if (token && id) {
        fetchCommunityData();
      }
    }, [id, token, isFollowingCommunity])
  );

  useFocusEffect(
    useCallback(() => {
      const checkIfFollowCommunity = async () => {
        if (!token || !id) {
          return;
        }

        try {
          const response = await fetch(
            `${BACKEND_API_URL}/community/${id}/following-status`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok)
            throw new Error("Failed while checking community follow status");
          const data = await response.json();
          // console.log("check follow community", data);
          setIsFollowingCommunity(data.status);
        } catch (err) {
          console.log("Error in community check status", err);
        }
      };

      if (token && id) {
        checkIfFollowCommunity();
      }
    }, [token, id])
  );

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

      console.log('Follow comm data', data);
      setIsFollowingCommunity(data.isFollowingCommunity);
    } catch (error) {
      console.log(error);
      Alert.alert("An unknown error occurred.");
      // Alert.alert(
      //   "Error",
      //   error instanceof Error
      //     ? error.message
      //     : "An unknown error occurred while following community."
      // );
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
          Alert.alert("An unknown error occurred.");
          // Alert.alert(
          //   "Error",
          //   error instanceof Error
          //     ? error.message
          //     : "An unknown error occurred while following user."
          // );
        } finally {
          setIsLoading(false);
        }
      };

      if (id && token) {
        HasCommunityPass();
      }
    }, [id, token])
  );

  // Fetch followers
  const fetchFollowers = async () => {
    if (!token || !id) return;

    setIsLoadingFollowers(true);
    try {
      const result = await communityActions.getCommunityFollowers(token, id);
      setFollowers(result.followers || []);
    } catch (error) {
      console.error("❌ Error fetching followers:", error);
      Alert.alert("Error", "Failed to fetch followers");
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  // Fetch creators
  const fetchCreators = async () => {
    if (!token || !id) return;

    setIsLoadingCreators(true);
    try {
      const result = await communityActions.getCommunityCreators(token, id);
      setCreators(result.creators || []);
    } catch (error) {
      console.error("❌ Error fetching creators:", error);
      Alert.alert("Error", "Failed to fetch creators");
    } finally {
      setIsLoadingCreators(false);
    }
  };

  // Handle section changes
  const handleSectionChange = (section: string) => {
    setActiveTab(section);

    if (section === "followers" && followers.length === 0) {
      fetchFollowers();
    } else if (section === "creators" && creators.length === 0) {
      fetchCreators();
    }
  };

  // Navigate to user profile
  const navigateToUserProfile = (userId: string) => {
    console.log("🔄 Navigating to user profile:", userId);
    try {
      router.push(`/(dashboard)/profile/public/${userId}` as any);
    } catch (error) {
      console.error("❌ Navigation error:", error);
    }
  };

  // Video player functions
  const navigateToVideoPlayer = (videoData: any, allVideos: any[]) => {
    console.log(
      "🎬 Opening video player for:",
      videoData.title || videoData.name
    );
    const currentIndex = allVideos.findIndex(
      (video) => video._id === videoData._id
    );

    setCurrentVideoData(videoData);
    setCurrentVideoList(allVideos);
    setCurrentVideoIndex(currentIndex >= 0 ? currentIndex : 0);
    setIsVideoPlayerActive(true);
  };

  const closeVideoPlayer = () => {
    setIsVideoPlayerActive(false);
    setCurrentVideoData(null);
    setCurrentVideoList([]);
    setCurrentVideoIndex(0);
    setShowCommentsModal(false);
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentVideoIndex(viewableItems[0].index);
    }
  }, []);

  // Render functions for videos - consistent thumbnail format
  const renderVideoItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="relative aspect-[9/16] w-full rounded-lg overflow-hidden mb-3"
      onPress={() => navigateToVideoPlayer(item, videos)}
    >
      {item.thumbnailUrl ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
          className="w-full h-full object-cover"
        />
      ) : thumbnails[item._id] ? (
        <Image
          source={{ uri: thumbnails[item._id] }}
          className="w-full h-full object-cover"
        />
      ) : (
        <View className="w-full h-full flex items-center justify-center bg-gray-800">
          <Video size={40} color="white" />
          <Text className="text-white text-xs mt-2">Loading...</Text>
        </View>
      )}

      {/* Video overlay info */}
      <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <Text className="text-white text-sm font-medium" numberOfLines={2}>
          {item.title || item.name || "Untitled"}
        </Text>
        {item.created_by && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              navigateToUserProfile(item.created_by._id);
            }}
            className="mt-1"
          >
            <Text className="text-gray-300 text-xs">
              @{item.created_by.username}
            </Text>
          </TouchableOpacity>
        )}
        <View className="flex-row items-center mt-1 space-x-3">
          {item.views && (
            <Text className="text-gray-400 text-xs">{item.views} views</Text>
          )}
          {item.likes && (
            <Text className="text-gray-400 text-xs">{item.likes} likes</Text>
          )}
        </View>
      </View>

      {/* Play button overlay */}
      <View className="absolute inset-0 items-center justify-center">
        <View className="bg-black/50 rounded-full p-3">
          <Video size={24} color="white" fill="white" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="relative aspect-[9/16] flex-1 rounded-lg overflow-hidden m-1"
      onPress={() => navigateToVideoPlayer(item, videos)}
    >
      {item.thumbnailUrl ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
          className="w-full h-full object-cover"
        />
      ) : thumbnails[item._id] ? (
        <Image
          source={{ uri: thumbnails[item._id] }}
          className="w-full h-full object-cover"
        />
      ) : (
        <View className="w-full h-full flex items-center justify-center bg-gray-800">
          <Video size={20} color="white" />
        </View>
      )}

      {/* Compact overlay for grid */}
      <View className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
        <Text className="text-white text-xs font-medium" numberOfLines={1}>
          {item.title || item.name || "Untitled"}
        </Text>
      </View>

      {/* Small play button */}
      <View className="absolute top-2 right-2">
        <View className="bg-black/50 rounded-full p-1">
          <Video size={12} color="white" fill="white" />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render user item for followers/creators modals
  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-row items-center p-3 border-b border-gray-800"
      onPress={() => {
        console.log("🔄 User item pressed:", item.username, item._id);
        navigateToUserProfile(item._id);
      }}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 mr-3">
        <Image
          source={{
            uri:
              item.profile_photo ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.username || "user")}&backgroundColor=random`,
          }}
          className="w-full h-full object-cover"
        />
      </View>
      <View className="flex-1">
        <Text className="text-white font-medium">{item.username}</Text>
        {item.name && (
          <Text className="text-gray-400 text-sm">{item.name}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView className="flex-1 pt-5">
      {/* Cover Image */}
      {!isLoading && (
        <View className="relative">
          <ProfileTopbar
            isMore={false}
            hashtag={true}
            name={communityData?.name}
          />
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <View className="max-w-4xl -mt-28 relative mx-6 pt-28">
              <View className="items-center justify-center gap-4 h-fit w-full mt-6">
                <Image
                  source={
                    communityData?.profile_photo
                      ? {
                          uri: communityData.profile_photo,
                        }
                      : require("../../../../assets/images/user.png")
                  }
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 2,
                    borderColor: "white",
                    resizeMode: "cover",
                  }}
                />
                <Text className="text-white text-center text-sm">
                  {communityData?.founder &&
                    `By @${communityData?.founder.username}`}
                </Text>
                {/* {profileData.isPrivate && (
                      <Text className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Private
                      </Text>
                    )} */}
              </View>

              {/* Section Navigation */}
              <View className="mt-6 flex-row justify-around items-center border-gray-800">
                <TouchableOpacity
                  className={`flex flex-col gap-1 items-center pb-4 flex-1 ${activeTab === "followers" ? "border-b-2 border-white" : ""}`}
                  onPress={() => handleSectionChange("followers")}
                >
                  <Text className="font-bold text-lg text-white">
                    {communityData?.followers?.length || 0}
                  </Text>
                  <Text
                    className={`text-md ${activeTab === "followers" ? "text-white" : "text-gray-400"}`}
                  >
                    Followers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex flex-col gap-1 items-center pb-4 flex-1 ${activeTab === "creators" ? "border-b-2 border-white" : ""}`}
                  onPress={() => handleSectionChange("creators")}
                >
                  <Text className="font-bold text-lg text-white">
                    {communityData?.creators?.length || 0}
                  </Text>
                  <Text
                    className={`text-md ${activeTab === "creators" ? "text-white" : "text-gray-400"}`}
                  >
                    Creators
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex flex-col gap-1 items-center pb-4 flex-1 ${activeTab === "videos" ? "border-b-2 border-white" : ""}`}
                  onPress={() => handleSectionChange("videos")}
                >
                  <Text className="font-bold text-lg text-white">
                    {videos.length || 0}
                  </Text>
                  <Text
                    className={`text-md ${activeTab === "videos" ? "text-white" : "text-gray-400"}`}
                  >
                    Videos
                  </Text>
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
                    <TouchableOpacity className="rounded-xl overflow-hidden">
                      <LinearGradient
                        colors={[
                          "#4400FFA6",
                          "#FFFFFF",
                          "#FF00004D",
                          "#FFFFFF",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-[1px] rounded-xl flex-1"
                      >
                        <View className="flex-1 px-4 py-2 rounded-xl bg-black items-center justify-center">
                          <View className="flex-row items-center justify-center">
                            <Text className="text-white">Join at </Text>
                            <IndianRupee color={"white"} size={13} />
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
              {communityData?.bio &&
              <View className="mt-6 flex flex-col items-center justify-center px-4">
                <Text className="text-gray-400 text-xs text-center">
                  {communityData?.bio}
                </Text>
              </View>}

              {/* Video Type Tabs - Only show when videos section is active */}
              {activeTab === "videos" && (
                <View className="mt-4 border-gray-700">
                  <View className="flex flex-row justify-around items-center">
                    <TouchableOpacity
                      className={`pb-4 flex-1 items-center justify-center border-b-2 ${videoType === "long" ? "border-white" : "border-transparent"}`}
                      onPress={() => setVideoType("long")}
                    >
                      <PaperclipIcon
                        color={videoType === "long" ? "white" : "gray"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`pb-4 flex-1 items-center justify-center border-b-2 ${videoType === "liked" ? "border-white" : "border-transparent"}`}
                      onPress={() => setVideoType("liked")}
                    >
                      <HeartIcon
                        color={videoType === "liked" ? "white" : "gray"}
                        fill={videoType === "liked" ? "white" : "transparent"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Search Bar - Only show for followers and creators */}
              {(activeTab === "followers" || activeTab === "creators") && (
                <View className="mt-4 px-4">
                  <View className="bg-gray-800 rounded-lg px-4 py-3 flex-row items-center">
                    <Text className="text-gray-400 flex-1">Search...</Text>
                  </View>
                </View>
              )}
            </View>
          }
          data={
            activeTab === "videos"
              ? isLoadingVideos
                ? []
                : videos
              : activeTab === "followers"
                ? isLoadingFollowers
                  ? []
                  : followers
                : activeTab === "creators"
                  ? isLoadingCreators
                    ? []
                    : creators
                  : []
          }
          key={`${activeTab}-${videoType}`}
          keyExtractor={(item) => item._id}
          renderItem={
            activeTab === "videos"
              ? videoType === "long"
                ? renderVideoItem
                : renderGridItem
              : renderUserItem
          }
          numColumns={activeTab === "videos" && videoType === "liked" ? 3 : 1}
          columnWrapperStyle={
            activeTab === "videos" && videoType === "liked"
              ? { justifyContent: "space-between" }
              : undefined
          }
          ListEmptyComponent={
            (activeTab === "videos" && isLoadingVideos) ||
            (activeTab === "followers" && isLoadingFollowers) ||
            (activeTab === "creators" && isLoadingCreators) ? (
              <View className="flex-1 h-64 items-center justify-center">
                <ActivityIndicator size="large" color="white" />
              </View>
            ) : (
              <View className="flex-1 h-64 items-center justify-center">
                {activeTab === "videos" && <Video size={48} color="gray" />}
                {activeTab === "followers" && <Users size={48} color="gray" />}
                {activeTab === "creators" && <Users size={48} color="gray" />}
                <Text className="text-gray-400 text-center mt-4">
                  {activeTab === "videos"
                    ? `No ${videoType} videos yet`
                    : activeTab === "followers"
                      ? "No followers yet"
                      : "No creators yet"}
                </Text>
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 4 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Integrated Video Player Modal */}
      {isVideoPlayerActive && currentVideoData && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
            zIndex: 1000,
          }}
        >
          <FlatList
            data={currentVideoList}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <VideoPlayer
                key={`${item._id}-${index === currentVideoIndex}`}
                videoData={item}
                isActive={index === currentVideoIndex}
                showCommentsModal={showCommentsModal}
                setShowCommentsModal={setShowCommentsModal}
              />
            )}
            initialScrollIndex={currentVideoIndex}
            getItemLayout={(_, index) => ({
              length: Dimensions.get("window").height,
              offset: Dimensions.get("window").height * index,
              index,
            })}
            pagingEnabled
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            snapToInterval={Dimensions.get("window").height}
            snapToAlignment="start"
          />
        </View>
      )}

      {isPurchasedCommunityPass && (
        <CommunityPassBuyMessage
          isVisible={true}
          onClose={clearCommunityPassData}
          creator={creator}
          amount={giftSuccessMessage}
        />
      )}

      {/* Bottom Navigation Bar */}
      {!isVideoPlayerActive && <BottomNavBar />}
    </ThemedView>
  );
}
