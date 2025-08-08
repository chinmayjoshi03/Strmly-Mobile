import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { EditProfile } from "@/styles/EditProfile";
import { useFonts } from "expo-font";
import { useState } from "react";
import { Image, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { updateSocialMediaLinks } from "@/api/user/userActions";

const SocialMediaLinks: React.FC = () => {
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

  // Auth store
  const { token, user } = useAuthStore();

  // Form states
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    snapchat: "",
    youtube: "",
  });

  // Loading states
  const [saving, setSaving] = useState(false);

  // No need to load existing links since GET endpoint doesn't exist

  const handleInputChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const validateUrl = (url: string, platform: string) => {
    if (!url) return true; // Empty URLs are allowed
    return true; // Accept any non-empty string as valid URL
  };

  const handleSave = async () => {
    if (!token) {
      Alert.alert('Error', 'No authentication token found');
      return;
    }

    // No validation needed since we accept any non-empty string

    try {
      setSaving(true);

      await updateSocialMediaLinks(token, socialLinks);
      
      Alert.alert('Success', 'Social media links updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating social media links:', error);
      Alert.alert('Error', 'Failed to update social media links. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Remove loading screen since we don't need to fetch data

  return (
    <ThemedView style={EditProfile.container}>
      {/* Top Bar */}
      <View style={EditProfile.CreateCommunityTopBar}>
        <TouchableOpacity onPress={() => router.back()} style={EditProfile.BackIcon}>
          <Image
            className="size-5"
            source={require("../../assets/images/back.png")}
          />
        </TouchableOpacity>
        <ThemedText style={EditProfile.TopBarTitle}>Social Media Links</ThemedText>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <ThemedText style={EditProfile.SaveText}>Save</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {/* Social Media Links Inputs */}
      <View style={EditProfile.InfoContainer}>
        {/* Facebook */}
        <View style={EditProfile.InfoFrame}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ 
              width: 20, 
              height: 20, 
              borderRadius: 10, 
              backgroundColor: '#1877F2', 
              marginRight: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>f</ThemedText>
            </View>
            <ThemedText style={EditProfile.InfoLabel}>Facebook</ThemedText>
          </View>
          <TextInput
            placeholder="Enter your Facebook profile URL"
            placeholderTextColor="#B0B0B0"
            style={EditProfile.TextLabel}
            value={socialLinks.facebook}
            onChangeText={(text) => handleInputChange("facebook", text)}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Twitter */}
        <View style={EditProfile.InfoFrame}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ 
              width: 20, 
              height: 20, 
              borderRadius: 10, 
              backgroundColor: '#1DA1F2', 
              marginRight: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>𝕏</ThemedText>
            </View>
            <ThemedText style={EditProfile.InfoLabel}>Twitter / X</ThemedText>
          </View>
          <TextInput
            placeholder="Enter your Twitter/X profile URL"
            placeholderTextColor="#B0B0B0"
            style={EditProfile.TextLabel}
            value={socialLinks.twitter}
            onChangeText={(text) => handleInputChange("twitter", text)}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Instagram */}
        <View style={EditProfile.InfoFrame}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ 
              width: 20, 
              height: 20, 
              borderRadius: 10, 
              backgroundColor: '#E4405F', 
              marginRight: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>📷</ThemedText>
            </View>
            <ThemedText style={EditProfile.InfoLabel}>Instagram</ThemedText>
          </View>
          <TextInput
            placeholder="Enter your Instagram profile URL"
            placeholderTextColor="#B0B0B0"
            style={EditProfile.TextLabel}
            value={socialLinks.instagram}
            onChangeText={(text) => handleInputChange("instagram", text)}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Snapchat */}
        <View style={EditProfile.InfoFrame}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ 
              width: 20, 
              height: 20, 
              borderRadius: 10, 
              backgroundColor: '#FFFC00', 
              marginRight: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <ThemedText style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>👻</ThemedText>
            </View>
            <ThemedText style={EditProfile.InfoLabel}>Snapchat</ThemedText>
          </View>
          <TextInput
            placeholder="Enter your Snapchat profile URL"
            placeholderTextColor="#B0B0B0"
            style={EditProfile.TextLabel}
            value={socialLinks.snapchat}
            onChangeText={(text) => handleInputChange("snapchat", text)}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* YouTube */}
        <View style={EditProfile.InfoFrame}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ 
              width: 20, 
              height: 20, 
              borderRadius: 10, 
              backgroundColor: '#FF0000', 
              marginRight: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>▶</ThemedText>
            </View>
            <ThemedText style={EditProfile.InfoLabel}>YouTube</ThemedText>
          </View>
          <TextInput
            placeholder="Enter your YouTube channel URL"
            placeholderTextColor="#B0B0B0"
            style={EditProfile.TextLabel}
            value={socialLinks.youtube}
            onChangeText={(text) => handleInputChange("youtube", text)}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Info Text */}
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <ThemedText style={EditProfile.ExtraInfo}>
            Add your social media links to help your fans connect with you across different platforms. 
            Leave fields empty if you don't have an account on that platform.
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
};

export default SocialMediaLinks;