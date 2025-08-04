import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import ThemedView from "@/components/ThemedView";

export default function CreatorPassPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchCurrentPrice();
  }, []);

  const fetchCurrentPrice = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const creatorPassPrice = data.user?.creator_profile?.creator_pass_price;
        if (creatorPassPrice) {
          setCurrentPrice(creatorPassPrice);
          setPrice(creatorPassPrice.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching current price:', error);
    }
  };

  const handleSetPrice = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/user/creator-pass-price`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: Number(price)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'Success',
          'Creator pass price updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update creator pass price');
      }
    } catch (error) {
      console.error('Error updating creator pass price:', error);
      Alert.alert('Error', 'Failed to update creator pass price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="white" />
        </TouchableOpacity>
        <View className="w-6" />
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-white text-3xl font-bold text-center mb-4" style={{ fontFamily: 'Poppins' }}>
          Creator pass
        </Text>
        
        <View className="flex-row items-center mb-8">
          <Text className="text-gray-400 text-2xl" style={{ fontFamily: 'Poppins' }}>
            ₹
          </Text>
          <TextInput
            className="text-gray-400 text-4xl ml-2 border-b border-gray-600 pb-2 min-w-[120px] text-center"
            placeholder="99"
            placeholderTextColor="#666"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={{ fontFamily: 'Poppins' }}
          />
          <Text className="text-gray-400 text-2xl ml-2" style={{ fontFamily: 'Poppins' }}>
            /Month
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSetPrice}
          disabled={loading}
          className="bg-white rounded-full px-12 py-4 mb-8"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-black text-lg font-semibold" style={{ fontFamily: 'Poppins' }}>
              {currentPrice ? 'Update Creator pass' : 'Add Creator pass'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Terms and Conditions */}
        <View className="px-4">
          <Text className="text-gray-400 text-sm text-center leading-6" style={{ fontFamily: 'Poppins' }}>
            By enabling the Creator Pass, you agree to offer all your paid content to users who subscribe to your pass at the price you set. You'll earn revenue from each subscription after platform fees and taxes.
          </Text>
          
          <Text className="text-gray-400 text-sm text-center leading-6 mt-4" style={{ fontFamily: 'Poppins' }}>
            Once activated, you will not be able to delete your account until all active subscriptions have expired. You may stop new purchases by turning off the Creator Pass, but you must wait for all current subscriptions to end before account deletion is allowed. By continuing, you agree to follow and accept all our{' '}
            <Text className="text-blue-400 underline">Terms of Use</Text> and{' '}
            <Text className="text-blue-400 underline">Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </ThemedView>
  );
}