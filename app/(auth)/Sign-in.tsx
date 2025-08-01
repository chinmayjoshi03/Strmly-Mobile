import React, { useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFonts } from "expo-font";
import { Link, router } from "expo-router";

import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { Signinstyles } from "@/styles/signin";
import { CreateProfileStyles } from "@/styles/createprofile";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";

import { useNotification } from "@/providers/NotificationProvider";


const SignIn = () => {
  const [useEmail, setUseEmail] = useState(false);
  const [nameOrEmail, setNameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const { sendTokenToBackend } = useNotification();

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/poppins/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../../assets/fonts/poppins/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/poppins/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("../../assets/fonts/poppins/Poppins-Medium.ttf"),
    "Poppins-Light": require("../../assets/fonts/poppins/Poppins-Light.ttf"),
    "Inter-Light": require("../../assets/fonts/inter/Inter-Light.ttf"),
    "Inter-SemiBold": require("../../assets/fonts/inter/Inter-SemiBold.ttf"),
  });

  const handleLogin = async () => {
    if (!nameOrEmail || !password) {
      alert("Please fill in both fields");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nameOrEmail);
    const loginType = isEmail ? "email" : "username";
    console.log("Login type:", loginType);
    console.log("API URL:", CONFIG.API_BASE_URL);

    try {
      console.log("Starting login request...");
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/v1/auth/login/${loginType}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [loginType]: nameOrEmail, // dynamic key: email or username
            password,
          }),
        }
      );
      
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      
      // Check if response is empty or not JSON
      const responseText = await res.text();
      console.log("Raw response:", responseText);
      
      if (!responseText) {
        throw new Error("Empty response from server");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      // Save in zustand and secure store
      await useAuthStore.getState().login(data.token, data.user);

      // Send FCM token to backend after successful login
      try {
        await sendTokenToBackend(data.token);
        console.log("FCM token sent to backend successfully");
      } catch (fcmError) {
        console.error("Failed to send FCM token:", fcmError);
        // Don't block login flow if FCM fails
      }

      alert("Login successful!");
      setTimeout(() => router.push("/(dashboard)/long/VideoFeed"), 300);
    } catch (error: any) {
      console.error("Login Error", error);
      alert(error.message || "Something went wrong");
    }
  };

  if (!fontsLoaded) return null;

  const renderTopbar = () => {
    return (
      <Pressable
        onPress={() => setUseEmail(false)}
        className="absolute left-10 top-20"
      >
        <Image
          source={require("../../assets/images/back.png")}
          className="size-5"
        />
      </Pressable>
    );
  };

  const renderLogo = () => (
    <Image
      source={require("../../assets/images/logo2.png")}
      className={useEmail ? "size-14" : "size-20"}
    />
  );

  const renderWelcomeText = () => (
    <Text className="text-center text-[#B0B0B0] text-sm w-72">
      Welcome back to India&apos;s first decentralized social media platform.
    </Text>
  );

  const renderTitle = () => (
    <ThemedText style={Signinstyles.Title}>
      {useEmail ? "Sign in to Strmly" : "Sign in for Strmly"}
    </ThemedText>
  );

  const renderSocialOptions = () => (
    <>
      <TouchableOpacity
        onPress={() => setUseEmail(true)}
        style={Signinstyles.button}
      >
        <View className="flex-row items-center justify-between w-full px-4">
          <Image
            source={require("../../assets/images/user.png")}
            className="size-7"
          />
          <Text className="text-white text-[16px]">Use Email</Text>
          <View></View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => alert("Google Sign-in")}
        style={Signinstyles.button}
      >
        <View className="flex-row items-center justify-between w-full px-4">
          <Image
            source={require("../../assets/images/google.png")}
            className="size-7"
          />
          <Text className="text-white text-[16px]">Continue with Google</Text>
          <View></View>
        </View>
      </TouchableOpacity>
    </>
  );

  const renderEmailForm = () => (
    <>
      <TextInput
        style={CreateProfileStyles.Input}
        placeholder="Username or Email"
        className="placeholder:text-[#B0B0B0]"
        value={nameOrEmail}
        onChangeText={setNameOrEmail}
      />
      <TextInput
        style={CreateProfileStyles.Input}
        placeholder="Password"
        className="placeholder:text-[#B0B0B0]"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={CreateProfileStyles.button}
        onPress={handleLogin}
      >
        <Text className="text-lg font-semibold">Sign in</Text>
      </TouchableOpacity>
      <ThemedText className="text-white mt-8">
        <ThemedText style={Signinstyles.Text16M}>
          Forgotten password?
        </ThemedText>
      </ThemedText>
    </>
  );

  const renderLink = () => (
    <Link
      className="mt-14"
      href={"/(auth)/Sign-up"}
      style={Signinstyles.Text16R}
    >
      Don't have an account?
      <ThemedText style={Signinstyles.Text16M}> Sign Up</ThemedText>
    </Link>
  );

  return (
    <ThemedView style={Signinstyles.Container} className="px-4">
      {useEmail && renderTopbar()}
      {renderLogo()}
      {renderTitle()}
      {renderWelcomeText()}
      {useEmail ? renderEmailForm() : renderSocialOptions()}
      {!useEmail && renderLink()}
    </ThemedView>
  );
};

export default SignIn;
