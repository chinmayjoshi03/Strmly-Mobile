import { Link } from "expo-router";
import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

type ActionModalProps = {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  specialText?: boolean;
  useButtons: boolean;
  primaryButtonText?: string;
  onPrimaryButtonPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonPress?: () => void;
};

const ActionModal = ({
  isVisible,
  onClose,
  title,
  specialText,
  useButtons,
  primaryButtonText,
  onPrimaryButtonPress,
  secondaryButtonText,
  onSecondaryButtonPress,
}: ActionModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Allows closing with the back button on Android
    >
      {/* Semi-transparent backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* We add another Pressable inside to prevent the modal from closing when pressing its content */}
        <Pressable style={styles.modalContainer}>
          <Text className="text-white text-sm text-center">
            {title}
            {specialText && (
              <>
                <Link href={"https://strmly.com/terms"}>
                  <Text className="text-blue-500 text-sm text-center">
                    Term of Use
                  </Text>
                </Link>

                <Text className="text-white text-sm text-center"> and </Text>

                <Link href={"https://strmly.com/policy"}>
                  <Text className="text-blue-500 text-sm text-center">
                    Privacy Policy
                  </Text>
                </Link>
              </>
            )}
          </Text>

          {useButtons && (
            <View className="flex-row items-center gap-1.5 mt-8 justify-between">
              <Pressable
                className="rounded-3xl items-center flex-1 bg-[#B0B0B0] px-6 py-2.5"
                onPress={onSecondaryButtonPress}
              >
                <Text className="text-black text-[16px]">
                  {secondaryButtonText}
                </Text>
              </Pressable>
              <Pressable
                className="rounded-3xl flex-1 items-center bg-[#B0B0B0] px-6 py-2.5"
                onPress={onPrimaryButtonPress}
              >
                <Text className="text-black text-[16px]">
                  {primaryButtonText}
                </Text>
              </Pressable>
            </View>
          )}
        </Pressable>
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

export default ActionModal;
