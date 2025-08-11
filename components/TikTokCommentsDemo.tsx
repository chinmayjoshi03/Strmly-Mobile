import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import TikTokCommentsSheet from '@/app/(dashboard)/long/_components/TikTokCommentsSheet';

// Sample data for demo
const sampleComments = [
  {
    _id: '1',
    content: 'This is an amazing video! Love the content 🔥',
    videoId: 'demo-video-1',
    repliesCount: 3,
    timestamp: new Date().toISOString(),
    donations: 25,
    upvotes: 142,
    downvotes: 3,
    user: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    upvoted: false,
    downvoted: false,
    replies: 3,
    is_monetized: true
  },
  {
    _id: '2',
    content: 'Great tutorial! Can you make one about advanced techniques?',
    videoId: 'demo-video-1',
    repliesCount: 1,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    donations: 10,
    upvotes: 89,
    downvotes: 1,
    user: {
      id: 'user2',
      name: 'Mike Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
    },
    upvoted: true,
    downvoted: false,
    replies: 1,
    is_monetized: false
  },
  {
    _id: '3',
    content: 'Thanks for sharing this! Very helpful 👍',
    videoId: 'demo-video-1',
    repliesCount: 0,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    donations: 5,
    upvotes: 34,
    downvotes: 0,
    user: {
      id: 'user3',
      name: 'Emma Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    upvoted: false,
    downvoted: false,
    replies: 0,
    is_monetized: false
  }
];

const TikTokCommentsDemo = () => {
  const [showComments, setShowComments] = useState(false);

  const handlePressUsername = (userId: string) => {
    Alert.alert('Navigate to Profile', `Would navigate to user profile: ${userId}`);
  };

  const handlePressTip = (commentId: string) => {
    Alert.alert('Tip Modal', `Would open tip modal for comment: ${commentId}`);
  };

  const handleReply = (commentId: string) => {
    console.log('Reply to comment:', commentId);
  };

  const handleSend = (text: string, replyToId?: string) => {
    console.log('Send comment:', text, 'Reply to:', replyToId);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 24, marginBottom: 20 }}>
        TikTok Comments Demo
      </Text>
      
      <TouchableOpacity
        onPress={() => setShowComments(true)}
        style={{
          backgroundColor: '#FF3B30',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
          Show Comments
        </Text>
      </TouchableOpacity>

      {showComments && (
        <TikTokCommentsSheet
          onClose={() => setShowComments(false)}
          videoId="demo-video-1"
          longVideosOnly={true}
          onPressUsername={handlePressUsername}
          onPressTip={handlePressTip}
        />
      )}
    </View>
  );
};

export default TikTokCommentsDemo;