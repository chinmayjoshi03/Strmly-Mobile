import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
  PanResponder,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { useComments } from "./useComments";
import { Comment } from "@/types/Comments";

interface TikTokCommentsSheetProps {
  onClose: () => void;
  videoId: string | null;
  longVideosOnly: boolean;
  onPressUsername?: (userId: string) => void;
  onPressTip?: (commentId: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;
const SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.3;

const TikTokCommentsSheet = ({ 
  onClose, 
  videoId, 
  longVideosOnly,
  onPressUsername,
  onPressTip 
}: TikTokCommentsSheetProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToUser, setReplyingToUser] = useState<string>("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [repliesData, setRepliesData] = useState<{ [key: string]: any[] }>({});

  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const translateY = useRef(new Animated.Value(SHEET_MAX_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;

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

  // Pan responder for drag to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dx) < 50;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Show animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Staggered fade-in for list
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  // Fetch comments when component mounts
  useEffect(() => {
    if (videoId) {
      const timer = setTimeout(() => {
        fetchComments();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videoId, fetchComments]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SHEET_MAX_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [onClose]);

  const handleSubmitComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (replyingTo) {
        const replyResult = await addReply(replyingTo, comment.trim());
        
        try {
          const updatedReplies = await fetchReplies(replyingTo);
          setRepliesData(prev => ({
            ...prev,
            [replyingTo]: updatedReplies || []
          }));
          setExpandedReplies(prev => new Set([...prev, replyingTo]));
        } catch (error) {
          console.error('Error refreshing replies:', error);
        }

        handleCancelReply();
      } else {
        await addComment(comment.trim());
        setComment("");
      }
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

  const handleToggleReplies = async (commentId: string) => {
    const isExpanded = expandedReplies.has(commentId);
    
    if (isExpanded) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      setExpandedReplies(prev => new Set([...prev, commentId]));
      
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

  const handleUpvote = async (commentId: string) => {
    // Micro animation for upvote
    Animated.sequence([
      Animated.timing(new Animated.Value(1), {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(new Animated.Value(1.2), {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    await upvoteComment(commentId);
  };

  const handleDownvote = async (commentId: string) => {
    // Micro animation for downvote
    Animated.sequence([
      Animated.timing(new Animated.Value(1), {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(new Animated.Value(1.2), {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    await downvoteComment(commentId);
  };

  const renderReply = ({ item: reply }: { item: any }) => (
    <View style={{ marginLeft: 56, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <TouchableOpacity
          onPress={() => onPressUsername?.(reply.user?.id)}
          accessibilityLabel={`View ${reply.user?.name || 'user'} profile`}
          style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
        >
          <Image
            source={
              reply.user?.avatar
                ? { uri: reply.user.avatar }
                : require('@/assets/images/user.png')
            }
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
        </TouchableOpacity>
        
        <View style={{ flex: 1, marginLeft: 12 }}>
          <TouchableOpacity onPress={() => onPressUsername?.(reply.user?.id)}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
              {reply.user?.name || 'Anonymous User'}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 16, marginTop: 2 }}>
            {reply.content || 'No content'}
          </Text>
          <Text style={{ color: '#9E9E9E', fontSize: 13, marginTop: 4 }}>
            {new Date(reply.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderComment = ({ item: comment, index }: { item: Comment; index: number }) => {
    if (!comment || !comment._id) return null;

    const isExpanded = expandedReplies.has(comment._id);
    const replies = repliesData[comment._id] || [];

    return (
      <Animated.View
        style={{
          opacity: listOpacity,
          transform: [{
            translateY: listOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }}
      >
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Left content */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
              <TouchableOpacity
                onPress={() => onPressUsername?.(comment.user?.id)}
                accessibilityLabel={`View ${comment.user?.name || 'user'} profile`}
                style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
              >
                <Image
                  source={
                    comment.user?.avatar
                      ? { uri: comment.user.avatar }
                      : require('@/assets/images/user.png')
                  }
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                />
              </TouchableOpacity>
              
              <View style={{ flex: 1, marginLeft: 12 }}>
                <TouchableOpacity onPress={() => onPressUsername?.(comment.user?.id)}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                    {comment.user?.name || 'Anonymous User'}
                  </Text>
                </TouchableOpacity>
                <Text style={{ color: '#FFFFFF', fontSize: 16, marginTop: 2 }}>
                  {comment.content || 'No content'}
                </Text>
                <Text style={{ color: '#9E9E9E', fontSize: 13, marginTop: 4 }}>
                  {new Date(comment.timestamp).toLocaleDateString()}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 24 }}>
                  <TouchableOpacity 
                    onPress={() => handleReplyToComment(comment._id, comment.user?.name || 'Anonymous User')}
                    accessibilityLabel="Reply to comment"
                    style={{ minHeight: 44, justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#9E9E9E', fontSize: 13 }}>Reply</Text>
                  </TouchableOpacity>
                  
                  {(comment.replies > 0 || comment.repliesCount > 0) && (
                    <TouchableOpacity 
                      onPress={() => handleToggleReplies(comment._id)}
                      accessibilityLabel={`${isExpanded ? 'Hide' : 'View'} replies`}
                      style={{ minHeight: 44, justifyContent: 'center' }}
                    >
                      <Text style={{ color: '#9E9E9E', fontSize: 13 }}>
                        {isExpanded ? 'Hide replies' : `View replies (${comment.replies || comment.repliesCount || 0})`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Right action column */}
            <View style={{ width: 68, alignItems: 'center', justifyContent: 'flex-start', gap: 16 }}>
              {/* Currency/Tip button */}
              <TouchableOpacity
                onPress={() => onPressTip?.(comment._id)}
                accessibilityLabel="Tip creator"
                style={{ alignItems: 'center', minHeight: 44, justifyContent: 'center' }}
              >
                <Text style={{ color: '#FFD24D', fontSize: 22, lineHeight: 24 }}>₹</Text>
                <Text style={{ color: '#9E9E9E', fontSize: 12, marginTop: 2 }}>
                  {comment.donations || 0}
                </Text>
              </TouchableOpacity>

              {/* Upvote button */}
              <TouchableOpacity
                onPress={() => handleUpvote(comment._id)}
                accessibilityLabel="Upvote comment"
                style={{ alignItems: 'center', minHeight: 44, justifyContent: 'center' }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    lineHeight: 24,
                    color: comment.upvoted ? '#FF3B30' : '#FFFFFF'
                  }}
                >
                  ↑
                </Text>
                <Text style={{ color: '#9E9E9E', fontSize: 12, marginTop: 2 }}>
                  {comment.upvotes || 0}
                </Text>
              </TouchableOpacity>

              {/* Downvote button */}
              <TouchableOpacity
                onPress={() => handleDownvote(comment._id)}
                accessibilityLabel="Downvote comment"
                style={{ alignItems: 'center', minHeight: 44, justifyContent: 'center' }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    lineHeight: 24,
                    color: comment.downvoted ? '#FF3B30' : '#FFFFFF'
                  }}
                >
                  ↓
                </Text>
                <Text style={{ color: '#9E9E9E', fontSize: 12, marginTop: 2 }}>
                  {comment.downvotes || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Replies section */}
          {isExpanded && (
            <Animated.View
              style={{
                marginTop: 12,
                opacity: listOpacity,
              }}
            >
              {replies.length > 0 ? (
                <FlatList
                  data={replies}
                  renderItem={renderReply}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                  removeClippedSubviews={true}
                />
              ) : (
                <View style={{ marginLeft: 56 }}>
                  <Text style={{ color: '#9E9E9E', fontSize: 13 }}>
                    No replies yet
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <>
      {/* Backdrop overlay */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          opacity: backdropOpacity,
          zIndex: 999,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#0E0E0E',
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          maxHeight: SHEET_MAX_HEIGHT,
          minHeight: SHEET_MIN_HEIGHT,
          transform: [{ translateY }],
          zIndex: 1000,
        }}
        {...panResponder.panHandlers}
      >
        {/* Drag handle */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <View
            style={{
              width: 56,
              height: 4,
              backgroundColor: '#9E9E9E',
              borderRadius: 2,
            }}
          />
        </View>

        {/* Header */}
        <View style={{ alignItems: 'center', paddingBottom: 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700' }}>
            Comments
          </Text>
        </View>

        {/* Comments List */}
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
              <ActivityIndicator size="large" color="#F1C40F" />
              <Text style={{ color: '#9E9E9E', marginTop: 8 }}>Loading comments...</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
              <Text style={{ color: '#9E9E9E', textAlign: 'center' }}>
                No comments yet. Be the first to comment!
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            paddingHorizontal: 20,
            paddingBottom: Math.max(insets.bottom, 16),
            paddingTop: 16,
            backgroundColor: '#0E0E0E',
          }}
        >
          {/* Reply indicator */}
          {replyingTo && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: 'rgba(158, 158, 158, 0.1)',
              borderRadius: 8,
            }}>
              <Text style={{ color: '#9E9E9E', fontSize: 14 }}>
                Replying to @{replyingToUser}
              </Text>
              <TouchableOpacity onPress={handleCancelReply}>
                <Text style={{ color: '#FF3B30', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#0E0E0E',
            borderRadius: 28,
            height: 52,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: '#333333',
          }}>
            {/* Attach icon */}
            <TouchableOpacity
              accessibilityLabel="Attach media"
              style={{ marginRight: 12, minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ color: '#9E9E9E', fontSize: 18 }}>📎</Text>
            </TouchableOpacity>

            {/* Text Input */}
            <TextInput
              style={{
                flex: 1,
                color: '#FFFFFF',
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

            {/* Send button */}
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!comment.trim() || isSubmitting}
              accessibilityLabel="Send comment"
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: comment.trim() ? '#FFFFFF' : '#9E9E9E',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 12,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ 
                  color: comment.trim() ? '#FFFFFF' : '#9E9E9E', 
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  →
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
};

export default TikTokCommentsSheet;