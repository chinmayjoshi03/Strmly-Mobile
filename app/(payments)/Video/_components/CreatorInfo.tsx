import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { router } from "expo-router";

type CreatorData = {
  profile: string;
  name?: string;
  username: string;
};

const CreatorInfo = ({ profile, name, username }: CreatorData) => {
  return (
    <View>
      <View className="flex-row items-center gap-3 mb-4">
        <Pressable onPress={()=> router.back()}>
          <Image
            source={require("../../../../assets/images/back.png")}
            className="size-5 rounded-full"
          />
        </Pressable>
        <View className="flex-row items-center justify-center gap-2">
          <View className="rounded-full bg-gray-500">
            <Image
              source={
                profile
                  ? { uri: profile }
                  : require("../../../../assets/images/user.png")
              }
              className="size-10 rounded-full"
            />
          </View>
          <View className="items-center">
            <Text className="text-white text-lg">{name}</Text>
            <Text className="text-gray-400 text-xs">{username}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CreatorInfo;
