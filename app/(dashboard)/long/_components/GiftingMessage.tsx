import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, Image } from "react-native";
import { GiftType } from "../VideoFeed";

type ActionModalProps = {
  isVisible: boolean;
  onClose: (value: boolean) => void;
  message: any;
  giftData: GiftType | null;
  setGiftData: (value: null) => void;
  giftMessage: (value: null) => void;
};

const GiftingMessage = ({
  isVisible,
  onClose,
  message,
  giftData,
  setGiftData,
  giftMessage,
}: ActionModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        onClose(false);
        setGiftData(null);
        giftMessage(null);
      }} // Allows closing with the back button on Android
    >
      {/* Semi-transparent backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          onClose(false);
          setGiftData(null);
          giftMessage(null);
        }}
      >
        <View className="rounded-full bg-gray-500">
          <Image
            source={
              giftData?.creator.profile_photo
                ? { uri: giftData?.creator.profile_photo }
                : require("../../../../assets/images/user.png")
            }
            className="size-10 rounded-full"
          />
        </View>

        <Pressable style={styles.modalContainer}>
          <Text className="text-white text-sm text-center">
            Successfully gifted ₹{message.amount} to {message.to}
          </Text>
        </Pressable>

        <View className="items-center justify-center gap-5">
          <Text className="text-white text-3xl text-center">
            ₹{message.amount}
          </Text>
          <Image
            source={require("../../../../assets/images/successGift.png")}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#B0B0B0BB",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "black", // A dark grey, fitting for a dark theme
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default GiftingMessage;
