import { Image, Pressable, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";

// Define props type for InteractOptions
type GiftDataType = {
  creator: {
    _id: string;
    profile_photo: string;
    name: string;
    username: string;
  };
  videoId: string;
};

type GiftDataType = {
  creator: {
    _id: string;
    profile_photo: string;
    name: string;
    username: string;
  };
  videoId: string;
};

type InteractOptionsProps = {
  onCommentPress: () => void; // Callback function for comment button press
  videoId: string;
  likes: number;
  gifts: number;
  shares: number;
  comments?: number;
  setIsWantToGift: any;
  setGiftingData: (data: GiftDataType) => void;
  setGiftingData: (data: GiftDataType) => void;
  creator: {
    _id: string;
    profile_photo: string;
    name: string;
    username: string;
    name: string;
    username: string;
  };
};

const InteractOptions = ({
  onCommentPress,
  videoId,
  likes,
  gifts,
  shares,
  comments,
  setIsWantToGift,
  setGiftingData,
  creator,
}: InteractOptionsProps) => {
  // Destructure onCommentPress from props
  const [like, setLike] = useState(0);
  const [reshares, setReshares] = useState(0);
  const [gift, setGifts] = useState(0);
  const [isLikedVideo, setIsLikedVideo] = useState(false);
  const [isResharedVideo, setIsResharedVideo] = useState(false);
  const [isGiftedVideo, setIsGiftedVideo] = useState(false);

  const { token } = useAuthStore();

  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  // console.log("creator", creator);

  const LikeVideo = async () => {
    if (!token || !videoId) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/interaction/${isLikedVideo ? "unlike" : "like"}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoId: videoId }),
        }
      );
      if (!response.ok) throw new Error("Failed while like video");
      const data = await response.json();
      setLike(data.likes);
      setIsLikedVideo(data.isLiked);
      console.log("Like video", data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const checkIfVideoLike = async () => {
      if (!token || !videoId) {
        return;
      }

      try {
        const response = await fetch(
          `${BACKEND_API_URL}/interaction/like/status`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoId: videoId }),
          }
        );
        if (!response.ok) throw new Error("Failed while like video");
        const data = await response.json();
        console.log("check like", data);
        setLike(data.likes);
        setIsLikedVideo(data.isLiked);
      } catch (err) {
        console.log(err);
      }
    };

    if (token && videoId) {
      checkIfVideoLike();
    }
  }, [token, videoId, likes]);

  // ------------- Reshare ------------
  useEffect(()=> setReshares(shares), [shares]);

  useEffect(() => {
    const checkIfReshare = async () => {
      if (!token || !videoId) {
        return;
      }

      try {
        const response = await fetch(
          `${BACKEND_API_URL}/interaction/reshare/status`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoId: videoId }),
          }
        );
        if (!response.ok) throw new Error("Failed while checking reshare status");
        const data = await response.json();
        console.log("data", data);
        // setReshares(data.video_reshares); 
        setIsResharedVideo(data.isReshared);
      } catch (err) {
        console.log(err);
      }
    };

    if (token && videoId) {
      // checkIfReshare();
    }
  }, [token, videoId, shares]);

  const ReshareVideo = async () => {
    if (!token || !videoId) {
      console.log("videoId", token);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/interaction/reshare`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: videoId }),
      });
      if (!response.ok) throw new Error("Failed to reshare video");
      const data = await response.json();
      setIsResharedVideo(!isResharedVideo);
      setReshares(data.totalReshares);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- Gifting API ----------------
  useEffect(()=> setGifts(gifts), [gifts]);

  const openGifting = () => {
    setGiftingData({ creator, videoId });
    setGiftingData({ creator, videoId });
    setIsWantToGift(true);
  };

  return (
    <View className="p-1">
      <View className="gap-5">
        <View className="items-center gap-1">
          <Pressable onPress={() => LikeVideo()}>
            <FontAwesome
              name={isLikedVideo ? "heart" : "heart-o"}
              size={27}
              color={isLikedVideo ? "red" : "white"}
            />
          </Pressable>

          <Text className="text-white text-sm">{like}</Text>
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
          <Pressable onPress={ReshareVideo}>
            {isResharedVideo ? (
              <Image
                className="size-7"
                source={require("../../../../assets/images/reshare-green.png")}
              />
            ) : (
              <Image
                className="size-7"
                source={require("../../../../assets/images/repost.png")}
              />
            )}
          </Pressable>
          <Text className="text-white text-sm">{reshares}</Text>
        </View>

        <View className="items-center gap-1">
          <Pressable onPress={() => openGifting()}>
            <Image
              className="size-7"
              source={require("../../../../assets/images/rupee.png")}
            />
          </Pressable>
          <Text className="text-white text-sm">{gift}</Text>
        </View>
      </View>
    </View>
  );
};

export default InteractOptions;
