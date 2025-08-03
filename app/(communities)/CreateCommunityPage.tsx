import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { CommunitiesStyles } from "@/styles/Community";
import { CreateCommunityStyle } from "@/styles/CreateCommunity";
import { useFonts } from "expo-font";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";

const CreateCommunityPage: React.FC = () => {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/poppins/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../../assets/fonts/poppins/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/poppins/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("../../assets/fonts/poppins/Poppins-Medium.ttf"),
    "Poppins-Light": require("../../assets/fonts/poppins/Poppins-Light.ttf"),
    "Inter-Light": require("../../assets/fonts/inter/Inter-Light.ttf"),
    "Inter-Regular": require("../../assets/fonts/inter/Inter-Regular.ttf"),
    "Inter-SemiBold": require("../../assets/fonts/inter/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../../assets/fonts/inter/Inter-Bold.ttf"),
    "Inter-ExtraBold": require("../../assets/fonts/inter/Inter-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../../assets/fonts/poppins/Poppins-ExtraLight.ttf"),
  });

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [bio, setBio] = useState("");
  const [strength, setStrength] = useState("");
  const [fee, setFee] = useState("");

  const [imageUri, setImageUri] = useState<string | null>(null);

  const options = ["Free", "Paid"];

  const handleSelect = (value: string) => {
    setSelected(value);
    setVisible(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!communityName || !bio || !selected) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", communityName);
    formData.append("bio", bio);
    formData.append("accessType", selected);

    if (selected === "Paid") {
      formData.append("strength", strength);
      formData.append("fee", fee);
    }

    if (imageUri) {
      const fileName = imageUri.split("/").pop()!;
      const fileType = fileName.split(".").pop();
      formData.append("image", {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
    }
    
    try {
      const res = await fetch(`${BACKEND_API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Community created!");
      } else {
        Alert.alert("Failed", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  return (
    <ThemedView style={CreateCommunityStyle.container}>
      <View style={CreateCommunityStyle.CreateCommunityTopBar}>
        <TouchableOpacity style={CreateCommunityStyle.BackIcon}>
          <Image
            className="size-5"
            source={require("../../assets/images/back.png")}
          />
        </TouchableOpacity>
        <ThemedText style={CommunitiesStyles.Tab}>Create Community</ThemedText>
        <TouchableOpacity onPress={handleCreate}>
          <ThemedText style={CommunitiesStyles.RightTab}>Create</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Image picker */}
      <TouchableOpacity className="items-center w-fit" onPress={pickImage}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require("../../assets/images/user.png")
          }
          style={CreateCommunityStyle.CommunityAvatar}
        />
        <ThemedText style={CommunitiesStyles.RightTab}>
          Add community picture
        </ThemedText>
      </TouchableOpacity>

      {/* Community Fields */}
      <View style={CreateCommunityStyle.InfoContainer}>
        <View style={CreateCommunityStyle.InfoFrame}>
          <ThemedText style={CreateCommunityStyle.InfoLabel}>
            Community name
          </ThemedText>
          <TextInput
            placeholder="Add name"
            placeholderTextColor="#B0B0B0"
            style={CreateCommunityStyle.TextLabel}
            value={communityName}
            onChangeText={setCommunityName}
          />
        </View>
        <View style={CreateCommunityStyle.InfoFrame}>
          <ThemedText style={CreateCommunityStyle.InfoLabel}>Bio</ThemedText>
          <TextInput
            placeholder="Add bio"
            placeholderTextColor="#B0B0B0"
            style={CreateCommunityStyle.TextLabel}
            value={bio}
            onChangeText={setBio}
          />
        </View>
        <View style={CreateCommunityStyle.InfoFrame}>
          <ThemedText style={CreateCommunityStyle.InfoLabel}>Access</ThemedText>
          <TouchableOpacity
            onPress={() => setVisible(true)}
            style={CreateCommunityStyle.dropdownTrigger}
          >
            <ThemedText
              style={[
                CreateCommunityStyle.dropdownText,
                { color: selected ? "#fff" : "#888" },
              ]}
            >
              {selected || "Select"}
            </ThemedText>
            <ThemedText style={CreateCommunityStyle.arrow}>▼</ThemedText>
          </TouchableOpacity>

          <Modal transparent animationType="fade" visible={visible}>
            <TouchableOpacity
              style={CreateCommunityStyle.overlay}
              onPress={() => setVisible(false)}
            >
              <View style={CreateCommunityStyle.dropdownBox}>
                {options.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={CreateCommunityStyle.dropdownItem}
                    onPress={() => handleSelect(item)}
                  >
                    <ThemedText style={CreateCommunityStyle.dropdownItemText}>
                      {item}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {selected === "Paid" && (
          <View style={CreateCommunityStyle.InfoFrame}>
            <View>
              <ThemedText style={CreateCommunityStyle.InfoLabel}>
                Creator Strength
              </ThemedText>
              <TextInput
                placeholder="500"
                placeholderTextColor="#B0B0B0"
                style={CreateCommunityStyle.TextLabel}
                value={strength}
                onChangeText={setStrength}
                keyboardType="numeric"
              />
            </View>
            <View>
              <ThemedText style={CreateCommunityStyle.InfoLabel}>
                Community fee
              </ThemedText>
              <TextInput
                placeholder="₹29/m"
                placeholderTextColor="#B0B0B0"
                style={CreateCommunityStyle.TextLabel}
                value={fee}
                onChangeText={setFee}
              />
            </View>
          </View>
        )}
      </View>

      <ThemedView style={CreateCommunityStyle.container}>
        <ThemedText style={CreateCommunityStyle.ExtraInfo}>
          You can create either a free or paid community. In a free
        </ThemedText>
        <ThemedText style={CreateCommunityStyle.ExtraInfo}>
          community, anyone can join, follow, and post content.
        </ThemedText>
        <ThemedText style={CreateCommunityStyle.ExtraInfo}>
          In a paid community, users can join and watch videos for free,
        </ThemedText>
        <ThemedText style={CreateCommunityStyle.ExtraInfo}>
          but only creators who pay can post content.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

export default CreateCommunityPage;
