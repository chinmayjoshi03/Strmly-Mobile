import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Dimensions,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  usePlayerStore,
  setActivePlayer,
  clearActivePlayer,
} from "@/store/usePlayerStore";
import VideoControls from "./VideoControls";
import { VideoItemType } from "@/types/VideosType";
import CommentsSection from "./CommentSection";
import GiftingMessage from "./GiftingMessage";
import { router } from "expo-router";
import VideoProgressBar from "./VideoProgressBar";
import { useGiftingStore } from "@/store/useGiftingStore";
import SeriesPurchaseMessage from "./SeriesPurcchaseMessaage";
import CreatorPassBuyMessage from "./CreatorPassBuyMessage";
import VideoBuyMessage from "./VideoBuyMessage";
import { useIsFocused } from "@react-navigation/native";

const { height: screenHeight } = Dimensions.get("window");

type Props = {
  videoData: VideoItemType;
  isActive: boolean;
  showCommentsModal?: boolean;
  setShowCommentsModal?: (show: boolean) => void;
  onEpisodeChange?: (episodeData: any) => void;
  onStatsUpdate?: (stats: {
    likes?: number;
    gifts?: number;
    shares?: number;
    comments?: number;
  }) => void;
  containerHeight?: number;
};

const VideoPlayer = ({
  videoData,
  isActive,
  showCommentsModal = false,
  setShowCommentsModal,
  onEpisodeChange,
  onStatsUpdate,
  containerHeight,
}: Props) => {
  const {
    isGifted,
    isVideoPurchased,
    giftSuccessMessage,
    creator,
    videoName,
    series,
    isPurchasedPass,
    isPurchasedSeries,
    clearGiftingData,
    clearSeriesData,
    clearVideoAccessData,
    clearPassData,
  } = useGiftingStore();

  const { _updateStatus } = usePlayerStore.getState();
  const isMutedFromStore = usePlayerStore((state) => state.isMuted);

  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const mountedRef = useRef(true);
  const statusListenerRef = useRef<any>(null);

  const VIDEO_HEIGHT = containerHeight || screenHeight;
  const isFocused = useIsFocused();

  const player = useVideoPlayer(videoData?.videoUrl || "", (p) => {
    p.loop = true;
    p.muted = isMutedFromStore;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // useEffect(() => {
  //   const readySub = player.addListener("readyForDisplay", () => {
  //     setIsReady(true);
  //   });

  //   const bufferSub = player.addListener("statusChange", ({ status }) => {
  //     setIsBuffering(status === "");
  //   });

  //   return () => {
  //     readySub.remove();
  //     bufferSub.remove();
  //   };
  // }, [player]);

  useEffect(() => {
    const statusSub = player.addListener("statusChange", ({ status }) => {
      setIsReady(status === "readyToPlay");
      setIsBuffering(status === "loading");
    });

    return () => {
      statusSub.remove();
    };
  }, [player]);

  useEffect(() => {
    if (isReady && isActive && isFocused && !isGifted) {
      player.muted = isMutedFromStore;
      player.play();
      setActivePlayer(player);
      usePlayerStore.getState().smartPlay();
    } else {
      player.pause();
    }
  }, [isReady, isActive, isFocused, isGifted, isMutedFromStore]);

  useEffect(() => {
    const statusSub = player.addListener("statusChange", ({ status }) => {
      setIsReady(status === "readyToPlay");
      setIsBuffering(status === "loading");
    });

    return () => {
      statusSub.remove();
    };
  }, [player]);

  useEffect(() => {
    if (isReady && isActive && isFocused && !isGifted) {
      player.muted = isMutedFromStore;
      player.play();
      setActivePlayer(player);
      usePlayerStore.getState().smartPlay();
    } else {
      player.pause();
    }
  }, [isReady, isActive, isFocused, isGifted, isMutedFromStore]);

  useEffect(() => {
    if (isGifted) {
      player.pause();
    } else {
      player.play();
    }
  }, [isGifted]);

  useEffect(() => {
    if (!isFocused) {
      player.pause();
      player.muted = true;
    } else if (isActive) {
      player.muted = isMutedFromStore;
      player.play();
    }
  }, [isFocused, isActive, player, isMutedFromStore]);

  useEffect(() => {
    if (!videoData?.videoUrl) return;

    const handleStatus = (payload: any) => {
      if (isActive) {
        _updateStatus(payload.status, payload.error);
      }
    };

    const statusSubscription = player.addListener("statusChange", handleStatus);
    const timeSub = player.addListener("timeUpdate", handleStatus);

    if (isActive) {
      setActivePlayer(player);
      usePlayerStore.getState().smartPlay();
    } else {
      player.pause();
      player.muted = isMutedFromStore;
    }

    return () => {
      statusSubscription.remove();
      timeSub.remove();
      if (isActive) {
        clearActivePlayer();
      }
    };
  }, [isActive, player, _updateStatus, videoData?.videoUrl]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (statusListenerRef.current) {
        statusListenerRef.current.remove();
      }
      setTimeout(() => {
        try {
          player.replaceAsync(null);
        } catch (error) {}
      }, 0);
    };
  }, [player]);

  const dynamicStyles = StyleSheet.create({
    container: {
      height: VIDEO_HEIGHT,
      width: "100%",
    },
    video: {
      width: "100%",
      height: "100%",
    },
    thumbnail: {
      position: "absolute",
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    spinner: {
      position: "absolute",
      top: "50%",
      left: "50%",
      marginLeft: -20,
      marginTop: -20,
    },
  });

  if (!videoData?.videoUrl) {
    return <View style={dynamicStyles.container} />;
  }

  return (
    <View style={dynamicStyles.container}>
      {!isReady && videoData.thumbnailUrl && (
        <View className="relative">
          <Image
            source={{ uri: videoData.thumbnailUrl }}
            style={dynamicStyles.thumbnail}
          />
          <ActivityIndicator size="large" color="white" className="absolute w-full top-96" />
        </View>
      )}

      <VideoView
        player={player}
        nativeControls={false}
        style={dynamicStyles.video}
        contentFit="cover"
      />

      {isBuffering && (
        <ActivityIndicator
          size="large"
          color="white"
          style={dynamicStyles.spinner}
        />
      )}

      <VideoControls
        videoData={videoData}
        setShowCommentsModal={setShowCommentsModal}
        onEpisodeChange={onEpisodeChange}
        onStatsUpdate={onStatsUpdate}
      />

      {/* Uncomment if needed */}
      {/* <View className="absolute left-0 right-0 z-10 px-2" style={{ bottom: 42.5 }}>
        <VideoProgressBar
          player={player}
          isActive={isActive}
          videoId={videoData._id}
          duration={videoData.duration || 0}
          access={videoData.access}
        />
      </View> */}

      <View className="z-10 absolute top-10 left-5">
        <Pressable onPress={() => router.push("/(dashboard)/wallet")}>
          <Image
            source={require("../../../../assets/images/Wallet.png")}
            className="size-10"
          />
        </Pressable>
      </View>

      {isGifted && (
        <GiftingMessage
          isVisible={true}
          onClose={clearGiftingData}
          creator={creator}
          amount={giftSuccessMessage}
        />
      )}

      {isVideoPurchased && (
        <VideoBuyMessage
          isVisible={true}
          onClose={clearVideoAccessData}
          creator={creator}
          name={videoName}
          amount={giftSuccessMessage}
        />
      )}

      {isPurchasedPass && (
        <CreatorPassBuyMessage
          isVisible={true}
          onClose={clearPassData}
          creator={creator}
          amount={giftSuccessMessage}
        />
      )}

      {isPurchasedSeries && series && (
        <SeriesPurchaseMessage
          isVisible={true}
          onClose={clearSeriesData}
          series={series}
        />
      )}

      {showCommentsModal && setShowCommentsModal && (
        <CommentsSection
          onClose={() => setShowCommentsModal(false)}
          videoId={videoData._id}
          onPressUsername={(userId) => {
            try {
              router.push(`/(dashboard)/profile/public/${userId}`);
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}
          onPressTip={(commentId) => {
            console.log("Open tip modal for comment:", commentId);
          }}
          onCommentAdded={() => {
            if (onStatsUpdate) {
              const newCommentCount = (videoData.comments?.length || 0) + 1;
              onStatsUpdate({ comments: newCommentCount });
            }
          }}
        />
      )}
    </View>
  );
};

export default React.memo(VideoPlayer);
