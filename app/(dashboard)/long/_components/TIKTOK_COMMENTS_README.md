# TikTok-Style Comments Bottom Sheet

A fully-featured, TikTok-style comments bottom sheet component built with React Native and Expo, featuring smooth animations, gesture handling, and nested replies.

## Features

### ✨ Visual Design
- **TikTok-style UI**: Matches the exact specifications with proper colors, spacing, and layout
- **Smooth Animations**: Spring-based sheet animations with staggered list fade-ins
- **Gesture Support**: Drag-to-dismiss with pan responder
- **Responsive Layout**: Adapts to different screen sizes and orientations

### 🎯 Core Functionality
- **Comment System**: Full CRUD operations for comments and replies
- **Nested Replies**: Collapsible reply threads with proper indentation
- **Real-time Updates**: Optimistic UI updates with server synchronization
- **Voting System**: Upvote/downvote with micro animations
- **Tip Integration**: Currency/tip functionality with callback support

### 🎨 Design Specifications
- **Colors**: 
  - Sheet background: `#0E0E0E`
  - Primary text: `#FFFFFF`
  - Secondary text: `#9E9E9E`
  - Currency accent: `#FFD24D`
  - Active upvote: `#FF3B30`
- **Typography**:
  - Title: 22px, weight 700
  - Username: 14px, semi-bold
  - Comment text: 16px
  - Meta text: 13px
- **Layout**:
  - Avatar: 44px circle (32px for replies)
  - Right action column: 68px fixed width
  - Sheet radius: 36px top corners
  - Drag handle: 56x4px

## Usage

### Basic Implementation

```tsx
import CommentsSection from '@/app/(dashboard)/long/_components/CommentSection';

const MyComponent = () => {
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShowComments(true)}>
        <Text>Show Comments</Text>
      </TouchableOpacity>

      {showComments && (
        <CommentsSection
          onClose={() => setShowComments(false)}
          videoId="your-video-id"
          longVideosOnly={true}
          onPressUsername={(userId) => {
            // Navigate to user profile
            console.log('Navigate to:', userId);
          }}
          onPressTip={(commentId) => {
            // Open tip modal
            console.log('Tip comment:', commentId);
          }}
        />
      )}
    </>
  );
};
```

### Props Interface

```tsx
interface CommentsSectionProps {
  onClose: () => void;                    // Called when sheet is dismissed
  videoId: string | null;                 // Video ID for fetching comments
  longVideosOnly: boolean;                // Filter for long-form videos
  commentss?: Comment[];                  // Optional pre-loaded comments
  onPressUsername?: (userId: string) => void;  // Username tap callback
  onPressTip?: (commentId: string) => void;    // Tip button callback
}
```

## Architecture

### Component Structure
```
CommentSection.tsx
├── Animation Setup (translateY, backdropOpacity, listOpacity)
├── Pan Responder (drag-to-dismiss)
├── Comment Hooks (useComments)
├── Event Handlers
│   ├── handleSubmitComment
│   ├── handleToggleReplies
│   ├── handleUpvote/Downvote
│   └── handleClose
├── Render Functions
│   ├── renderComment
│   └── renderReply
└── JSX Structure
    ├── Backdrop Overlay
    ├── Bottom Sheet Container
    ├── Drag Handle
    ├── Header
    ├── Comments List (FlatList)
    └── Input Bar
```

### Data Flow
1. **Comments Loading**: `useComments` hook fetches data via `commentActions`
2. **Optimistic Updates**: UI updates immediately, then syncs with server
3. **Real-time Sync**: WebSocket integration for live updates (when available)
4. **Error Handling**: Graceful fallback to mock data on API failures

## Animations

### Sheet Animations
- **Entry**: Spring animation from bottom with backdrop fade-in
- **Exit**: Spring animation to bottom with backdrop fade-out
- **Drag**: Real-time pan responder with velocity-based dismiss

### List Animations
- **Staggered Fade-in**: Comments appear with subtle delay and translate
- **Reply Expansion**: Smooth height animation with opacity transition
- **Vote Micro-animations**: Scale + color change on tap

### Implementation Example
```tsx
// Entry animation
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
  ]).start();
}, []);
```

## Accessibility

### Touch Targets
- All interactive elements have minimum 44px tap area
- Proper hit slop for small icons
- Clear visual feedback on press

### Screen Reader Support
```tsx
<TouchableOpacity
  accessibilityLabel="Upvote comment"
  accessibilityRole="button"
  accessibilityHint="Double tap to upvote this comment"
>
```

### Keyboard Navigation
- Input stays pinned above keyboard
- Proper focus management
- Keyboard dismissal handling

## Performance Optimizations

### FlatList Configuration
```tsx
<FlatList
  data={comments}
  renderItem={renderComment}
  keyExtractor={(item) => item._id}
  removeClippedSubviews={true}        // Memory optimization
  keyboardShouldPersistTaps="handled" // Better UX
  showsVerticalScrollIndicator={false}
/>
```

### Memory Management
- Clipped subviews removal for large lists
- Optimized re-renders with proper key extraction
- Lazy loading for reply threads

## Testing

### Manual Test Checklist
See `TikTokCommentsSheet.test.md` for comprehensive test steps covering:
- Visual appearance validation
- Interaction testing (drag, tap, vote)
- Accessibility compliance
- Performance benchmarks
- Edge case handling

### Demo Component
Use `TikTokCommentsDemo.tsx` for isolated testing:
```bash
# Import and use in your test screen
import TikTokCommentsDemo from '@/components/TikTokCommentsDemo';
```

## Integration Notes

### Existing Functionality Preserved
- All existing comment operations work unchanged
- WebSocket integration ready (currently disabled)
- Error handling and fallback mechanisms intact
- Mock data support for development

### API Compatibility
- Uses existing `useComments` hook
- Compatible with current `commentActions` API
- Maintains backward compatibility with existing props

### Migration Path
1. The new UI is implemented in the existing `CommentSection.tsx`
2. All existing functionality is preserved
3. New props (`onPressUsername`, `onPressTip`) are optional
4. Gradual rollout possible with feature flags

## Dependencies

Required packages (already included in project):
- `react-native-reanimated`: For smooth animations
- `react-native-gesture-handler`: For pan responder
- `react-native-safe-area-context`: For proper insets
- `@expo/vector-icons` or `lucide-react-native`: For icons

## Customization

### Color Theming
```tsx
const COLORS = {
  background: '#0E0E0E',
  primary: '#FFFFFF',
  secondary: '#9E9E9E',
  accent: '#FFD24D',
  active: '#FF3B30',
};
```

### Animation Timing
```tsx
const ANIMATION_CONFIG = {
  springTension: 100,
  springFriction: 8,
  fadeInDuration: 400,
  backdropDuration: 300,
};
```

### Layout Dimensions
```tsx
const LAYOUT = {
  sheetRadius: 36,
  handleWidth: 56,
  handleHeight: 4,
  avatarSize: 44,
  replyAvatarSize: 32,
  actionColumnWidth: 68,
  inputHeight: 52,
};
```

## Troubleshooting

### Common Issues
1. **Animation Performance**: Ensure `useNativeDriver: true` for transform animations
2. **Keyboard Issues**: Check `KeyboardAvoidingView` behavior prop for platform
3. **Gesture Conflicts**: Verify pan responder configuration doesn't conflict with FlatList
4. **Memory Leaks**: Ensure proper cleanup of animation values and listeners

### Debug Mode
Enable console logging in `useComments` hook to track API calls and state changes.

## Future Enhancements

### Planned Features
- [ ] Voice message support
- [ ] Image/GIF attachments
- [ ] Comment reactions (emoji)
- [ ] Advanced moderation tools
- [ ] Comment threading improvements
- [ ] Offline support with sync

### Performance Improvements
- [ ] Virtual scrolling for very large comment lists
- [ ] Image lazy loading for avatars
- [ ] Background comment prefetching
- [ ] Optimized re-render patterns