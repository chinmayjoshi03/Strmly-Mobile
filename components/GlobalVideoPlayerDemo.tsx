import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

// Sample video data for testing GlobalVideoPlayer with TikTok-style comments
const sampleVideoData = [
  {
    _id: 'video_1',
    name: 'Amazing Travel Vlog',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'long',
    likes: 1250,
    gifts: 89,
    shares: 234,
    comments: [
      {
        _id: 'comment_1',
        content: 'This place looks absolutely stunning! 😍',
        videoId: 'video_1',
        repliesCount: 2,
        timestamp: new Date().toISOString(),
        donations: 15,
        upvotes: 89,
        downvotes: 2,
        user: {
          id: 'user_1',
          name: 'Sarah Johnson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        },
        upvoted: false,
        downvoted: false,
        replies: 2,
        is_monetized: true
      }
    ],
    created_by: {
      _id: 'creator_1',
      username: 'travel_explorer',
      profile_photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator'
    },
    is_monetized: true,
    community: null,
    series: null,
    episode_number: null
  },
  {
    _id: 'video_2',
    name: 'Cooking Tutorial',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'long',
    likes: 892,
    gifts: 45,
    shares: 156,
    comments: [
      {
        _id: 'comment_2',
        content: 'Great recipe! Going to try this tonight 👨‍🍳',
        videoId: 'video_2',
        repliesCount: 1,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        donations: 8,
        upvotes: 67,
        downvotes: 1,
        user: {
          id: 'user_2',
          name: 'Mike Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
        },
        upvoted: true,
        downvoted: false,
        replies: 1,
        is_monetized: false
      }
    ],
    created_by: {
      _id: 'creator_2',
      username: 'chef_master',
      profile_photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef'
    },
    is_monetized: true,
    community: null,
    series: null,
    episode_number: null
  }
];

const GlobalVideoPlayerDemo = () => {
  const handleOpenGlobalPlayer = () => {
    try {
      // Navigate to GlobalVideoPlayer with sample data
      router.push({
        pathname: '/GlobalVideoPlayer',
        params: {
          data: JSON.stringify(sampleVideoData),
          id: 'demo'
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Could not open video player. Check console for details.');
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#000000', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 20 
    }}>
      <Text style={{ 
        color: '#FFFFFF', 
        fontSize: 28, 
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
      }}>
        Global Video Player Demo
      </Text>
      
      <Text style={{ 
        color: '#9E9E9E', 
        fontSize: 16, 
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 24
      }}>
        Test the TikTok-style comments in the{'\n'}
        Global Video Player with sample videos
      </Text>
      
      <TouchableOpacity
        onPress={handleOpenGlobalPlayer}
        style={{
          backgroundColor: '#FF3B30',
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <Text style={{ 
          color: '#FFFFFF', 
          fontSize: 18, 
          fontWeight: '600' 
        }}>
          Open Video Player
        </Text>
      </TouchableOpacity>

      <View style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        padding: 16, 
        borderRadius: 8,
        marginTop: 16
      }}>
        <Text style={{ 
          color: '#FFD24D', 
          fontSize: 14, 
          fontWeight: '600',
          marginBottom: 8
        }}>
          Features to Test:
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 13, lineHeight: 20 }}>
          • Swipe up/down to navigate videos{'\n'}
          • Tap comment icon to open TikTok-style sheet{'\n'}
          • Drag handle to dismiss comments{'\n'}
          • Tap usernames to see profile navigation{'\n'}
          • Tap currency icon to test tip modal{'\n'}
          • Upvote/downvote with micro animations{'\n'}
          • Reply to comments with @mentions{'\n'}
          • Expand/collapse reply threads
        </Text>
      </View>
    </View>
  );
};

export default GlobalVideoPlayerDemo;