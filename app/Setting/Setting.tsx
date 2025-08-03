import { View, Text, Pressable, Image, Linking } from "react-native";
import React, { useState } from "react";
import ThemedView from "@/components/ThemedView";
import ProfileTopbar from "@/components/profileTopbar";
import ActionModal from "./_component/customModal";

const Setting = () => {
  const [toggleMonetization, setToggleMonetization] = useState(false);

  // 1. Use a single state object to manage modal configuration.
  const [modalConfig, setModalConfig] = useState({
    isVisible: false,
    title: "",
    specialText: false,
    useButtons: false,
    primaryButtonText: "",
    onPrimaryButtonPress: () => {},
    secondaryButtonText: "",
  });

  // 2. Create generic functions to open and close the modal.
  const openModal = (config) => {
    setModalConfig({ ...config, isVisible: true });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isVisible: false }));
  };

  // 3. Define handler functions for primary actions.
  const handleLogout = () => {
    console.log("Logging out...");
    // Add your logout logic here (e.g., clear tokens, navigate to login)
    closeModal();
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account...");
    // Add your account deletion API call here
    closeModal();
  };

  const openURL = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log(`Don't know how to open this URL: ${url}`);
    }
    closeModal();
  };

  // 4. Define configuration objects for each modal type.
  const modalTypes = {
    support: {
      title:
        "For any questions or support, please email us at team@strmly.com. We aim to respond within 24–48 hours.",
      useButtons: false,
    },
    privacy: {
      title:
        "Our Privacy Policy details how we collect, use, and protect your data.",
      useButtons: true,
      primaryButtonText: "View Policy",
      onPrimaryButtonPress: () => openURL("https://strmly.com/privacy"), // Replace with your URL
      secondaryButtonText: "Close",
    },
    terms: {
      title: "Our Terms of Use govern your use of our services.",
      useButtons: true,
      specialText: true,
      primaryButtonText: "View Terms",
      onPrimaryButtonPress: () => openURL("https://strmly.com/terms"), // Replace with your URL
      secondaryButtonText: "Close",
    },
    monetization: {
      title:
        "By enabling Comment Monetization, your new comments will be monetized and can’t be edited or deleted. To edit or delete future comments, you must first turn off monetization. Strmly may revoke access in case of abuse or policy violations. By continuing, you agree to our",
      specialText: true,
      useButtons: true,
      primaryButtonText: "Agree",
      onPrimaryButtonPress: handleLogout,
      secondaryButtonText: "Cancel",
    },
    logout: {
      title: "Are you sure you want to log out?",
      useButtons: true,
      primaryButtonText: "Logout",
      onPrimaryButtonPress: handleLogout,
      secondaryButtonText: "Cancel",
    },
    delete: {
      title: "This action is irreversible. Are you sure you want to permanently delete your account?",
      useButtons: true,
      primaryButtonText: "Delete",
      onPrimaryButtonPress: handleDeleteAccount,
      secondaryButtonText: "Cancel",
    }
  };

  return (
    <ThemedView className="flex-1 pt-10">
      <View>
        <ProfileTopbar name="Setting" isMore={false} hashtag={false} />
      </View>

      <View className="mt-14 items-start mx-5 gap-5 w-full">
        {/* --- Monetization Toggle --- */}
        <View className="flex-row items-center justify-between w-full">
          <Text className="text-white text-lg">
            Activate comment monetization
          </Text>
          <Pressable
            onPress={() => openModal(modalTypes.monetization)}
            className="mr-6"
          >
            <Image
              source={
                toggleMonetization
                  ? require("../../assets/images/switch-green.png")
                  : require("../../assets/images/switch.png")
              }
              className="size-6"
            />
          </Pressable>
        </View>

        {/* --- Action Buttons --- */}
        <Pressable onPress={() => openModal(modalTypes.support)}>
          <Text className="text-white text-lg">Contact and Support</Text>
        </Pressable>

        <Pressable onPress={() => openModal(modalTypes.privacy)}>
          <Text className="text-white text-lg">Privacy Policy</Text>
        </Pressable>

        <Pressable onPress={() => openModal(modalTypes.terms)}>
          <Text className="text-white text-lg">Term of Use</Text>
        </Pressable>

        <Pressable onPress={() => openModal(modalTypes.logout)}>
          <Text className="text-white text-lg">Logout</Text>
        </Pressable>

        <Pressable onPress={() => openModal(modalTypes.delete)}>
          <Text className="text-red-500 text-lg">Delete Account</Text>
        </Pressable>
      </View>

      {/* 5. Render a single modal, driven by the config state. */}
      <ActionModal
        isVisible={modalConfig.isVisible}
        onClose={closeModal}
        title={modalConfig.title}
        specialText={modalConfig.specialText}
        useButtons={modalConfig.useButtons}
        primaryButtonText={modalConfig.primaryButtonText}
        onPrimaryButtonPress={modalConfig.onPrimaryButtonPress}
        secondaryButtonText={modalConfig.secondaryButtonText}
        onSecondaryButtonPress={closeModal}
      />
    </ThemedView>
  );
};

export default Setting;
