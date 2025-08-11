import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  FlatList, // Removed Pressable as TouchableOpacity is used
  Dimensions,
  BackHandler,
} from "react-native";
import { IndianRupee, HeartIcon, PaperclipIcon } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import ThemedView from "@/components/ThemedView";
import ProfileTopbar from "@/components/profileTopbar";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { useRoute } from "@react-navigation/native";
import VideoPlayer from "@/app/(dashboard)/long/_components/VideoPlayer";
import BottomNavBar from "@/components/BottomNavBar";

// Note: Trimmed down profileData to only include properties actually used as fallbacks.
const profileData = {
  name: "Tech Entrepreneurs",
  description: "A community for tech entrepreneurs to share ideas and network",
  communityFee: 30,
  isPrivate: false, // This is still used in the JSX
};

export default function PublicCommunityPage() {
  const [activeTab, setActiveTab] = useState("long");
  const [communityData, setCommunityData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  // Video player state
  const [isVideoPlayerActive, setIsVideoPlayerActive] = useState(false);
  const [currentVideoData, setCurrentVideoData] = useState<any>(null);
  const [currentVideoList, setCurrentVideoList] = useState<any[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const { token } = useAuthStore();
  const validVideoTypes = ["long", "series"];
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
      if (!validVideoTypes.includes(activeTab)) {
        console.log('🔄 Skipping video fetch for non-video tab:', activeTab);
        setVideos([]);
        return;
      }

      setIsLoadingVideos(true);
      try {
        console.log('🔄 Fetching videos for tab:', activeTab);
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
        // FIX: Removed duplicate setVideos() call
      } catch (err) {
        console.error("❌ Error fetching community videos:", err);
        setVideos([]);
        // FIX: Removed duplicate setVideos() call and console.error
      } finally {
        setIsLoadingVideos(false);
      }
    };

    if (token && id) {
      fetchUserVideos();
    }
  }, [activeTab, token, id, BACKEND_API_URL]); // Added BACKEND_API_URL to dependency array

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (isVideoPlayerActive) {
        closeVideoPlayer();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isVideoPlayerActive]);

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
  }, [id, token, BACKEND_API_URL]); // Added BACKEND_API_URL to dependency array

  // --- FIX: All functions below were defined twice. The duplicates have been removed. ---

  // Video player functions
  const navigateToVideoPlayer = (videoData: any, allVideos: any[]) => {
    console.log('🎬 Opening video player for:', videoData.title || videoData.name);
    const currentIndex = allVideos.findIndex(video => video._id === videoData._id);

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

  // Render functions for videos
  const renderVideoItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden mb-2 mx-1"
      onPress={() => navigateToVideoPlayer(item, videos)}
    >
      {item.thumbnailUrl ? ( // Simplified conditional rendering
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
          <ActivityIndicator color="white" />
          <Text className="text-white text-xs mt-2">Generating thumbnail...</Text>
        </View>
      )}
      <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
        <Text className="text-white text-xs font-medium" numberOfLines={2}>
          {item.title || item.name || 'Untitled'}
        </Text>
        {item.created_by && (
          <Text className="text-gray-300 text-xs">@{item.created_by.username}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden m-1"
      onPress={() => navigateToVideoPlayer(item, videos)}
    >
      {item.thumbnailUrl ? ( // Simplified conditional rendering
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
          <ActivityIndicator size="small" color="white" />
        </View>
      )}
      <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
        <Text className="text-white text-xs font-medium" numberOfLines={1}>
          {item.title || item.name || 'Untitled'}
        </Text>
      </View>
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <>
          {/* FIX: Wrapped scrollable content in a FlatList header to avoid VirtualizedLists error */}
          <FlatList
            ListHeaderComponent={
              <View className="max-w-4xl -mt-28 relative mx-6 mb-4">
                <View className="flex flex-col items-center md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                  <View className="relative flex flex-col items-center w-full">
                    <View className="size-24 rounded-full border-2 border-white overflow-hidden bg-gray-800">
                      <Image
                        source={{
                          uri: (communityData?.profile_photo && communityData.profile_photo.trim() !== '')
                            ? communityData.profile_photo
                            : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(communityData?.name || 'community')}&backgroundColor=random`,
                        }}
                        className="w-full h-full object-cover"
                      />
                    </View>
                    <View className="flex flex-row items-center justify-center w-full mt-2">
                      <Text className="text-gray-400">
                        {communityData?.founder &&
                          `By @${communityData?.founder.username}`}
                      </Text>
                      {profileData.isPrivate && (
                        <Text className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Private
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

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
                          <View className="flex-row items-center justify-center">
                            <Text className="text-white">Join at </Text>
                            <IndianRupee color={"white"} size={13} />
                            <Text className="text-white text-center">
                              {communityData?.community_fee_amount || profileData.communityFee}/month
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="mt-6 flex flex-col items-center justify-center px-4">
                  <Text className="text-gray-400 text-xs text-center">
                    {communityData?.bio || profileData.description}
                  </Text>
                </View>

                <View className="mt-6 border-b border-gray-700">
                  <View className="flex flex-row justify-around items-center">
                    <TouchableOpacity
                      className={`pb-4 flex-1 items-center justify-center border-b-2 ${activeTab === 'long' ? 'border-white' : 'border-transparent'}`}
                      onPress={() => setActiveTab("long")}
                    >
                      <PaperclipIcon color={activeTab === "long" ? "white" : "gray"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`pb-4 flex-1 items-center justify-center border-b-2 ${activeTab === 'series' ? 'border-white' : 'border-transparent'}`}
                      onPress={() => setActiveTab("series")}
                    >
                      <HeartIcon
                        color={activeTab === "series" ? "white" : "gray"}
                        fill={activeTab === "series" ? "white" : "transparent"} // Use transparent fill
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            }
            // Video list rendering
            data={isLoadingVideos ? [] : videos}
            key={activeTab} // Use activeTab as key to force re-render on tab change
            keyExtractor={(item) => item._id}
            renderItem={activeTab === "long" ? renderVideoItem : renderGridItem}
            numColumns={activeTab === "long" ? 1 : 3}
            ListEmptyComponent={
              isLoadingVideos ? (
                <View className="flex-1 h-64 items-center justify-center">
                  <ActivityIndicator size="large" color="white" />
                </View>
              ) : (
                <View className="flex-1 h-64 items-center justify-center">
                  <Text className="text-gray-400">No {activeTab} videos yet.</Text>
                </View>
              )
            }
            contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 4 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Integrated Video Player Modal */}
      {isVideoPlayerActive && currentVideoData && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'black',
          zIndex: 1000,
        }}>
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
              length: Dimensions.get('window').height,
              offset: Dimensions.get('window').height * index,
              index,
            })}
            pagingEnabled
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            snapToInterval={Dimensions.get('window').height}
            snapToAlignment="start"
          />
        </View>
      )}
      
      {/* Bottom Navigation Bar */}
      {!isVideoPlayerActive && (
        <BottomNavBar />
      )}
    </ThemedView>
  );
}