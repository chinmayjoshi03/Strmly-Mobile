import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Volume2Icon, VolumeOffIcon } from "lucide-react-native";
import { usePlayerStore } from "@/store/usePlayerStore";
import VideoProgressBar from "./VideoProgressBar";
import InteractOptions from "./interactOptions";
import VideoDetails from "./VideoDetails";

type Props = {
  videoData: any;
  setShowCommentsModal: (visible: boolean) => void;
  isWantToGift: (visible: boolean) => void;
};

const VideoControls = ({ videoData, isWantToGift, setShowCommentsModal }: Props) => {
  const isMuted = usePlayerStore((state) => state.isMuted);
  const isBuffering = usePlayerStore((state) => state.isBuffering);
  const toggleMute = usePlayerStore((state) => state.toggleMute);

  const [showMuteIcon, setShowMuteIcon] = useState(false);

  

  useEffect(() => {
    let timer: NodeJS.Timeout | number;
    if (showMuteIcon) {
      timer = setTimeout(() => setShowMuteIcon(false), 800);
    }
    return () => clearTimeout(timer);
  }, [showMuteIcon]);

  const handleToggleMute = () => {
    toggleMute();
    setShowMuteIcon(true);
  };

  return (
    <>
      <Pressable
        style={styles.fullScreenPressable}
        onPress={handleToggleMute}
      />
      <View style={styles.iconContainer} pointerEvents="none">
        {showMuteIcon &&
          (isMuted ? (
            <VolumeOffIcon size={40} color="white" />
          ) : (
            <Volume2Icon size={40} color="white" />
          ))}
        {isBuffering && !showMuteIcon && (
          <ActivityIndicator size="large" color="white" />
        )}
      </View>
      <View style={styles.interact}>
        <InteractOptions
          videoId={videoData._id}
          creator={videoData.created_by}
          likes={videoData.likes}
          gifts={videoData.gifts}
          shares={videoData.shares}
          comments={videoData.comments?.length}
          onCommentPress={() => setShowCommentsModal(true)}
          setIsWantToGift={isWantToGift}
        />
      </View>
      <View style={styles.details}>
        <VideoDetails
          videoId={videoData._id}
          type={videoData.type}
          is_monetized={videoData.is_monetized}
          name={videoData.name}
          series={videoData?.series}
          episode_number={videoData?.episode_number}
          createdBy={videoData?.created_by}
          community={videoData?.community}
        />
      </View>

      <View style={styles.progressContainer}>
        <VideoProgressBar />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fullScreenPressable: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  iconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  interact: { position: "absolute", bottom: "15%", right: 10, zIndex: 5 },
  details: {
    position: "absolute",
    bottom: "2%",
    width: "100%",
    paddingHorizontal: 16,
    zIndex: 5,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 14,
    zIndex: 10,
  },
});

export default React.memo(VideoControls);
