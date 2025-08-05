import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, Image } from "react-native";
import { GiftType } from "../VideoFeed";

type ActionModalProps = {
  isVisible: boolean;
  onClose: (value: boolean) => void;
  amount: number;
  creator: GiftType | null;
  giftMessage: (value: null) => void;
};

const GiftingMessage = ({
  isVisible,
  onClose,
  amount,
  creator,
  giftMessage,
}: ActionModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        onClose(false);
        giftMessage(null);
      }} // Allows closing with the back button on Android
    >
      {/* Semi-transparent backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          onClose(false);
          giftMessage(null);
        }}
      >
        <View className="bg-black items-center justify-center rounded-2xl px-2 py-6">
          <View className="rounded-full bg-gray-500">
            <Image
              source={
                creator?.profile_photo
                  ? { uri: creator.profile_photo }
                  : require("../../../../assets/images/user.png")
              }
              className="size-16 rounded-full"
            />
          </View>

          {creator?.name && (
            <Text className="text-white text-2xl font-bold text-center mt-5">
              {creator.name}
            </Text>
          )}

          <Pressable style={styles.modalContainer}>
            <Text className="text-white text-lg text-center">
              Successfully gifted ₹{amount} to {creator?.username}
            </Text>
          </Pressable>

          <View className="flex-row items-center justify-center gap-5">
            <Text className="text-white text-6xl text-center">₹{amount}</Text>
            <Image
              source={require("../../../../assets/images/successGift.png")}
              className="size-10"
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000000A8",
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
