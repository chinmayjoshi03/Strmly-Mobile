import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Signinstyles } from "@/styles/signin";
import {
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CreateProfileStyles } from "@/styles/createprofile";
import { Link, router } from "expo-router";
import { Alert } from "react-native";
import { useGoogleAuth, BACKEND_API_URL, getGoogleClientId } from "@/utils/authConfig";
import axios from "axios";


const SignUp = () => {
  const [useEmail, setUseEmail] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/poppins/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../../assets/fonts/poppins/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/poppins/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("../../assets/fonts/poppins/Poppins-Medium.ttf"),
    "Poppins-Light": require("../../assets/fonts/poppins/Poppins-Light.ttf"),
    "Inter-Light": require("../../assets/fonts/inter/Inter-Light.ttf"),
    "Inter-SemiBold": require("../../assets/fonts/inter/Inter-SemiBold.ttf"),
  });

  const { promptAsync, response } = useGoogleAuth();

  const registerWithGoogle = async () => {
    try {
      const clientId = getGoogleClientId();
      const result = await promptAsync();
      console.log(clientId, result);

      if (result.type === "success") {
        const id_token = result.authentication?.idToken;

        const res = await axios.post(
          `${BACKEND_API_URL}/auth/register/google`,
          {
            credential: id_token,
            clientId,
            select_by: "user",
          }
        );

        console.log("User registered:", res.data);
        // Store token, navigate, etc.

        const data = res.data;

        if (res.status !== 201) {
          return Alert.alert("Error", data.message || "Google signup failed");
        }

        console.log("Signed in:", data);

        router.push("/Profile/CreateProfile"); // Navigate after signup
      } else if (result.type === "dismiss") {
        console.log("User dismissed Google login");
      } else {
        console.log("Unexpected result:", result);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong during signup.");
    }
  };

  if (!fontsLoaded) return null;

  if (!useEmail) {
    return (
      <ThemedView style={Signinstyles.Container} className="px-4">
        <Image
          source={require("../../assets/images/logo2.png")}
          className="size-20 text-white"
        ></Image>
        <ThemedText style={Signinstyles.Title}> Sign up for Strmly </ThemedText>
        <Text className="text-center text-[#B0B0B0] text-sm justify-center w-60">
          Create a profile in India&apos;s first decrentralized social media
          platform.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/Profile/CreateProfile")}
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
          onPress={registerWithGoogle}
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
        <ThemedText style={Signinstyles.Text}>
          By continuing, you agree to Strmly&apos;s Terms of Use.
        </ThemedText>

        <Link
          href={"/(auth)/Sign-in"}
          className="mt-14"
          style={Signinstyles.Text16R}
        >
          Already have an account?
          <ThemedText style={Signinstyles.Text16M}> Sign in</ThemedText>
        </Link>
      </ThemedView>
    );
  } else {
    return (
      <ThemedView style={Signinstyles.Container} className="px-4">
        <Image
          source={require("../../assets/images/logo2.png")}
          className="size-14"
        ></Image>
        <ThemedText style={Signinstyles.Title}> Sign in to Strmly </ThemedText>

        <ThemedText style={Signinstyles.Text}>
          Welcome back to India&apos;s first decentralized social media
          platform.
        </ThemedText>
        <TextInput
          style={CreateProfileStyles.Input}
          placeholder="username"
          className="placeholder:text-[#B0B0B0]"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={CreateProfileStyles.Input}
          placeholder="Password"
          className="placeholder:text-[#B0B0B0]"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={CreateProfileStyles.button}>
          <Text>Sign in</Text>
        </TouchableOpacity>
        <ThemedText style={Signinstyles.Text16R}>
          <ThemedText style={Signinstyles.Text16M}>
            Forgotten password?
          </ThemedText>
        </ThemedText>
      </ThemedView>
    );
  }
};

export default SignUp;
