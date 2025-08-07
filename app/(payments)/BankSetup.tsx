import ThemedView from "@/components/ThemedView";
import React, { useState } from "react";
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
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";

const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

const BankSetup = () => {
  const [formData, setFormData] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    bankName: "",
    accountType: "savings",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const cleanedAccountNumber = formData.accountNumber.replace(/\s/g, '');
    if (!cleanedAccountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{9,18}$/.test(cleanedAccountNumber)) {
      newErrors.accountNumber = "Account number must be 9-18 digits";
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = "Invalid IFSC code format";
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    } else if (formData.accountHolderName.length < 2) {
      newErrors.accountHolderName = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.accountHolderName)) {
      newErrors.accountHolderName = "Name can only contain letters and spaces";
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('🏦 Setting up bank account:', formData);
      console.log('🔗 API URL:', `${BACKEND_API_URL}/withdrawal/setup-bank`);
      console.log('🔑 Token:', token?.substring(0, 20) + '...');

      const requestBody = {
        account_number: String(formData.accountNumber).trim(),
        ifsc_code: String(formData.ifscCode).toUpperCase().trim(),
        beneficiary_name: String(formData.accountHolderName).trim(),
        bank_name: String(formData.bankName).trim(),
        account_type: formData.accountType,
      };
      console.log('📤 Request body:', requestBody);
      console.log('📤 Account number type:', typeof requestBody.account_number);

      const response = await fetch(
        `${BACKEND_API_URL}/withdrawal/setup-bank`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      console.log('✅ Bank setup response:', data);

      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          data.message || "Bank account setup successfully!",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // Handle specific error codes
        if (data.code === 'VALIDATION_ERROR') {
          throw new Error(data.error);
        } else if (data.code === 'RAZORPAY_FUND_ACCOUNT_ERROR') {
          throw new Error('Bank account verification failed. Please check:\n• IFSC code is correct and valid\n• Account number matches your bank account\n• Bank name is correct\n\nTry using a valid IFSC code (e.g., SBIN0000001 for SBI)');
        } else if (data.code === 'BANK_ACCOUNT_EXISTS') {
          throw new Error('Bank account is already set up. Contact support to update your bank details.');
        }
        throw new Error(data.error || `Server error: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Bank setup error:', err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to setup bank account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView className="flex-1 bg-black">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1 px-5 py-6">
            {/* Header */}
            <View className="mt-10 mb-8">
              <View className="flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="p-2">
                  <ChevronLeft size={28} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-semibold">
                  Setup Bank Account
                </Text>
                <View className="w-8" />
              </View>
            </View>

            {/* Form */}
            <View className="gap-6">
              {/* Account Number */}
              <View>
                <Text className="text-white text-base font-medium mb-2">
                  Account Number
                </Text>
                <TextInput
                  value={formData.accountNumber}
                  onChangeText={(text) => handleInputChange("accountNumber", text.replace(/[^0-9]/g, "").toString())}
                  keyboardType="number-pad"
                  placeholder="Enter account number"
                  placeholderTextColor="#666"
                  className="bg-gray-800 text-white p-4 rounded-lg text-base"
                  maxLength={18}
                />
                {errors.accountNumber && (
                  <Text className="text-red-400 text-sm mt-1">{errors.accountNumber}</Text>
                )}
              </View>

              {/* IFSC Code */}
              <View>
                <Text className="text-white text-base font-medium mb-2">
                  IFSC Code
                </Text>
                <TextInput
                  value={formData.ifscCode}
                  onChangeText={(text) => handleInputChange("ifscCode", text.toUpperCase())}
                  placeholder="Enter IFSC code (e.g., SBIN0000001)"
                  placeholderTextColor="#666"
                  className="bg-gray-800 text-white p-4 rounded-lg text-base"
                  maxLength={11}
                  autoCapitalize="characters"
                />
                {errors.ifscCode && (
                  <Text className="text-red-400 text-sm mt-1">{errors.ifscCode}</Text>
                )}
                <Text className="text-gray-400 text-xs mt-1">
                  Find your IFSC code on your bank passbook or cheque
                </Text>
              </View>

              {/* Account Holder Name */}
              <View>
                <Text className="text-white text-base font-medium mb-2">
                  Account Holder Name
                </Text>
                <TextInput
                  value={formData.accountHolderName}
                  onChangeText={(text) => handleInputChange("accountHolderName", text)}
                  placeholder="Enter account holder name"
                  placeholderTextColor="#666"
                  className="bg-gray-800 text-white p-4 rounded-lg text-base"
                  autoCapitalize="words"
                />
                {errors.accountHolderName && (
                  <Text className="text-red-400 text-sm mt-1">{errors.accountHolderName}</Text>
                )}
              </View>

              {/* Bank Name */}
              <View>
                <Text className="text-white text-base font-medium mb-2">
                  Bank Name
                </Text>
                <TextInput
                  value={formData.bankName}
                  onChangeText={(text) => handleInputChange("bankName", text)}
                  placeholder="Enter full bank name (e.g., State Bank of India)"
                  placeholderTextColor="#666"
                  className="bg-gray-800 text-white p-4 rounded-lg text-base"
                  autoCapitalize="words"
                />
                {errors.bankName && (
                  <Text className="text-red-400 text-sm mt-1">{errors.bankName}</Text>
                )}
              </View>

              {/* Account Type */}
              <View>
                <Text className="text-white text-base font-medium mb-2">
                  Account Type
                </Text>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => handleInputChange("accountType", "savings")}
                    className={`flex-1 p-4 rounded-lg border ${formData.accountType === "savings"
                      ? 'bg-green-600 border-green-500'
                      : 'bg-gray-800 border-gray-600'
                      }`}
                  >
                    <Text className="text-white text-center font-medium">Savings</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleInputChange("accountType", "current")}
                    className={`flex-1 p-4 rounded-lg border ${formData.accountType === "current"
                      ? 'bg-green-600 border-green-500'
                      : 'bg-gray-800 border-gray-600'
                      }`}
                  >
                    <Text className="text-white text-center font-medium">Current</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <View className="mt-8 mb-8" style={{ paddingBottom: insets.bottom }}>
              <Pressable
                disabled={loading}
                onPress={handleSubmit}
                className={`p-4 rounded-lg items-center justify-center ${loading ? 'bg-gray-600' : 'bg-[#008A3C]'
                  }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Setup Bank Account
                  </Text>
                )}
              </Pressable>

              <View className="items-center justify-center mt-4">
                <Text className="text-gray-400 text-xs text-center">
                  Your bank details are encrypted and secure.{'\n'}
                  This information is required for withdrawal processing.
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default BankSetup;