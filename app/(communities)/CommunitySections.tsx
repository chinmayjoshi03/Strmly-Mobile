import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, PaperclipIcon, CameraIcon, SearchIcon, UserIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import ThemedView from "@/components/ThemedView";
import { communityActions } from "@/api/community/communityActions";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";

interface User {
  _id: string;
  username: string;
  profile_photo: string;
}

interface Video {
  _id: string;
  name: string;
  videoUrl: string;
  thumbnailUrl?: string;
  views: number;
  likes: number;
  created_by: {
    username: string;
    profile_photo: string;
  };
}

type SectionType = 'followers' | 'creators' | 'videos';

export default function CommunitySections() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [activeSection, setActiveSection] = useState<SectionType>((params.section as SectionType) || 'followers');
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    followers: 0,
    creators: 0,
    videos: 0,
  });

  const communityId = params.communityId as string;
  const communityName = params.communityName as string;

  // Generate thumbnails for videos
  const thumbnails = useThumbnailsGenerate(
    data
      .filter(item => activeSection === 'videos')
      .map((video: Video) => ({
        id: video._id,
        url: video.videoUrl,
      }))
  );

  useEffect(() => {
    if (communityId && token) {
      fetchData();
    }
  }, [activeSection, communityId, token]);

  const fetchData = async () => {
    if (!token) {
      console.error('❌ No token available');
      return;
    }

    setLoading(true);
    try {
      let result: any;

      switch (activeSection) {
        case 'followers':
          result = await communityActions.getCommunityFollowers(token, communityId);
          setData(result.followers || []);
          setCounts(prev => ({ ...prev, followers: result.followers?.length || 0 }));
          break;

        case 'creators':
          result = await communityActions.getCommunityCreators(token, communityId);
          setData(result.creators || []);
          setCounts(prev => ({ ...prev, creators: result.creators?.length || 0 }));
          break;

        case 'videos':
          result = await communityActions.getCommunityVideos(token, communityId);
          setData(result.videos || []);
          setCounts(prev => ({ ...prev, videos: result.videos?.length || 0 }));
          break;
      }

      console.log(`✅ Fetched ${activeSection} data:`, result);

    } catch (error) {
      console.error(`❌ Error fetching ${activeSection} data:`, error);
      Alert.alert('Error', `Failed to fetch ${activeSection}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
    if (activeSection === 'videos') {
      return item.name?.toLowerCase().includes(searchTerm);
    } else {
      return item.username?.toLowerCase().includes(searchTerm);
    }
  });

  const renderUserItem = (user: User) => (
    <View key={user._id} className="flex-row items-center justify-between py-4 px-4">
      <View className="flex-row items-center flex-1">
        <Image
          source={{
            uri: user.profile_photo || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + user.username
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-white font-semibold text-base" style={{ fontFamily: 'Poppins' }}>
            {user.username}
          </Text>
          <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins' }}>
            @{user.username}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderVideoItem = (video: Video) => (
    <View key={video._id} className="w-[32%] mb-4">
      <TouchableOpacity className="aspect-[9/16] rounded-lg overflow-hidden bg-gray-800">
        {thumbnails[video._id] ? (
          <Image
            source={{ uri: thumbnails[video._id] }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Poppins' }}>
              Loading...
            </Text>
          </View>
        )}

        {/* Video overlay info */}
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
          <Text className="text-white text-xs font-semibold" numberOfLines={2} style={{ fontFamily: 'Poppins' }}>
            {video.name}
          </Text>
          <Text className="text-gray-300 text-xs" style={{ fontFamily: 'Poppins' }}>
            {video.views || 0} views
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'followers':
        return `${counts.followers} Followers`;
      case 'creators':
        return `${counts.creators} Creators`;
      case 'videos':
        return `${counts.videos} Videos`;
      default:
        return 'Community';
    }
  };

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'Poppins' }}>
          #{communityName}
        </Text>
        <View className="w-6" />
      </View>

      {/* Equal Spaced Tabs */}
      <View className="flex-row justify-around py-3 px-4">
        <TouchableOpacity
          className={`flex-1 py-2 items-center ${activeSection === "followers" ? "border-b-2 border-white" : ""
            }`}
          onPress={() => setActiveSection("followers")}
        >
          <Text
            className={`${activeSection === "followers" ? "text-white font-semibold" : "text-gray-400"} text-lg`}
            style={{ fontFamily: 'Poppins' }}
          >
            {counts.followers} Followers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 items-center ${activeSection === "creators" ? "border-b-2 border-white" : ""
            }`}
          onPress={() => setActiveSection("creators")}
        >
          <Text
            className={`${activeSection === "creators" ? "text-white font-semibold" : "text-gray-400"} text-lg`}
            style={{ fontFamily: 'Poppins' }}
          >
            {counts.creators} Creators
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 items-center ${activeSection === "videos" ? "border-b-2 border-white" : ""
            }`}
          onPress={() => setActiveSection("videos")}
        >
          <Text
            className={`${activeSection === "videos" ? "text-white font-semibold" : "text-gray-400"} text-lg`}
            style={{ fontFamily: 'Poppins' }}
          >
            {counts.videos} Videos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-2">
        <View className="bg-black border border-gray-600 rounded-lg px-3 py-2">
          <TextInput
            className="text-white text-sm"
            placeholder="Search..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ fontFamily: 'Poppins' }}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" style={{ marginBottom: 80 }}>
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#F1C40F" />
            <Text className="text-gray-400 mt-2" style={{ fontFamily: 'Poppins' }}>
              Loading {getSectionTitle()}...
            </Text>
          </View>
        ) : filteredData.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-center" style={{ fontFamily: 'Poppins' }}>
              {searchQuery ? "No results found" : `No ${activeSection} yet`}
            </Text>
          </View>
        ) : (
          <View className={activeSection === 'videos' ? "flex-row flex-wrap justify-between px-4" : ""}>
            {filteredData.map((item) => {
              if (activeSection === 'videos') {
                return renderVideoItem(item as Video);
              } else {
                return renderUserItem(item as User);
              }
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-black border-t border-gray-800">
        <View
          className="flex-row justify-around items-center py-2"
          style={{ paddingBottom: insets.bottom + 10 }}
        >
          <TouchableOpacity className="p-3">
            <PaperclipIcon size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="p-3">
            <CameraIcon size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="p-3">
            <SearchIcon size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="p-3">
            <UserIcon size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}