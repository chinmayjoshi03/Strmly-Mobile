import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { ChevronLeft } from "lucide-react-native";
import { useTransactionHistory } from "./useTransactionHistory";
import { useAuthStore } from "@/store/useAuthStore";

const TotalWalletHistory = ({closeTBalance}: any) => {
  const { token } = useAuthStore();
  const { gifts, isLoading, error, fetchGiftHistory } = useTransactionHistory(token || "");

  useEffect(() => {
    if (token) {
      fetchGiftHistory();
    }
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  return (
    <View className="">
      <View className="w-full -top-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => closeTBalance(false)} className="p-2">
          <ChevronLeft size={28} color={"white"} className="text-white" />
        </TouchableOpacity>

        <View>
          <Text className={`text-lg capitalize font-semibold text-white`}>
            Gift History
          </Text>
        </View>

        <View></View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-2">Loading gifts...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-400 text-center">{error}</Text>
          <TouchableOpacity 
            onPress={() => fetchGiftHistory()}
            className="mt-4 bg-blue-600 px-4 py-2 rounded"
          >
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : gifts.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-center">No gifts found</Text>
        </View>
      ) : (
        <FlatList
          data={gifts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center my-2">
              <View className="flex-row items-center gap-3 flex-1">
                {/* Profile Picture */}
                <Image
                  source={
                    item.type === 'received' 
                      ? { uri: item.from.profile_photo || 'https://via.placeholder.com/48' }
                      : { uri: item.to.profile_photo || 'https://via.placeholder.com/48' }
                  }
                  className="w-12 h-12 rounded-full bg-gray-500"
                />

                {/* User Info */}
                <View className="justify-center items-start">
                  <Text className="font-medium text-white">
                    {item.type === 'received' ? `From ${item.from.username}` : `To ${item.to.username}`}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {item.video ? `Gift on video: ${item.video.title}` : 
                     item.comment ? 'Gift on comment' : 'Gift'} • {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <Text
                className={`${item.type === "sent" ? "text-red-500" : "text-green-500"} font-semibold`}
              >
                {item.type === "sent" ? "-" : "+"} ₹{item.amount}
              </Text>
            </View>
          )}
          refreshing={isLoading}
          onRefresh={() => fetchGiftHistory()}
        />
      )}
    </View>
  );
};

export default TotalWalletHistory;
