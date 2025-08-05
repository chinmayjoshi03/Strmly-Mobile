import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { ChevronDownIcon, Hash, PlusSquare } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import { router } from "expo-router";

const episodes = [
  "Episode : 01",
  "Episode : 02",
  "Episode : 03",
  "Episode : 04",
  "Episode : 05",
];
const paid = [
  {
    content: "Content access",
    price: "29",
  },
  {
    content: "Creator pass",
    price: "99/month",
  },
];

type VideoDetailsProps = {
  videoId: string;
  name: string;
  type: string;
  series?: {};
  createdBy?: {};
  onToggleFullScreen: () => void;
  isFullScreen: boolean;
};

const VideoDetails = ({
  videoId,
  type,
  name,
  series,
  createdBy,
  onToggleFullScreen,
  isFullScreen,
}: VideoDetailsProps) => {
  const [screenIconEffect, setScreenIconEffect] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [isFollowCreator, setIsFollowCreator] = useState<boolean>(false);
  const [isFollowCommunity, setIsFollowCommunity] = useState<boolean>(false);

  const { token } = useAuthStore();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;
  console.log(videoId,
  type,
  name,
  series,
  createdBy)

  const followCreator = async () => {
    if (!token || !videoId) {
      return;
    }
    
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/user/${isFollowCreator ? 'unfollow' : 'follow'}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(!isFollowCreator ? { followUserId: videoId } : {unfollowUserId: videoId}),
        }
      );
      if (!response.ok) throw new Error("Failed to follow user");
      const data = await response.json();
      setIsFollowCreator(!isFollowCreator);
      console.log('data', data);
    } catch (err) {
      console.log(err);
    }
  };

  const followCommunity = async () => {
    if (!token || !videoId) { // change videoId -> CommunityId
      return;
    }
    
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/community/${isFollowCommunity ? 'unfollow' : 'follow'}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(!isFollowCommunity ? { communityId: videoId } : {unfollowUserId: videoId}),
        }
      );
      if (!response.ok) throw new Error("Failed to follow user");
      const data = await response.json();
      setIsFollowCommunity(!isFollowCommunity);
      console.log('data', data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View className="w-full gap-3.5">
      {/* Top tags */}
      <View className="flex-row items-center justify-start gap-2">
        {
          createdBy &&
          <>
          <View className="items-center flex-row gap-0.5">
          <Hash color={"white"} size={14} fontWeight={800} />
          <Text className="text-white font-semibold"> </Text>
        </View>
        <Image
          source={require("../../../../assets/images/plus.png")}
          className="size-5"
        />
          </>
        }
      </View>

      {/* Username + Paid */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Pressable onPress={()=> router.push(`/profile/public/${createdBy._id}`)}>
            <Text className="text-white font-semibold">
            {createdBy ? createdBy?.username : ""}
          </Text>
          </Pressable>
          <TouchableOpacity
            onPress={() => followCreator()}
            className="border border-white items-center justify-center rounded-md px-2"
          >
            <Text className="font-semibold text-sm text-white">{isFollowCreator ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
        </View>

        {type == "Paid" && (
          <View>
            <TouchableOpacity
              onPress={() => {
                setShowPriceDropdown((prev) => !prev);
                setShowDropdown(false);
              }}
              className="border border-white rounded-md px-2"
            >
              <Text className="font-semibold text-sm text-white">Paid</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Episode + Fullscreen */}
      <View className="flex-row items-center justify-between relative">
        <View className="flex-row items-center gap-1">
          <Text className="text-white uppercase">{name}</Text>
          {/* {series !== null && (
            <TouchableOpacity
              className="border border-white rounded-xl px-2 py-0.5"
              onPress={() => {
                setShowDropdown((prev) => !prev);
                setShowPriceDropdown(false);
              }}
            >
              <View className="flex-row items-center">
                <Text className="font-semibold text-xs text-white mr-1">
                  Ep: 0{selectedEpisodeIndex + 1}
                </Text>
                <ChevronDownIcon color={"white"} size={12} />
              </View>
            </TouchableOpacity>
          )} */}
        </View>

        <Pressable onPress={onToggleFullScreen}>
          <Image
            source={require("../../../../assets/images/fullscreen.png")}
            className={`size-5 ${isFullScreen ? "scale-110" : "scale-100"} ease-in`}
          />
        </Pressable>

        {/* Paid Dropdown */}
        {showPriceDropdown && (
          <View className="absolute bottom-12 -right-2 rounded-xl p-2 w-80">
            {paid.map((sub, idx) => (
              <TouchableOpacity
                key={idx}
                className="mb-0.5"
                onPress={() => {
                  setShowPriceDropdown(false);
                  setShowDropdown(false);
                  router.push('/(payments)/Video/VideoContentGifting')
                }}
              >
                <View
                  className={`bg-black h-11 px-2 py-1 flex-row items-center justify-between ${
                    idx == 0 && "rounded-t-xl"
                  } ${idx == paid.length - 1 && "rounded-b-xl"}`}
                >
                  <Text className="text-white text-[16px] flex-row items-center">
                    {sub.content}
                  </Text>
                  <Text className="text-white text-[16px]">₹{sub.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Episode Dropdown */}
        {showDropdown && (
          <View className="absolute bottom-3.5 left-11 rounded-xl p-2 w-56">
            {episodes.map((ep, idx) => (
              <TouchableOpacity
                key={idx}
                className="mb-[0.5px]"
                onPress={() => {
                  setSelectedEpisodeIndex(idx);
                  setShowDropdown(false);
                }}
              >
                <View
                  className={`bg-black px-2 py-2 flex-row items-center ${
                    idx == 0 && "rounded-t-xl"
                  } ${idx == episodes.length - 1 && "rounded-b-xl"} ${selectedEpisodeIndex === idx && "gap-2"}`}
                >
                  <Text className="text-white text-[18px] flex-row items-center">
                    {ep}
                  </Text>
                  {selectedEpisodeIndex === idx && (
                    <Text className="text-white">✔</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default VideoDetails;
