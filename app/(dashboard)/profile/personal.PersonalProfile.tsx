import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
  Image,
  FlatList,

} from "react-native";
import { CONFIG } from "@/Constants/config";
import {
  MapPin,
  LinkIcon,
  HeartIcon,
  PaperclipIcon,
  LogOut,
} from "lucide-react-native";


import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from "@/store/useAuthStore";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";

import ThemedView from "@/components/ThemedView";
import ProfileTopbar from "@/components/profileTopbar";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";

export default function PersonalProfilePage() {

  const [activeTab, setActiveTab] = useState("long");
  const [userData, setUserData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  const { token, user } = useAuthStore();
  const router = useRouter();

  const thumbnails = useThumbnailsGenerate(
    videos.map((video) => ({
      id: video._id,
      url: video.videoUrl,
    }))
  );

  // Refresh profile data when auth store user changes (e.g., after profile update)
  useEffect(() => {
    if (user?.profile_photo && userData && user.profile_photo !== userData.profile_photo) {
      console.log('🔄 Auth store profile photo changed, refreshing profile data');
      // Update userData with the new profile photo from auth store
      setUserData((prev: any) => prev ? { ...prev, profile_photo: user.profile_photo } : prev);
    }
  }, [user?.profile_photo, userData?.profile_photo]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserVideos = async () => {
        setIsLoadingVideos(true);
        try {
          const params = new URLSearchParams();
          params.append("type", activeTab);

          const response = await fetch(`${CONFIG.API_BASE_URL}/user/videos?${params.toString()}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            },
          });


          const data = await response.json();



          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch user videos");
          }

          console.log("videos", data);
          setVideos(data.videos);
        } catch (err) {
          console.error("Error fetching user videos:", err);
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

      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          const timestamp = new Date().getTime();
          const response = await fetch(`${CONFIG.API_BASE_URL}/user/profile-details?_=${timestamp}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            },
          });

          const data = await response.json();


          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch user profile");
          }

          console.log("Fetched fresh user data:", data.user);
          console.log("Profile counts - Followers:", data.user.totalFollowers, "Following:", data.user.totalFollowing, "Communities:", data.user.totalCommunities);
          setUserData(data.user);
          setIsError(null);
        } catch (error) {
          console.log("error", error);
          setIsError(
            error instanceof Error ? error.message : "An unknown error occurred."
          );
          Alert.alert(
            "Error",
            error instanceof Error ? error.message : "An unknown error occurred."
          );
        } finally {
          setIsLoading(false);
        }
      };

      if (token) {
        fetchUserData();
        fetchUserVideos();
      }
    }, [token, activeTab])
  );

  const currentProfileData = {
    name: userData?.name || "User",
    email: userData?.email || "",
    image:
      user?.profile_photo ||
      userData?.profile_photo ||
      userData?.avatar ||
      userData?.image ||
      "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    username: userData?.username || userData?.email?.split("@")[0] || "user",
    bio: userData?.bio || "Welcome to my profile! 👋",
    location: userData?.location || "Not specified",
    website: userData?.website || "",
    joinedDate: userData?.createdAt
      ? new Date(userData.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
      : "N/A",
    coverImage:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=200&fit=crop",
    followers: userData?.totalFollowers || 0,
    following: userData?.totalFollowing || 0,
    posts: userData?.stats?.videosCount || 0,
    communityLength: userData?.totalCommunities || 0,
    isVerified: userData?.isVerified || false,
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
      <ScrollView className="flex-1">
        {!isLoading && (
          <View className="h-48 relative">
            <ProfileTopbar hashtag={false} name={currentProfileData.username} />
          </View>
        )}

        {/* Profile Info */}
        {isLoading ? (
          <View className="w-full h-96 flex items-center justify-center -mt-20 relative">
            <ActivityIndicator size="large" color="#F1C40F" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center h-60 -mt-20">
            <Text className="text-white text-center">
              Sorry, it looks like an error occurred:{" "}
              {typeof isError === "string" ? isError : "Unknown error"}
            </Text>
          </View>
        ) : (
          <View className="max-w-4xl -mt-28 relative mx-6">
            <View className="flex flex-col items-center md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
              <View className="relative">
                <Image
                  source={currentProfileData?.image ? {
                    uri: currentProfileData.image,
                  } : require('../../../assets/images/user.png')}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 2,
                    borderColor: 'white',
                    resizeMode: 'cover'
                  }}
                />

                <View className="flex flex-row gap-2 items-center justify-center mt-2">
                  <Text className="text-gray-400">
                    @{currentProfileData.username}
                  </Text>
                  {(currentProfileData.isVerified ||
                    userData?.creator_profile?.verification_status ===
                    "verified") && (
                      <Text className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                        Verified
                      </Text>
                    )}
                </View>
              </View>
            </View>

            {/* Stats */}
            <View className="mt-6 flex-row justify-around items-center">
              <TouchableOpacity
                className="flex flex-col gap-1 items-center"
                onPress={() => router.push({
                  pathname: "/(dashboard)/profile/ProfileSections",
                  params: { section: "followers", userName: currentProfileData.username }
                })}
              >
                <Text className="font-bold text-lg text-white">
                  {currentProfileData.followers}
                </Text>
                <Text className="text-gray-400 text-md">Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-col gap-1 items-center"
                onPress={() => router.push({
                  pathname: "/(dashboard)/profile/ProfileSections",
                  params: { section: "myCommunity", userName: currentProfileData.username }
                })}
              >
                <Text className="font-bold text-lg text-white">
                  {currentProfileData.communityLength}
                </Text>
                <Text className="text-gray-400 text-md">Community</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-col gap-1 items-center"
                onPress={() => router.push({
                  pathname: "/(dashboard)/profile/ProfileSections",
                  params: { section: "following", userName: currentProfileData.username }
                })}
              >
                <Text className="font-bold text-lg text-white">
                  {currentProfileData.following}
                </Text>
                <Text className="text-gray-400 text-md">Followings</Text>
              </TouchableOpacity>
            </View>

            <View className="flex flex-row w-full items-center justify-center gap-2 mt-5">
              {/* My Community Button */}
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: "/(dashboard)/profile/ProfileSections",
                  params: { section: "myCommunity", userName: currentProfileData.username }
                })}
                className="px-4 py-2 rounded-lg border border-white"
              >
                <Text className="text-white text-center font-bold">
                  My Community
                </Text>
              </TouchableOpacity>

              {/* Dashboard Button (Gradient Border) */}
              <TouchableOpacity
                onPress={() => router.push("/(dashboard)/profile/Dashboard")}
                className="px-4 py-2 rounded-lg border border-white"
              >
                <Text className="text-white text-center font-bold">
                  Dashboard
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1 flex-row w-full items-center justify-center gap-2 mt-5">
              <TouchableOpacity
                onPress={() => router.push("/Profile/EditProfile")}
                className="px-4 py-2 border border-gray-400 rounded-lg"
              >
                <Text className="text-white text-center">Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(dashboard)/profile/History")}
                className="px-4 py-2 border border-gray-400 rounded-lg"
              >
                <Text className="text-white text-center">History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(dashboard)/profile/access")}
                className="rounded-lg overflow-hidden"
              >
                <LinearGradient
                  colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-[1.5px] rounded-lg flex-1"
                >
                  <View className="flex-1 px-4 py-2 rounded-lg bg-black items-center justify-center">
                    <Text className="text-white text-center font-bold">
                      Access
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Bio */}
            <View className="mt-6 flex flex-col items-center justify-center px-4">
              <Text className="text-gray-400 text-center text-xs">
                {currentProfileData.bio}
              </Text>
              <View className="mt-2 flex flex-row flex-wrap gap-4 text-gray-400 justify-center">
                {currentProfileData.location !== "Not specified" && (
                  <View className="flex-row items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    <Text className="text-gray-400">
                      {currentProfileData.location}
                    </Text>
                  </View>
                )}
                {currentProfileData.website && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(currentProfileData.website)}
                    className="flex-row items-center"
                  >
                    <LinkIcon className="w-4 h-4 mr-1 text-white" />
                    <Text className="text-white underline">
                      {currentProfileData.website}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View className="mt-6 border-b border-gray-700">
          <View className="flex-1 flex-row justify-around items-center">
            <TouchableOpacity
              className={`pb-4 flex-1 items-center justify-center`}
              onPress={() => setActiveTab("long")}
            >
              <PaperclipIcon color={activeTab === "long" ? "white" : "gray"} />
            </TouchableOpacity>

            <TouchableOpacity
              className={`pb-4 flex-1 items-center justify-center`}
              onPress={() => setActiveTab("repost")}
            >
              <Image
                source={require("../../../assets/images/repost.png")}
                className={`size-7 ${activeTab === "repost" ? "text-white font-semibold" : "text-gray-800"}`}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className={`pb-4 flex-1 items-center justify-center`}
              onPress={() => setActiveTab("liked")}
            >
              <HeartIcon
                color={"white"}
                fill={activeTab === "liked" ? "white" : ""}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Grid */}
        {isLoadingVideos ? (
          <View className="w-full h-96 flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#F1C40F" />
          </View>
        ) : (
          <View className="flex-1">
            <FlatList
              data={videos}
              keyExtractor={(item) => item._id}
              renderItem={renderGridItem}
              numColumns={3}
              contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 0 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            />
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}