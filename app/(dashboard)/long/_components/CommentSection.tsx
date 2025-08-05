import React, { useState, useEffect, useRef } from "react";
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
import { useComments } from "./useComments";
import { Comment } from "@/types/Comments";

interface CommentsSectionProps {
  onClose: () => void;
  videoId: string | null;
  longVideosOnly: boolean;
  commentss?: Comment[];
}

const CommentsSection = ({ onClose, videoId, longVideosOnly, commentss }: CommentsSectionProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToUser, setReplyingToUser] = useState<string>("");
  const [viewingReplies, setViewingReplies] = useState<string | null>(null);
  const [repliesData, setRepliesData] = useState<{ [key: string]: any[] }>({});

  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Use the existing useComments hook
  const {
    comments,
    loading: isLoading,
    error,
    fetchComments,
    addComment,
    upvoteComment,
    downvoteComment,
    addReply,
    fetchReplies
  } = useComments({ videoId });

  // Fetch comments when component mounts with throttling
  useEffect(() => {
    if (videoId) {
      // Add a small delay to prevent rate limiting
      const timer = setTimeout(() => {
        fetchComments();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [videoId, fetchComments]);

  const handleSubmitComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (replyingTo) {
        // Submit as reply
        console.log('Submitting reply to comment:', replyingTo, 'content:', comment.trim());
        const replyResult = await addReply(replyingTo, comment.trim());
        console.log('Reply result:', replyResult);

        // Refresh replies for this comment
        try {
          console.log('Fetching updated replies for comment:', replyingTo);
          const updatedReplies = await fetchReplies(replyingTo);
          console.log('Updated replies:', updatedReplies);

          setRepliesData(prev => ({
            ...prev,
            [replyingTo]: updatedReplies || []
          }));

          // Keep viewing replies to show the new reply
          setViewingReplies(replyingTo);
        } catch (error) {
          console.error('Error refreshing replies:', error);
        }

        handleCancelReply();
      } else {
        // Submit as new comment
        await addComment(comment.trim());
        setComment("");
      }

      // Scroll to top to show the new comment
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      const errorMessage = error.message || 'Failed to post comment';
      Alert.alert('Error', `Failed to post comment: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyToComment = (commentId: string, userName: string) => {
    setReplyingTo(commentId);
    setReplyingToUser(userName);
    setComment(`@${userName} `);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyingToUser("");
    setComment("");
  };

  const handleViewReplies = async (commentId: string) => {
    if (viewingReplies === commentId) {
      setViewingReplies(null);
    } else {
      setViewingReplies(commentId);

      // Fetch replies if we don't have them already
      if (!repliesData[commentId]) {
        try {
          const replies = await fetchReplies(commentId);
          setRepliesData(prev => ({
            ...prev,
            [commentId]: replies || []
          }));
        } catch (error) {
          console.error('Error fetching replies:', error);
          setRepliesData(prev => ({
            ...prev,
            [commentId]: []
          }));
        }
      }
    }
  };

  const renderComment = (comment: Comment) => {
    // Safety check to ensure comment and user exist
    if (!comment || !comment._id) return null;

    return (
      <View key={comment._id} className="mb-3 px-4 py-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-start space-x-3 flex-1">
            <Image
              source={
                comment.user?.avatar
                  ? { uri: comment.user.avatar }
                  : require('@/assets/images/user.png')
              }
              className="w-8 h-8 rounded-full"
            />
            <View className="flex-1">
              <Text className="text-white font-medium text-sm">
                {comment.user?.name || 'Anonymous User'}
              </Text>
              <Text className="text-gray-300 text-sm mt-1">
                {comment.content || 'No content'}
              </Text>
              <View className="flex-row items-center mt-2 space-x-6">
                <TouchableOpacity onPress={() => handleReplyToComment(comment._id, comment.user?.name || 'Anonymous User')}>
                  <Text className="text-gray-400 text-xs">Reply</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleViewReplies(comment._id)}>
                  <Text className="text-gray-500 text-xs">
                    {viewingReplies === comment._id ? 'Hide replies' : `View replies (${comment.replies || comment.repliesCount || 0})`}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Show replies if viewing */}
              {viewingReplies === comment._id && (
                <View className="mt-3 ml-4 pl-4 border-l border-gray-600">
                  {repliesData[comment._id] && repliesData[comment._id].length > 0 ? (
                    repliesData[comment._id].map((reply: any) => (
                      <View key={reply._id} className="mb-2 flex-row items-start space-x-2">
                        <Image
                          source={
                            reply.user?.avatar
                              ? { uri: reply.user.avatar }
                              : require('@/assets/images/user.png')
                          }
                          className="w-6 h-6 rounded-full"
                        />
                        <View className="flex-1">
                          <Text className="text-white font-medium text-xs">
                            {reply.user?.name || reply.user?.username || 'Anonymous'}
                          </Text>
                          <Text className="text-gray-300 text-xs mt-1">
                            {reply.content}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text className="text-gray-400 text-xs">
                      No replies yet
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Right side actions - Properly aligned in single row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 16,
              gap: 12,
            }}
          >
            {/* Rupee/Gift button */}
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 24,
              }}
            >
              <Text style={{ color: '#FBBF24', fontSize: 14, lineHeight: 16 }}>₹</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 10, lineHeight: 12 }}>
                {comment.donations || 0}
              </Text>
            </TouchableOpacity>

            {/* Upvote button */}
            <TouchableOpacity
              onPress={() => upvoteComment(comment._id)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  lineHeight: 20,
                  color: comment.upvoted ? '#10B981' : '#FFFFFF'
                }}
              >
                ↑
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 10, lineHeight: 12 }}>
                {comment.upvotes || 0}
              </Text>
            </TouchableOpacity>

            {/* Downvote button */}
            <TouchableOpacity
              onPress={() => downvoteComment(comment._id)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  lineHeight: 20,
                  color: comment.downvoted ? '#EF4444' : '#FFFFFF'
                }}
              >
                ↓
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 10, lineHeight: 12 }}>
                {comment.downvotes || 0}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Backdrop overlay */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999,
          elevation: 999,
        }}
        onPress={onClose}
        activeOpacity={1}
      />

      <KeyboardAvoidingView
        className="w-full absolute rounded-t-lg max-h-[60%] bottom-0"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          backgroundColor: "#1A1A1A",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          zIndex: 1000,
          elevation: 1000, // For Android
        }}
      >
        {/* Header */}
        <View className="items-center py-4">
          <Text className="text-white text-xl font-semibold">
            Comments
          </Text>
        </View>

        {/* Comments List */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            backgroundColor: "#1A1A1A",
          }}
          className="p-4"
        >
          {/* Reply indicator */}
          {replyingTo && (
            <View className="flex-row items-center justify-between mb-2 p-2 bg-gray-800 rounded">
              <Text className="text-gray-300 text-sm">
                Replying to @{replyingToUser}
              </Text>
              <TouchableOpacity onPress={handleCancelReply}>
                <Text className="text-red-400 text-sm">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-center space-x-3">
            <TextInput
              className="flex-1 bg-transparent text-white px-4 py-3 border-b border-gray-600"
              placeholder="Add comment........."
              placeholderTextColor="#6b7280"
              value={comment}
              onChangeText={setComment}
              multiline={false}
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!comment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-2xl">▷</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </>
  );
};

export default CommentsSection;