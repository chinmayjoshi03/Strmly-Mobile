import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MoreHorizontal, ChevronLeft } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";

interface ProfileTopbarProps {
  hashtag: boolean;
  name: string;
  isMore?: boolean;
}

const ProfileTopbar = ({
  hashtag,
  name,
  isMore = true,
}: ProfileTopbarProps) => {
  const safeName = String(name || "");
  const router = useRouter();
  const {token, isLoggedIn} = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      if (!token || !isLoggedIn) {
        router.replace("/(auth)/Sign-up");
        return;
      }
    }, [token, isLoggedIn])
  );


  return (
    <View className="top-3 px-1 z-20">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ChevronLeft size={28} color={"white"} className="text-white" />
        </TouchableOpacity>

        <View>
          <Text
            className={`text-xl ${isMore ? "pr-3" : "pr-12"} capitalize font-semibold text-white`}
          >
            {hashtag && <Text className="text-white font-bold">#</Text>}
            <Text className="text-center">{safeName}</Text>{" "}
            {/* Wrap safeName in a Text component */}
          </Text>
        </View>

        {isMore ? (
          <View className="flex-row items-center gap-2 relative">
            <TouchableOpacity
              onPress={() => router.push("/Setting/Setting")}
              className="p-2"
            >
              <MoreHorizontal size={14} color={"white"} />
            </TouchableOpacity>
          </View>
        ) : (
          <View></View>
        )}
      </View>
    </View>
  );
};

export default ProfileTopbar;
