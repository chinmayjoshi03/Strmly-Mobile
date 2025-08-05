import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Send, Heart, MessageCircle } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { commentActions } from "@/api/comments/commentActions";
import { Comment } from "@/types/Comments";

interface CommentsSectionProps {
  onClose: () => void;
  videoId: string | null;
  longVideosOnly: boolean;
  commentss?: Comment[];
}

const CommentsSection = ({ onClose, videoId, longVideosOnly, commentss }: CommentsSectionProps) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(commentss || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch comments when component mounts
  useEffect(() => {
    if (videoId && token) {
      fetchComments();
    }
  }, [videoId, token]);

  const fetchComments = async () => {
    if (!token || !videoId) return;
    
    setIsLoading(true);
    try {
      const response = await commentActions.getComments(token, videoId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !token || !videoId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await commentActions.postComment(token, videoId, comment.trim());
      
      // Check if response and comment exist
      if (response && response.comment) {
        // Add the new comment to the list
        const newComment: Comment = {
          _id: response.comment._id,
          content: response.comment.content,
          videoId: videoId,
          repliesCount: 0,
          user: response.comment.user,
          timestamp: response.comment.timestamp,
          donations: 0,
          upvotes: 0,
          downvotes: 0,
          replies: 0,
          upvoted: false,
          downvoted: false,
          is_monetized: response.comment.is_monetized || false,
        };
        
        setComments(prev => [newComment, ...prev]);
        setComment("");
        
        // Scroll to top to show the new comment
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    if (!token || !videoId) return;

    try {
      const response = await commentActions.upvoteComment(token, commentId, videoId);
      
      // Update the comment in the list based on the response
      if (response) {
        setComments(prev => prev.map(c => 
          c._id === commentId 
            ? { 
                ...c, 
                upvoted: response.upvoted || false,
                upvotes: response.upvotes || c.upvotes,
                downvoted: false // Remove downvote if upvoting
              }
            : c
        ));
      }
    } catch (error) {
      console.error('Error upvoting comment:', error);
    }
  };

  const renderComment = (comment: Comment) => (
    <View key={comment._id} className="mb-4 p-3 bg-gray-800 rounded-lg">
      <View className="flex-row items-start space-x-3">
        <Image
          source={{ uri: comment.user.avatar }}
          className="w-8 h-8 rounded-full"
        />
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">
            {comment.user.name}
          </Text>
          <Text className="text-gray-300 text-sm mt-1">
            {comment.content}
          </Text>
          
          <View className="flex-row items-center mt-2 space-x-4">
            <TouchableOpacity
              onPress={() => handleUpvoteComment(comment._id)}
              className="flex-row items-center space-x-1"
            >
              <Heart
                size={16}
                color={comment.upvoted ? "#ef4444" : "#9ca3af"}
                fill={comment.upvoted ? "#ef4444" : "none"}
              />
              <Text className="text-gray-400 text-xs">{comment.upvotes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center space-x-1">
              <MessageCircle size={16} color="#9ca3af" />
              <Text className="text-gray-400 text-xs">{comment.replies || comment.repliesCount || 0}</Text>
            </TouchableOpacity>
            
            {comment.is_monetized && (
              <View className="bg-yellow-500 px-2 py-1 rounded">
                <Text className="text-black text-xs font-bold">💰</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="w-full absolute rounded-t-lg max-h-[60%] bottom-0"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
        <Text className="text-white text-lg font-semibold">
          Comments ({comments.length})
        </Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color="#F1C40F" />
            <Text className="text-gray-400 mt-2">Loading comments...</Text>
          </View>
        ) : comments.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-400 text-center">
              No comments yet. Be the first to comment!
            </Text>
          </View>
        ) : (
          <View className="gap-2 py-4">
            {comments.map(renderComment)}
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <Animated.View
        style={{
          paddingBottom: animatedBottom,
          backgroundColor: "rgba(0, 0, 0, 0.95)",
          borderTopWidth: 1,
          borderTopColor: "#374151",
        }}
        className="p-4"
      >
        <View className="flex-row items-center space-x-3">
          <TextInput
            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-full"
            placeholder="Add a comment..."
            placeholderTextColor="#9ca3af"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSubmitComment}
            disabled={!comment.trim() || isSubmitting}
            className={`p-3 rounded-full ${
              comment.trim() && !isSubmitting
                ? "bg-blue-500"
                : "bg-gray-600"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default CommentsSection;