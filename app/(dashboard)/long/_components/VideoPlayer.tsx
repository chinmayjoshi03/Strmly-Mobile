import React, { useEffect } from "react";
import { View, Dimensions, Pressable, Image, StyleSheet } from "react-native";
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
import { router, useFocusEffect } from "expo-router";
import VideoProgressBar from "./VideoProgressBar";
import { useGiftingStore } from "@/store/useGiftingStore";
import SeriesPurchaseMessage from "./SeriesPurcchaseMessaage";
import CreatorPassBuyMessage from "./CreatorPassBuyMessage";

const { height: screenHeight } = Dimensions.get("screen");
const VIDEO_HEIGHT = screenHeight;

type Props = {
  videoData: VideoItemType;
  isActive: boolean;
  showCommentsModal?: boolean;
  setShowCommentsModal?: (show: boolean) => void;
};

const VideoPlayer = ({
  videoData,
  isActive,
  showCommentsModal = false,
  setShowCommentsModal,
}: Props) => {
  const {
    isGifted,
    giftSuccessMessage,
    creator,
    series,
    isPurchasedPass,
    isPurchasedSeries,
    clearGiftingData,
  } = useGiftingStore();

  const { _updateStatus } = usePlayerStore.getState();
  const isMutedFromStore = usePlayerStore((state) => state.isMuted);

  // FIX: Move the conditional check after hooks but handle gracefully
  const player = useVideoPlayer(videoData?.videoUrl || "", (p) => {
    p.loop = true;
    p.muted = isMutedFromStore;
  });

  useEffect(() => {
    if (isGifted) {
      player.pause();
    } else {
      player.play();
    }
  }, [isGifted]);

  // This single, stable useEffect now manages the entire lifecycle
  useEffect(() => {
    // Don't proceed if no video URL
    if (!videoData?.videoUrl) return;

    const statusSubscription = player.addListener("statusChange", (payload) => {
      // Only the active video should update the global store
      if (isActive) {
        _updateStatus(payload.status, payload.error);
      }
    });

    if (isActive) {
      // This video is visible and playing
      setActivePlayer(player);
      // Use the smart play function to handle audio interaction logic
      const { smartPlay } = usePlayerStore.getState();
      smartPlay();
    } else {
      // This video is not visible, pause and reset
      player.pause();
      player.currentTime = 0;
    }

    // This cleanup function is called when the component unmounts OR when `isActive` changes.
    return () => {
      // Always remove the listener
      statusSubscription.remove();
      // If this was the active player, clear the global reference
      if (isActive) {
        clearActivePlayer();
      }
    };
  }, [isActive, player, _updateStatus, videoData?.videoUrl]);

  // A final cleanup effect for when the component is removed from the FlatList entirely
  useEffect(() => {
    return () => {
      // FIX: Use replaceAsync to avoid blocking the UI thread
      player.replaceAsync(null);
    };
  }, [player]);

  // Render empty container if no video URL
  if (!videoData?.videoUrl) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        nativeControls={false}
        style={styles.video}
        contentFit="cover"
      />

      <VideoControls
        videoData={videoData}
        setShowCommentsModal={setShowCommentsModal}
      />

      <View className="absolute bottom-[2.56rem] left-0 h-5 z-10 right-0">
        <VideoProgressBar
          player={player}
          isActive={isActive}
          videoId={videoData._id}
          duration={
            videoData.duration || videoData.access.freeRange.display_till_time
          }
          access={
            videoData.access || {
              isPlayable: true,
              freeRange: { start_time: 0, display_till_time: 0 },
              isPurchased: false,
              accessType: "free",
              price: 0,
            }
          }
        />
      </View>

      <View className="z-10 absolute top-16 left-5">
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

      {isPurchasedPass && (
        <CreatorPassBuyMessage
          isVisible={true}
          onClose={clearGiftingData}
          creator={creator}
          amount={giftSuccessMessage}
        />
      )}

      {isPurchasedSeries && series && (
        <SeriesPurchaseMessage
          isVisible={true}
          onClose={clearGiftingData}
          series={series}
        />
      )}

      {showCommentsModal && setShowCommentsModal && (
        <CommentsSection
          onClose={() => setShowCommentsModal(false)}
          videoId={videoData._id}
          onPressUsername={(userId) => {
            // Navigate to user profile
            console.log("Navigate to user profile:", userId);
            try {
              router.push(`/(dashboard)/profile/public/${userId}`);
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}
          onPressTip={(commentId) => {
            // Open tip modal for comment
            console.log("Open tip modal for comment:", commentId);
            // You can implement tip modal logic here
          }}
        />
      )}
    </View>
  );
  //  (
  //   <View style={styles.container}>
  //     <VideoContentGifting
  //       creator={videoData.created_by}
  //       videoId={videoData._id}
  //       setIsWantToGift={setIsWantToGift}
  //       setIsGifted={setIsGifted}
  //       giftMessage={setGiftSuccessMessage}
  //     />
  //   </View>
  // );
};

const styles = StyleSheet.create({
  container: {
    height: VIDEO_HEIGHT,
    width: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});

export default React.memo(VideoPlayer);
