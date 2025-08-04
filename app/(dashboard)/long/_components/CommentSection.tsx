import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Smile,
  ArrowBigUp,
  ArrowBigDown,
  ChevronDown,
  SendHorizonal,
  ReplyIcon,
} from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Comment, reply } from "@/types/Comments";
import { useComments } from "./useComments";

interface CommentsSectionProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string | null;
  longVideosOnly: boolean;
<<<<<<< Updated upstream
  commentss?: [{}];
=======
  commentss?: Comment[];
>>>>>>> Stashed changes
}

const CommentsSection = (props: CommentsSectionProps) => {
  const { isOpen, onClose, videoId, longVideosOnly, commentss } = props;
  const [comment, setComment] = useState("");
  const [openReplies, setOpenReplies] = useState<{ [key: string]: reply[] }>(
    {}
  );
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null);
  const [votingReply, setVotingReply] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingComment, setVotingComment] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    username: string;
  } | null>(null);

  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;
  const scrollViewRef = useRef<ScrollView>(null);

<<<<<<< Updated upstream
  // --- Fetch functions, reused/stable ---
  const fetchComments = useCallback(async () => {
    if (!token || !videoId) {
      setComments(mockComments);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/interaction/videos/${videoId}/comments?videoType=${longVideosOnly ? "long" : "short"}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      console.log(data)
      setComments(data);
    } catch (err) {
      // Optionally use an Alert here
      setComments(mockComments);
    }
  }, [token, longVideosOnly, videoId]);

  useEffect(() => {
    if (isOpen && videoId) {
      const timer = setTimeout(() => fetchComments(), 100); // 100ms delay
      return () => clearTimeout(timer);
=======
  // Use the custom hook for comments
  const {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    addReply,
    upvoteComment,
    downvoteComment,
    fetchReplies: fetchRepliesFromHook,
    upvoteReply,
    downvoteReply,
    isConnected,
  } = useComments({ videoId });

  useEffect(() => {
    if (isOpen && videoId) {
      fetchComments();
      // Don't auto-scroll to bottom when opening comments
      // Let users see the most recent comments at the top
>>>>>>> Stashed changes
    }
  }, [isOpen, videoId, fetchComments]);

  const fetchReplies = async (commentID: string) => {
    if (openReplies[commentID]) {
      setOpenReplies((prev) => {
        const newReplies = { ...prev };
        delete newReplies[commentID];
        return newReplies;
      });
      return;
    }
    
    try {
      setLoadingReplies(commentID);
<<<<<<< Updated upstream
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/interaction/videos/${videoId}/comments/${commentID}/replies`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setOpenReplies((prev) => ({ ...prev, [commentID]: data }));
      console.log(data)
=======
      const replies = await fetchRepliesFromHook(commentID);
      setOpenReplies((prev) => ({ ...prev, [commentID]: replies }));
>>>>>>> Stashed changes
    } catch (err) {
      console.log('❌ Error fetching replies:', err);
    } finally {
      setLoadingReplies(null);
    }
  };

  const handleUpvote = async (commentID: string) => {
    if (votingComment) return;
    setVotingComment(commentID);
    try {
      await upvoteComment(commentID);
    } finally {
      setVotingComment(null);
    }
  };

  const handleDownvote = async (commentID: string) => {
    if (votingComment) return;
    setVotingComment(commentID);
    try {
      await downvoteComment(commentID);
    } finally {
      setVotingComment(null);
    }
  };

  const handleUpvoteReply = async (replyId: string, commentId: string) => {
    if (votingReply) return; // Prevent multiple simultaneous votes
    
    setVotingReply(replyId);
    try {
      const result = await upvoteReply(replyId, commentId);
      
      // Optimistically update the reply in the UI
      setOpenReplies(prev => ({
        ...prev,
        [commentId]: prev[commentId]?.map(reply => 
          reply._id === replyId 
            ? { 
                ...reply, 
                upvoted: result?.upvoted ?? !reply.upvoted,
                downvoted: false,
                upvotes: result?.upvotes ?? (reply.upvoted ? reply.upvotes - 1 : reply.upvotes + 1),
                downvotes: reply.downvoted ? reply.downvotes - 1 : reply.downvotes
              }
            : reply
        ) || []
      }));
    } catch (err) {
      console.log('❌ Error upvoting reply:', err);
    } finally {
      setVotingReply(null);
    }
  };

  const handleDownvoteReply = async (replyId: string, commentId: string) => {
    if (votingReply) return; // Prevent multiple simultaneous votes
    
    setVotingReply(replyId);
    try {
      const result = await downvoteReply(replyId, commentId);
      
      // Optimistically update the reply in the UI
      setOpenReplies(prev => ({
        ...prev,
        [commentId]: prev[commentId]?.map(reply => 
          reply._id === replyId 
            ? { 
                ...reply, 
                downvoted: result?.downvoted ?? !reply.downvoted,
                upvoted: false,
                downvotes: result?.downvotes ?? (reply.downvoted ? reply.downvotes - 1 : reply.downvotes + 1),
                upvotes: reply.upvoted ? reply.upvotes - 1 : reply.upvotes
              }
            : reply
        ) || []
      }));
    } catch (err) {
      console.log('❌ Error downvoting reply:', err);
    } finally {
      setVotingReply(null);
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (replyTo) {
        await addReply(replyTo.commentId, comment);
        await fetchReplies(replyTo.commentId);
      } else {
        await addComment(comment);
        // Force a re-render to ensure the comment appears
        setTimeout(() => {
          console.log('🔄 Refreshing comments after posting');
          fetchComments();
          // Scroll to the top to see the new comment (since newest comments are at the top)
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }, 100);
        }, 500);
      }
      setComment("");
      setReplyTo(null);
    } catch (err) {
      console.log('❌ Error sending comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        Animated.timing(animatedBottom, {
          toValue: e.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }).start();
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(animatedBottom, {
          toValue: insets.bottom,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }).start();
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  if (!isOpen) return null;

  return (
<<<<<<< Updated upstream
    <KeyboardAvoidingView
      className="w-full absolute rounded-t-lg max-h-[60%] bottom-0"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 0 : 0}
      style={{ flex: 1 }}
    >
      <View
        className="flex-1 bg-[#1A1A1A] rounded-t-3xl min-h-52 z-30"
        style={{ marginTop: "auto" }}
=======
    <View className="absolute inset-0 z-50">
      {/* Background overlay - tap to close */}
      <Pressable 
        className="absolute inset-0 bg-black/50"
        onPress={onClose}
      />
      
      <KeyboardAvoidingView
        className="w-full absolute rounded-t-lg max-h-[70%] bottom-0"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 0 : 0}
        style={{ flex: 1 }}
>>>>>>> Stashed changes
      >
        <View
          className="flex-1 bg-[#1A1A1A] rounded-t-3xl"
          style={{ marginTop: "auto", maxHeight: "100%" }}
        >
          {/* Header */}
          <View className="items-center justify-center p-4 rounded-t-3xl relative">
            {/* Drag handle */}
            <Pressable onPress={onClose}>
              <View className="w-20 h-1 bg-white/80 rounded-full my-2" />
            </Pressable>
            
            <View className="flex-row items-center justify-between w-full">
              <View className="w-8" />
              <Text className="text-2xl font-bold text-white">Comments</Text>
              {/* Close button */}
              <TouchableOpacity onPress={onClose} className="p-2">
                <Text className="text-white text-lg">✕</Text>
              </TouchableOpacity>
            </View>
          </View>

        {/* Comments List */}
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 150 }} // Increased padding for input bar
          className="flex-1"
          style={{ maxHeight: '70%' }}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          bounces={true}
          automaticallyAdjustContentInsets={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10
          }}
        >
          <View className="gap-5 p-4">
<<<<<<< Updated upstream
            {comments.map((comment) => (
              <View key={comment._id}>
                <View className="flex-row gap-1">
=======
            {loading && (
              <View className="flex-row justify-center py-4">
                <ActivityIndicator size="large" color="#4ade80" />
                <Text className="text-white ml-2">Loading comments...</Text>
              </View>
            )}
            
            {error && (
              <View className="bg-red-500/20 p-3 rounded-lg mb-4">
                <Text className="text-red-400 text-center">{error}</Text>
              </View>
            )}
            
            {!loading && comments.length === 0 && (
              <View className="py-8">
                <Text className="text-[#B0B0B0] text-center">No comments yet. Be the first to comment!</Text>
              </View>
            )}
            
            {comments.map((comment) => {
              console.log('🎨 Rendering comment:', comment._id, 'content:', comment.content);
              return (
                <View key={comment._id}>
                  <View className="flex-row gap-1">
>>>>>>> Stashed changes
                  {/* Avatar */}
                  <Image
                    source={{ uri: comment.user?.avatar ?? "" }}
                    className="size-10 rounded-full bg-white mr-2"
                    defaultSource={require("@/assets/images/back.png")}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center space-x-2 mb-1">
                      <Text
                        className="text-sm text-[#B0B0B0] font-semibold flex-1"
                        numberOfLines={1}
                      >
                        {comment.user?.name || "Anonymous User"}
                      </Text>
                    </View>
                    <View className="mb-2">
                      <Text className="text-base text-white">
                        {comment.content && comment.content.trim() ? comment.content : 'Comment content unavailable'}
                      </Text>
                      <Text className="text-xs text-[#B0B0B0] mt-1">
                        {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : 'Unknown date'}
                      </Text>
                    </View>
                    {/* Actions Row */}
                    <View className="flex-row gap-5 items-center">
                      <Pressable
                        onPress={() =>
                          setReplyTo({
                            commentId: comment._id,
                            username: comment.user?.name || "Anonymous",
                          })
                        }
                      >
                        <Text className="text-sm text-[#B0B0B0]">Reply</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => fetchReplies(comment._id)}
                        className="flex-row gap-1 mt-0.5 items-center"
                      >
                        <Text className="text-sm text-[#B0B0B0]">
                          View replies ({comment.replies})
                        </Text>
                        <ChevronDown size={16} color="#B0B0B0" />
                      </Pressable>
                    </View>
                    {/* Replies */}
                    {!!openReplies[comment._id]?.length && (
                      <View className="ml-8 mt-2 py-2">
                        {openReplies[comment._id].map((reply) => (
                          <View key={reply._id} className="mb-3">
                            <View className="flex-row space-x-2">
                              <Image
                                source={{ uri: reply.user?.avatar || "" }}
                                className="w-6 h-6 rounded-full"
                                defaultSource={require("@/assets/images/back.png")}
                              />
                              <View className="flex-1">
                                <View className="flex-row items-center space-x-2 mb-1">
                                  <Text className="font-medium text-xs text-white">
                                    {reply.user.name}
                                  </Text>
                                  <Text className="text-xs text-[#B0B0B0]">
                                    {new Date(
                                      reply.timestamp
                                    ).toLocaleDateString()}
                                  </Text>
                                </View>
                                <Text className="text-sm text-white mb-2">
                                  {reply.content}
                                </Text>
                                {/* Reply voting actions */}
                                <View className="flex-row gap-4 items-center">
                                  <TouchableOpacity
                                    onPress={() => handleUpvoteReply(reply._id, comment._id)}
                                    className="flex-row items-center gap-1"
                                    disabled={votingReply === reply._id}
                                  >
                                    {votingReply === reply._id ? (
                                      <ActivityIndicator size="small" color="#4ade80" />
                                    ) : (
                                      <ArrowBigUp
                                        size={16}
                                        color={reply.upvoted ? "#4ade80" : "#B0B0B0"}
                                      />
                                    )}
                                    <Text className="text-xs text-[#B0B0B0]">
                                      {reply.upvotes || 0}
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => handleDownvoteReply(reply._id, comment._id)}
                                    className="flex-row items-center gap-1"
                                    disabled={votingReply === reply._id}
                                  >
                                    {votingReply === reply._id ? (
                                      <ActivityIndicator size="small" color="#f87171" />
                                    ) : (
                                      <ArrowBigDown
                                        size={16}
                                        color={reply.downvoted ? "#f87171" : "#B0B0B0"}
                                      />
                                    )}
                                    <Text className="text-xs text-[#B0B0B0]">
                                      {reply.downvotes || 0}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                    {loadingReplies === comment._id && (
                      <Text className="text-xs ml-10 text-[#B0B0B0]">
                        Loading replies...
                      </Text>
                    )}
                  </View>
                  {/* Upvote / Downvote actions */}
                  <View className="flex-row gap-2 items-center">
                    <TouchableOpacity
                      onPress={() => handleUpvote(comment._id)}
                      className="items-center"
                      disabled={votingComment === comment._id}
                    >
                      {votingComment === comment._id ? (
                        <ActivityIndicator size="small" color="#4ade80" />
                      ) : (
                        <ArrowBigUp
                          size={22}
                          color={comment.upvoted ? "#4ade80" : "#B0B0B0"}
                        />
                      )}
                      <Text className="text-xs text-[#B0B0B0]">
                        {comment.upvotes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDownvote(comment._id)}
                      className="items-center"
                      disabled={votingComment === comment._id}
                    >
                      {votingComment === comment._id ? (
                        <ActivityIndicator size="small" color="#f87171" />
                      ) : (
                        <ArrowBigDown
                          size={22}
                          color={comment.downvoted ? "#f87171" : "#B0B0B0"}
                        />
                      )}
                      <Text className="text-xs text-[#B0B0B0]">
                        {comment.downvotes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
            })}
          </View>
        </ScrollView>

        {/* ---- INPUT BAR: Always at bottom, outside ScrollView ---- */}
        <Animated.View
<<<<<<< Updated upstream
          style={[
            {
              backgroundColor: "#181818",
              borderTopColor: "#353535",
              borderTopWidth: 1,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 8,
              paddingTop: 8,
              paddingBottom: insets.bottom,
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              transform: [
                { translateY: Animated.multiply(animatedBottom, -1) },
              ],
            },
          ]}
=======
          className="bg-[#181818] border-t border-[#353535] px-2 pt-2 flex-row items-center space-x-2"
          style={{
            paddingBottom: Math.max(insets.bottom + 60, 60), // Adjusted padding for better spacing with navigation bar
          }}
>>>>>>> Stashed changes
        >
          {!!replyTo && (
            <View className="absolute flex-row -top-6 left-2 bg-[#6D6F6E] px-2 py-1 rounded">
              <Text className="text-xs text-white">to @{replyTo.username}</Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Text className="text-xs text-red-400">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment..."
            placeholderTextColor="#999"
            className="flex-1 text-white px-3 py-2"
            multiline
          />
          <TouchableOpacity
            onPress={handleSendComment}
            disabled={!comment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#4ade80" />
            ) : (
              <SendHorizonal
                size={20}
                color={comment.trim() && !isSubmitting ? "#4ade80" : "#888"}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
        {/* ---- END INPUT BAR ---- */}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CommentsSection;
