import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import React, { useState, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import { useFonts } from "expo-font";
import { CreateProfileStyles } from "@/styles/createprofile";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";

const ForgotPassword = () => {
  const [Step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  const [otp, setOtp] = useState("");

  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/poppins/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../../assets/fonts/poppins/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/poppins/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("../../assets/fonts/poppins/Poppins-Medium.ttf"),
    "Poppins-Light": require("../../assets/fonts/poppins/Poppins-Light.ttf"),
    "Inter-Light": require("../../assets/fonts/inter/Inter-Light.ttf"),
    "Inter-SemiBold": require("../../assets/fonts/inter/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../../assets/fonts/inter/Inter-Bold.ttf"),
    "Inter-ExtraBold": require("../../assets/fonts/inter/Inter-ExtraBold.ttf"),
  });

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const handleVerifyOTP = async () => {
    try {
      const res = await fetch(`${BACKEND_API_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Verification failed");
      }

      console.log("Verification successful", data);

      // Update auth store to mark email_verified
      useAuthStore.getState().updateUser({ isVerified: true });

      alert("Email verified successfully!");
      setTimeout(() => router.replace("/(dashboard)/long/VideoFeed"), 1000);
    } catch (err: any) {
      console.error("OTP Verification error:", err);
      alert(err.message || "Something went wrong");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      setIsLoading(true);

      const res = await fetch(`${BACKEND_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "RATE_LIMITED") {
          Alert.alert("Too Many Requests", data.message);
          setCooldown(60); // Start cooldown
        } else if (data.code === "ALREADY_VERIFIED") {
          Alert.alert("Already Verified", data.message);
        } else {
          Alert.alert(
            "Resend Failed",
            data.message || "Please try again later"
          );
        }
        return;
      }

      Alert.alert(
        "OTP Sent",
        "A new verification code was sent to your email."
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | number;

    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const HandleStep = (next: boolean) => {
    if (!next) {
      setStep((prev) => Math.max(prev - 1, 1));
      return;
    }

    if (Step === 1) {
      if (!email.includes("@") || email.length < 5) {
        alert("Please enter a valid email");
        return;
      }

      handleResend()
    }

    if (Step === 2 && confirmationCode.trim().length < 4) {
      alert("Invalid confirmation code");
      return;
    }

    // validation for each step
    if (Step === 3 && password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    

    setStep((prev) => prev + 1);
  };

  if (!fontsLoaded) return null;

  if (Step === 1) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full pt-20 px-4 mb-10">
          <TouchableOpacity onPress={() => router.back()} className="w-fit">
            <Image
              className="w-5 h-5"
              source={require("../../assets/images/back.png")}
            />
          </TouchableOpacity>
          <ThemedText className="text-white text-2xl text-center w-full">
            Enter your email
          </ThemedText>
        </View>

        <Text className="text-[#B0B0B0] text-[16px] px-4 text-center w-full">
            Please enter the email address you used to create your account.
        </Text>

        <TextInput
          style={CreateProfileStyles.Input}
          placeholder="Email"
          className="placeholder:text-[#B0B0B0]"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TouchableOpacity
          onPress={()=> email.length ==0 ? Alert.alert('Please enter your email') : HandleStep(true)}
          style={CreateProfileStyles.button}
        >
          <Text className="font-semibold text-lg">Continue</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (Step === 2) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full pt-20 px-4 mb-10">
          <TouchableOpacity onPress={() => HandleStep(false)}>
            <Image
              className="w-5 h-5 mt-1"
              source={require("../../assets/images/back.png")}
            />
          </TouchableOpacity>
          <ThemedText className="text-white text-2xl text-center w-full">
            Verify email
          </ThemedText>
        </View>
        <ThemedText style={CreateProfileStyles.Text}>
          Enter the confirmation code that we sent to {email}
        </ThemedText>

        <TextInput
          style={CreateProfileStyles.Input}
          className="placeholder:text-[#B0B0B0]"
          value={otp}
          onChangeText={setOtp}
          placeholder="Enter 6-digit OTP"
        />

        <TouchableOpacity
          onPress={handleVerifyOTP}
          style={CreateProfileStyles.button}
        >
          <Text className="font-semibold text-lg">Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} className="mt-2">
          <ThemedText style={CreateProfileStyles.ExtraBold}>
            Resend Code
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (Step === 3) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full pt-20 px-4 mb-10">
          <TouchableOpacity onPress={() => HandleStep(false)} className="w-fit">
            <Image
              className="w-5 h-5"
              source={require("../../assets/images/back.png")}
            />
          </TouchableOpacity>
          <ThemedText className="text-white text-2xl text-center w-full">
            Create new password
          </ThemedText>
        </View>
        
        <TextInput
          style={CreateProfileStyles.Input}
          placeholder="Password"
          className="placeholder:text-[#B0B0B0]"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() => HandleStep(true)}
          style={CreateProfileStyles.button}
        >
          <Text className="font-semibold text-lg">Create Password</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return "Internal Error, Try restarting the app.";
};

export default ForgotPassword;