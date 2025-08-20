import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Keyboard,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useComments } from "./useComments";
import { Comment } from "@/types/Comments";
import { useMonetization } from "./useMonetization";
import { router } from "expo-router";
import { getProfilePhotoUrl } from "@/utils/profileUtils";

interface CommentsSectionProps {
  onClose: () => void;
  videoId: string | null;
  onPressUsername?: (userId: string) => void;
  onPressTip?: (commentId: string) => void;
  onCommentAdded?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.6;
const BOTTOM_NAV_HEIGHT = 50;

const CommentsSection = ({
  onClose,
  videoId,
  onPressUsername,
  onPressTip,
  onCommentAdded,
}: CommentsSectionProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToUser, setReplyingToUser] = useState<string>("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [repliesData, setRepliesData] = useState<{ [key: string]: any[] }>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const { commentMonetizationEnabled, loading: monetizationLoading } =
    useMonetization(false); // Disable polling to reduce API calls

  const {
    comments,
    loading: isLoading,
    fetchComments,
    addComment,
    upvoteComment,
    downvoteComment,
    addReply,
    fetchReplies,
    upvoteReply,
    downvoteReply,
  } = useComments({ videoId });

  useEffect(() => {
    if (videoId) fetchComments();
  }, [videoId, fetchComments]);

    // Debug logging for monetization (reduced)
  useEffect(() => {
    if (comments.length > 0) {
      console.log("💰 Comment Monetization Status:", {
        globalEnabled: commentMonetizationEnabled,
        commentsCount: comments.length,
        monetizedComments: comments.filter((c) => c.is_monetized).length,
      });
    }
  }, [commentMonetizationEnabled, comments]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleSubmitComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (replyingTo) {
        await addReply(replyingTo, comment.trim());

        try {
          const updatedReplies = await fetchReplies(replyingTo);
          setRepliesData((prev) => ({
            ...prev,
            [replyingTo]: updatedReplies || [],
          }));
          setExpandedReplies((prev) => new Set([...prev, replyingTo]));
        } catch (error) {
          console.error("Error refreshing replies:", error);
        }

        handleCancelReply();
      } else {
        await addComment(comment.trim());
        setComment("");
        // Notify parent that a comment was added
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error: any) {
      console.error("Error submitting comment:", error);
      const errorMessage = error.message || "Failed to post comment";
      Alert.alert("Error", `Failed to post comment: ${errorMessage}`);
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

  const handleToggleReplies = async (commentId: string) => {
    const isExpanded = expandedReplies.has(commentId);

    if (isExpanded) {
      setExpandedReplies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      setExpandedReplies((prev) => new Set([...prev, commentId]));

      if (!repliesData[commentId]) {
        try {
          const replies = await fetchReplies(commentId);
          setRepliesData((prev) => ({
            ...prev,
            [commentId]: replies || [],
          }));
        } catch (error) {
          console.error("Error fetching replies:", error);
          setRepliesData((prev) => ({
            ...prev,
            [commentId]: [],
          }));
        }
      }
    }
  };

  const handleUpvote = async (commentId: string) => {
    await upvoteComment(commentId);
  };

  const handleDownvote = async (commentId: string) => {
    await downvoteComment(commentId);
  };

  const handleUpvoteReply = async (replyId: string, commentId: string) => {
    try {
      await upvoteReply(replyId, commentId);
      // Refresh replies to get updated vote counts
      const updatedReplies = await fetchReplies(commentId);
      setRepliesData((prev) => ({
        ...prev,
        [commentId]: updatedReplies || [],
      }));
    } catch (error) {
      console.error("Error upvoting reply:", error);
    }
  };

  const handleDownvoteReply = async (replyId: string, commentId: string) => {
    try {
      await downvoteReply(replyId, commentId);
      // Refresh replies to get updated vote counts
      const updatedReplies = await fetchReplies(commentId);
      setRepliesData((prev) => ({
        ...prev,
        [commentId]: updatedReplies || [],
      }));
    } catch (error) {
      console.error("Error downvoting reply:", error);
    }
  };

  const renderReply = (reply: any, parentCommentId: string) => (
    <View key={reply._id} style={{ marginLeft: 56, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* Left content */}
        <View
          style={{ flex: 1, flexDirection: "row", alignItems: "flex-start" }}
        >
          <TouchableOpacity
            onPress={() => onPressUsername?.(reply.user?.id)}
            accessibilityLabel={`View ${reply.user?.name || "user"} profile`}
            style={{ minHeight: 44, minWidth: 44, justifyContent: "center" }}
          >
            <Image
              source={{ uri: getProfilePhotoUrl(reply.user?.avatar, "user") }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <TouchableOpacity onPress={() => onPressUsername?.(reply.user?.id)}>
              <Text
                style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}
              >
                {reply.user?.name || "Anonymous User"}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: "#FFFFFF", fontSize: 16, marginTop: 2 }}>
              {reply.content || "No content"}
            </Text>
          </View>
        </View>

        {/* Right action icons - aligned horizontally (no tip for replies) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            paddingLeft: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => handleUpvoteReply(reply._id, parentCommentId)}
            accessibilityLabel="Upvote reply"
            style={{
              alignItems: "center",
              minHeight: 44,
              justifyContent: "center",
            }}
          >
            <MaterialIcons
              name="arrow-upward"
              size={18}
              color={reply.upvoted ? "#4CAF50" : "#FFFFFF"}
            />
            <Text style={{ color: "#9E9E9E", fontSize: 11, marginTop: 1 }}>
              {reply.upvotes || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDownvoteReply(reply._id, parentCommentId)}
            accessibilityLabel="Downvote reply"
            style={{
              alignItems: "center",
              minHeight: 44,
              justifyContent: "center",
            }}
          >
            <MaterialIcons
              name="arrow-downward"
              size={18}
              color={reply.downvoted ? "#F44336" : "#FFFFFF"}
            />
            <Text style={{ color: "#9E9E9E", fontSize: 11, marginTop: 1 }}>
              {reply.downvotes || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reply button directly below the reply */}
      <View style={{ marginLeft: 44, marginTop: 4 }}>
        <TouchableOpacity
          onPress={() =>
            handleReplyToComment(
              parentCommentId,
              reply.user?.name || "Anonymous User"
            )
          }
          accessibilityLabel="Reply to reply"
          style={{ minHeight: 32, justifyContent: "center" }}
        >
          <Text style={{ color: "#9E9E9E", fontSize: 13 }}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComment = (item: Comment) => {
    if (!item || !item._id) return null;

    const isExpanded = expandedReplies.has(item._id);
    const replies = repliesData[item._id] || [];

    return (
      <View
        key={item._id}
        style={{ paddingHorizontal: 20, paddingVertical: 12 }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* Left content */}
          <View
            style={{ flex: 1, flexDirection: "row", alignItems: "flex-start" }}
          >
            <TouchableOpacity
              onPress={() => onPressUsername?.(item.user?.id)}
              accessibilityLabel={`View ${item.user?.name || "user"} profile`}
              style={{ minHeight: 44, minWidth: 44, justifyContent: "center" }}
            >
              <Image
                source={{ uri: getProfilePhotoUrl(item.user?.avatar, "user") }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
              />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <TouchableOpacity
                onPress={() => onPressUsername?.(item.user?.id)}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}
                >
                  {item.user?.name || "Anonymous User"}
                </Text>
              </TouchableOpacity>
              <Text style={{ color: "#FFFFFF", fontSize: 16, marginTop: 2 }}>
                {item.content || "No content"}
              </Text>
            </View>
          </View>

          {/* Right action icons - aligned horizontally */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              paddingLeft: 8,
            }}
          >
            {/* Only show rupee icon if both global and comment-specific monetization are enabled */}
            {commentMonetizationEnabled && item.is_monetized && (
              <TouchableOpacity
                onPress={() => {
                  // Navigate to VideoContentGifting with comment parameters
                  router.push({
                    pathname: "/(payments)/Video/Video-Gifting",
                    params: {
                      mode: "comment-gift",
                      commentId: item._id,
                      videoId: videoId,
                      creatorName: item.user?.name || "Anonymous User",
                      creatorUsername: item.user?.username || "user",
                      creatorPhoto: item.user?.avatar || "",
                      creatorId: item.user?.id || "",
                    },
                  });
                }}
                accessibilityLabel="Tip creator"
                style={{
                  alignItems: "center",
                  minHeight: 44,
                  justifyContent: "center",
                }}
              >
                <MaterialIcons
                  name="currency-rupee"
                  size={20}
                  color="#FFD24D"
                />
                <Text style={{ color: "#9E9E9E", fontSize: 12, marginTop: 2 }}>
                  {item.donations || 0}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => handleUpvote(item._id)}
              accessibilityLabel="Upvote comment"
              style={{
                alignItems: "center",
                minHeight: 44,
                justifyContent: "center",
              }}
            >
              <MaterialIcons
                name="arrow-upward"
                size={20}
                color={item.upvoted ? "#4CAF50" : "#FFFFFF"}
              />
              <Text style={{ color: "#9E9E9E", fontSize: 12, marginTop: 2 }}>
                {item.upvotes || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDownvote(item._id)}
              accessibilityLabel="Downvote comment"
              style={{
                alignItems: "center",
                minHeight: 44,
                justifyContent: "center",
              }}
            >
              <MaterialIcons
                name="arrow-downward"
                size={20}
                color={item.downvoted ? "#F44336" : "#FFFFFF"}
              />
              <Text style={{ color: "#9E9E9E", fontSize: 12, marginTop: 2 }}>
                {item.downvotes || 0}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reply and View replies buttons on the same line */}
        <View
          style={{
            marginLeft: 56,
            marginTop: 4,
            flexDirection: "row",
            alignItems: "center",
            gap: 24,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              handleReplyToComment(
                item._id,
                item.user?.name || "Anonymous User"
              )
            }
            accessibilityLabel="Reply to comment"
            style={{ minHeight: 32, justifyContent: "center" }}
          >
            <Text style={{ color: "#9E9E9E", fontSize: 13 }}>Reply</Text>
          </TouchableOpacity>

          {(item.replies > 0 || item.repliesCount > 0) && (
            <TouchableOpacity
              onPress={() => handleToggleReplies(item._id)}
              accessibilityLabel={`${isExpanded ? "Hide" : "View"} replies`}
              style={{ minHeight: 32, justifyContent: "center" }}
            >
              <Text style={{ color: "#9E9E9E", fontSize: 13 }}>
                {isExpanded
                  ? "Hide replies"
                  : `View replies (${item.replies || item.repliesCount || 0})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Replies section */}
        {isExpanded && (
          <View style={{ marginTop: 12 }}>
            {replies.length > 0 ? (
              replies.map((reply) => renderReply(reply, item._id))
            ) : (
              <View style={{ marginLeft: 56 }}>
                <Text style={{ color: "#9E9E9E", fontSize: 13 }}>
                  No replies yet
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 1000,
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom:
            SHEET_MAX_HEIGHT +
            (keyboardHeight > 0 ? keyboardHeight : BOTTOM_NAV_HEIGHT),
        }}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Bottom Sheet */}
      <View
        style={{
          backgroundColor: "#0E0E0E",
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          height: SHEET_MAX_HEIGHT,
          marginBottom: keyboardHeight > 0 ? keyboardHeight : BOTTOM_NAV_HEIGHT,
        }}
      >
        {/* Drag handle */}
        <View
          style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}
        >
          <View
            style={{
              width: 56,
              height: 4,
              backgroundColor: "#9E9E9E",
              borderRadius: 2,
            }}
          />
        </View>

        {/* Header */}
        <View style={{ alignItems: "center", paddingBottom: 16 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>
            Comments
          </Text>
        </View>

        {/* Comments List - Using ScrollView for reliable scrolling */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {isLoading || monetizationLoading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 50,
              }}
            >
              <ActivityIndicator size="large" color="#F1C40F" />
              <Text style={{ color: "#9E9E9E", marginTop: 8 }}>
                {isLoading ? "Loading comments..." : "Loading..."}
              </Text>
            </View>
          ) : comments.length === 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 50,
              }}
            >
              <Text style={{ color: "#9E9E9E", textAlign: "center" }}>
                No comments yet. Be the first to comment!
              </Text>
            </View>
          ) : (
            <>
              {comments.map((item) => renderComment(item))}
              <View style={{ height: 20 }} />
            </>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom:
              keyboardHeight > 0 ? 16 : Math.max(insets.bottom, 16),
            paddingTop: 16,
            backgroundColor: "#0E0E0E",
          }}
        >
          {/* Reply indicator */}
          {replyingTo && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: "rgba(158, 158, 158, 0.1)",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#9E9E9E", fontSize: 14 }}>
                Replying to @{replyingToUser}
              </Text>
              <TouchableOpacity onPress={handleCancelReply}>
                <Text style={{ color: "#FF3B30", fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#0E0E0E",
              borderRadius: 28,
              height: 52,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: "#333333",
            }}
          >
            {/* Text Input */}
            <TextInput
              style={{
                flex: 1,
                color: "#FFFFFF",
                fontSize: 16,
                paddingVertical: 0,
              }}
              placeholder="Add comment........."
              placeholderTextColor="#9E9E9E"
              value={comment}
              onChangeText={setComment}
              multiline={false}
              maxLength={500}
            />

            {/* Send button - no outer circle */}
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!comment.trim() || isSubmitting}
              accessibilityLabel="Send comment"
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 12,
                minHeight: 44,
                minWidth: 44,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialIcons
                  name="send"
                  size={20}
                  color={comment.trim() ? "#FFFFFF" : "#9E9E9E"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommentsSection;