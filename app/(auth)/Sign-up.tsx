import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import React, { useState } from "react";
import { useFonts } from "expo-font";
import { Signinstyles } from "@/styles/signin";
import { Image, Text, TextInput, TouchableOpacity } from "react-native";
import { CreateProfileStyles } from "@/styles/createprofile";
import { Link, router } from "expo-router";

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
          onPress={() => router.push('/CreateProfile/CreateProfile')}
          style={Signinstyles.button}
        >
          <Text className="text-white">use email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => alert("Google Sign-in")}
          style={Signinstyles.button}
        >
          <Text className="text-white">Continue with Google</Text>
        </TouchableOpacity>
        <ThemedText style={Signinstyles.Text}>
          By continuing, you agree to Strmly&apos;s Terms of Use.
        </ThemedText>

        <Link href={'/(auth)/Sign-in'} className="mt-14" style={Signinstyles.Text16R}>
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