import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import CommentsSection from '@/app/(dashboard)/long/_components/CommentSection';

const CommentTestComponent = () => {
  const [showComments, setShowComments] = useState(false);

  const testVideoData = {
    _id: 'test_video_1',
    name: 'Test Video',
    videoUrl: 'https://example.com/video.mp4',
    likes: 42,
    comments: [],
  };

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <Text className="text-white text-xl mb-4">Comment System Test</Text>
      
      <TouchableOpacity
        onPress={() => setShowComments(true)}
        className="bg-blue-500 px-6 py-3 rounded-lg mb-4"
      >
        <Text className="text-white font-semibold">Open Comments</Text>
      </TouchableOpacity>

      <Text className="text-white/60 text-sm text-center px-4">
        This will open the comment modal with mock data.{'\n'}
        Real-time features will work when APIs are connected.
      </Text>

      <CommentsSection
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        videoId={testVideoData._id}
        longVideosOnly={true}
        commentss={[]}
      />
    </View>
  );
};

export default CommentTestComponent;