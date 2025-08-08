import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { ChevronLeft } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useTransactionHistory } from "./useTransactionHistory";

const RevenueHistory = ({ closeTBalance }: { closeTBalance: any }) => {
  const { token } = useAuthStore();
  const { transactions, isLoading, error, fetchTransactionHistory } = useTransactionHistory(token || "");

  useEffect(() => {
    if (token) {
      fetchTransactionHistory();
    }
  }, [token]);

  // Filter transactions to show only revenue-related ones (credits)
  const revenueTransactions = transactions.filter(transaction => 
    transaction.type === 'credit' && 
    (transaction.description.toLowerCase().includes('revenue') ||
     transaction.description.toLowerCase().includes('earning') ||
     transaction.description.toLowerCase().includes('view') ||
     transaction.description.toLowerCase().includes('engagement') ||
     transaction.description.toLowerCase().includes('gift') ||
     transaction.description.toLowerCase().includes('creator'))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <View className="absolute -top-2 gap-5 w-full">
      <View className="w-full flex-row items-center justify-between">
        <TouchableOpacity onPress={() => closeTBalance(false)} className="p-2">
          <ChevronLeft size={28} color={"white"} className="text-white" />
        </TouchableOpacity>

        <View>
          <Text className={`text-lg capitalize font-semibold text-white`}>
            Revenue History
          </Text>
        </View>

        <View></View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-2">Loading revenue...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-400 text-center">{error}</Text>
          <TouchableOpacity 
            onPress={() => fetchTransactionHistory()}
            className="mt-4 bg-blue-600 px-4 py-2 rounded"
          >
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : revenueTransactions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-center">No revenue transactions found</Text>
        </View>
      ) : (
        <FlatList
          data={revenueTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center my-2">
              <View className="flex-row items-center gap-3 flex-1">
                {/* Icon */}
                <Image
                  source={require("../../../../assets/images/rupee.png")}
                  className="w-12 h-12 rounded-full bg-gray-500"
                />

                {/* Transaction Info */}
                <View className="justify-center items-start">
                  <Text className="text-sm text-white">{item.description}</Text>
                  <Text className="text-xs text-gray-500">{formatDate(item.date)}</Text>
                  {item.status && (
                    <Text className="text-xs text-gray-400">Status: {item.status}</Text>
                  )}
                </View>
              </View>

              {/* Amount */}
              <Text className="text-green-500 text-[16px]">
                +₹{item.amount}
              </Text>
            </View>
          )}
          refreshing={isLoading}
          onRefresh={() => fetchTransactionHistory()}
        />
      )}
    </View>
  );
};

export default RevenueHistory;