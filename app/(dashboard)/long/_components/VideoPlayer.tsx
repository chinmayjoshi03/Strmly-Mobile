import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Pressable, Image } from "react-native";
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
  setShowCommentsModal 
}: Props) => {

  const [isWantToGift, setIsWantToGift] = useState(false);
  const [isGifted, setIsGifted] = useState(false);
  const [giftSuccessMessage, setGiftSuccessMessage] = useState<number | null>(
    null
  );

  // Add missing functions and variables
  const clearGiftingData = () => {
    setIsGifted(false);
    setGiftSuccessMessage(null);
  };

  const creator = videoData.created_by;
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

    const statusSubscription = player.addListener(
      "statusChange",
      (status, oldStatus, error) => {
        // Only the active video should update the global store
        if (isActive) {
          _updateStatus(status, error);
        }
      }
    );

    // Listen for playback status changes
    const playbackStatusSubscription = player.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (isActive) {
          _updateStatus(status);
        }
      }
    );

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
      // Always remove the listeners
      statusSubscription.remove();
      playbackStatusSubscription.remove();
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

      <View className="absolute bottom-12 left-0 h-5 z-10 right-0">
        <VideoProgressBar player={player} isActive={isActive}/>
      </View>

      <View className="z-10 absolute top-4 left-5">
        <Pressable
          onPress={() => {
            console.log('💰 Wallet button pressed in VideoPlayer!');
            try {
              router.push("/(dashboard)/wallet");
              console.log('✅ Navigation to wallet successful');
            } catch (error) {
              console.error('❌ Navigation error:', error);
            }
          }}
        >
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

      {showCommentsModal && setShowCommentsModal && (
        <CommentsSection
          onClose={() => setShowCommentsModal(false)}
          videoId={videoData._id}
          onPressUsername={(userId) => {
            // Navigate to user profile
            console.log('Navigate to user profile:', userId);
            try {
              router.push(`/(dashboard)/profile/public/${userId}`);
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
          onPressTip={(commentId) => {
            // Open tip modal for comment
            console.log('Open tip modal for comment:', commentId);
            // You can implement tip modal logic here
          }}
        />
      )}
    </View>
  );
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