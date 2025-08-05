import ThemedView from "@/components/ThemedView";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Animated,
  EmitterSubscription,
  KeyboardEvent,
} from "react-native";
import CreatorInfo from "./_components/CreatorInfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";

const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

type GiftingData = {
  creator: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  videoId: string;
  setIsWantToGift: (value: boolean) => void;
  setIsGifted: (value: boolean) => void;
  giftMessage: any;
};

const VideoContentGifting = ({
  creator,
  videoId,
  setIsWantToGift,
  setIsGifted,
  giftMessage,
}: GiftingData) => {
  const [amount, setAmount] = useState("");
  const [walletInfo, setWalletInfo] = useState();
  const [loading, setLoading] = useState(false);

  const keyboardHeight = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;

  const { token, isLoggedIn } = useAuthStore();

  const handleAmountChange = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, "");
    setAmount(filtered);
  };

  // ------------ Transaction -------------------

  const giftVideo = async () => {
    if (!token && !videoId) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/interaction/gift-video`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoId: videoId, amount, }),
        }
      );
      
      if (!response.ok) throw new Error("Failed to provide gifting");
      const data = await response.json();
      console.log("dWallet data---------------", data);
      giftMessage(data.gift);
      setIsWantToGift(false);
      setIsGifted(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleProceed = async () => {
    setLoading(true);
    await giftVideo();
    setLoading(false);
    Keyboard.dismiss();
  };

  useEffect(() => {
    const keyboardShow = (e: KeyboardEvent) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const keyboardHide = () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const showSub: EmitterSubscription =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", keyboardShow)
        : Keyboard.addListener("keyboardDidShow", keyboardShow);
    const hideSub: EmitterSubscription =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", keyboardHide)
        : Keyboard.addListener("keyboardDidHide", keyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ------ Wallet Status API --------

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${BACKEND_API_URL}/wallet/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch wallet info");
        const data = await response.json();
        console.log("dWallet data---------------", data.wallet);
        setWalletInfo(data.wallet);
        // (data.isLiked);
      } catch (err) {
        console.log(err);
      }
    };

    if (token) {
      fetchWalletInfo();
    }
  }, [token]);

  return (
    <ThemedView className="flex-1 bg-black">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between px-5 py-6">
            {/* Top section */}
            <View className="mt-10">
              <CreatorInfo
                setIsWantToGift={setIsWantToGift}
                profile={creator?.profile_photo}
                // name={creator?.name}
                username={creator?.username}
              />
            </View>

            {/* Middle section */}
            <View className="gap-2 flex-row items-center justify-center">
              <Text className="text-2xl text-white">₹</Text>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                returnKeyType={Platform.OS === "ios" ? "done" : "none"}
                placeholder="0"
                className="text-3xl text-white placeholder:text-white font-semibold items-center justify-center"
              />
            </View>

            <View></View>
            {/* Animated Bottom section */}
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: Animated.add(new Animated.Value(5), animatedBottom),
                paddingBottom: insets.bottom,
              }}
              className="gap-2 justify-end"
            >
              <Pressable disabled={loading || !amount} onPress={handleProceed}>
                <View className="bg-[#008A3C] p-4 rounded-lg items-center justify-center">
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                    >
                      Proceed
                    </Text>
                  )}
                </View>
              </Pressable>

              <View className="items-center justify-center mt-1">
                <Text className="text-white text-sm">
                  Total balance ₹ {walletInfo?.balance}
                </Text>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default VideoContentGifting;
