import { Image, Pressable, Text, View } from "react-native";
<<<<<<< Updated upstream
import React, { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
=======
import React, { useState, useEffect } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { VideoInteractionsAPI } from "@/api/video/videoInteractions";
import { useAuthStore } from "@/store/useAuthStore";

>>>>>>> Stashed changes

// Define props type for InteractOptions
type InteractOptionsProps = {
  onCommentPress: () => void; // Callback function for comment button press
  videoId: string;
  likes: number;
  comments?: number;
<<<<<<< Updated upstream
  setIsWantToGift: any;
  setGiftingData: {
    _id: string;
    profile?: string;
    username: string;
    email: string;
  };
  creator: {} | undefined;
};

const InteractOptions = ({
  onCommentPress,
  videoId,
  likes,
  comments,
  setIsWantToGift,
  setGiftingData,
  creator,
}: InteractOptionsProps) => {
  // Destructure onCommentPress from props
  const [like, setLike] = useState(0);
  const [isLikedVideo, setIsLikedVideo] = useState(false);
  const [isResharedVideo, setIsResharedVideo] = useState(false);

  const { isLoggedIn, token } = useAuthStore();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  console.log("creator", creator);

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
      console.log("data", data);
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
        console.log("data", data);
        setLike(data.likes);
        setIsLikedVideo(data.isLiked);
      } catch (err) {
        console.log(err);
      }
    };

    if (token && videoId) {
      checkIfVideoLike();
    }
  }, [token, videoId]);

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
      console.log("data", data);
    } catch (err) {
      console.log(err);
    }
  };

  const openGifting = () => {
    setGiftingData(creator);
    setIsWantToGift(true);
  };
=======
  videoId: string;
  shares?: number;
};

const InteractOptions = ({ onCommentPress, likes: initialLikes, comments, videoId, shares: initialShares = 0 }: InteractOptionsProps) => { // Destructure props
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [sharesCount, setSharesCount] = useState(initialShares);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();
  
  useEffect(() => {
    // Get initial like status when component mounts
    const fetchLikeStatus = async () => {
      try {
        if (token && videoId) {
          const response = await VideoInteractionsAPI.getLikeStatus(token, videoId);
          setLiked(response.isLiked);
          setLikesCount(response.likes);
        }
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };
    
    // Get initial shares count
    const fetchSharesCount = async () => {
      try {
        if (token && videoId) {
          const response = await VideoInteractionsAPI.getTotalShares(token, videoId);
          setSharesCount(response.totalShares);
        }
      } catch (error) {
        console.error('Error fetching shares count:', error);
      }
    };
    
    fetchLikeStatus();
    fetchSharesCount();
  }, [token, videoId]);
>>>>>>> Stashed changes

  return (
    <View className="p-1">
      <View className="gap-5">
        <View className="items-center gap-1">
<<<<<<< Updated upstream
          <Pressable onPress={() => LikeVideo()}>
=======
          <Pressable 
            onPress={async () => {
              if (!token || isLoading) return;
              
              try {
                setIsLoading(true);
                const response = await VideoInteractionsAPI.likeVideo(token, videoId);
                setLiked(response.isLiked);
                setLikesCount(response.likes);
              } catch (error) {
                console.error('Error liking video:', error);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
>>>>>>> Stashed changes
            <FontAwesome
              name={isLikedVideo ? "heart" : "heart-o"}
              size={27}
              color={isLikedVideo ? "red" : "white"}
            />
          </Pressable>

<<<<<<< Updated upstream
          <Text className="text-white text-sm">{like}</Text>
=======
          <Text className="text-white text-sm">{likesCount}</Text>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
          <Text className="text-white text-sm"> </Text>
=======
          <Pressable
            onPress={async () => {
              if (!token || isLoading) return;
              
              try {
                setIsLoading(true);
                const response = await VideoInteractionsAPI.shareVideo(token, videoId);
                setSharesCount(response.shares);
              } catch (error) {
                console.error('Error sharing video:', error);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <Image
              className="size-7"
              source={require("../../../../assets/images/repost.png")}
            />
          </Pressable>
          <Text className="text-white text-sm">{sharesCount}</Text>
>>>>>>> Stashed changes
        </View>

        <View className="items-center gap-1">
          <Pressable onPress={() => openGifting()}>
            <Image
              className="size-7"
              source={require("../../../../assets/images/rupee.png")}
            />
          </Pressable>
          <Text className="text-white text-sm"></Text>
        </View>
      </View>
    </View>
  );
};

export default InteractOptions;
