import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MoreHorizontal, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

interface ProfileTopbarProps {
  hashtag: boolean;
  name: string;
  isMore?: boolean;
}

const ProfileTopbar = ({ hashtag, name, isMore=true }: ProfileTopbarProps) => {
  const safeName = String(name || "");
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/logout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed on server side.");
      }

      logout();
      Alert.alert("Success", "Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to logout. Please try again."
      );
    } finally {
      setShowDropdown(false);
    }
  };

  return (
    <View className="top-6 z-20">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ChevronLeft size={28} color={"white"} className="text-white" />
        </TouchableOpacity>

        <View>
          <Text className={`text-xl ${isMore ? 'pr-3' : 'pr-16'} capitalize font-semibold text-white`}>
            {hashtag && <Text className="text-white font-bold">#</Text>}
            <Text>{safeName}</Text> {/* Wrap safeName in a Text component */}
          </Text>
        </View>

        {isMore ? (
          <View className="flex-row items-center gap-2 relative">
            <TouchableOpacity
              onPress={()=> router.push('/Setting/Setting')}
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
