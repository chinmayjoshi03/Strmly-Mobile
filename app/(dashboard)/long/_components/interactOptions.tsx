import { Image, Pressable, Text, View } from "react-native";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";

// Define props type for InteractOptions
type InteractOptionsProps = {
  onCommentPress: () => void; // Callback function for comment button press
  videoId: string;
  likes: number;
  comments?: number;
};

const InteractOptions = ({
  onCommentPress,
  videoId,
  likes,
  comments,
}: InteractOptionsProps) => {
  // Destructure onCommentPress from props
  const [liked, setLiked] = useState(false);
  const [isResharedVideo, setIsResharedVideo] = useState(false);

  const { isLoggedIn, token } = useAuthStore();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const LikeVideo = async () => {
    if (!token || !videoId) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/interaction/${liked ? "unlike" : "like"}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({videoId: videoId}),
        }
      );
      if (!response.ok) throw new Error("Failed while like video");
      const data = await response.json();
      setLiked(!liked);
      console.log("data", data);
    } catch (err) {
      console.log(err);
    }
  };

  const ReshareVideo = async () => {
    if (!token || !videoId) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/interaction/reshare`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({videoId: videoId}),
        }
      );
      if (!response.ok) throw new Error("Failed to reshare video");
      const data = await response.json();
      setIsResharedVideo(!isResharedVideo);
      console.log("data", data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View className="p-1">
      <View className="gap-5">
        <View className="items-center gap-1">
          <Pressable onPress={() => LikeVideo()}>
            <FontAwesome
              name={liked ? "heart" : "heart-o"}
              size={27}
              color={liked ? "red" : "white"}
            />
          </Pressable>

          <Text className="text-white text-sm">{likes}</Text>
        </View>

        <View className="items-center gap-1">
          {/* Add Pressable around the comment icon */}
          <Pressable onPress={onCommentPress}>
            <Image
              className="size-7"
              source={require("../../../../assets/images/comments.png")}
            />
          </Pressable>
          <Text className="text-white text-sm">{comments}</Text>
        </View>

        <View className="items-center gap-1">
          <Image
            className="size-7"
            source={require("../../../../assets/images/repost.png")}
          />
          <Text className="text-white text-sm">999</Text>
        </View>

        <View className="items-center gap-1">
          <Pressable onPress={() => alert("Donate")}>
            <Image
              className="size-7"
              source={require("../../../../assets/images/rupee.png")}
            />
          </Pressable>
          <Text className="text-white text-sm">100</Text>
        </View>
      </View>
    </View>
  );
};

export default InteractOptions;
