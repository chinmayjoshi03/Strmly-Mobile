# Unified Video Player System

## 🎯 Overview

The Unified Video Player System provides a consistent video playback experience across your entire app. Users will experience the same controls, interactions, and behavior whether they're watching videos in the feed, viewing episodes, or previewing content in the studio.

## 🏗️ Architecture

### Core Components

1. **UnifiedVideoPlayer** (`components/UnifiedVideoPlayer.tsx`)
   - Main video player component with all functionality
   - Supports multiple modes: feed, fullscreen, preview, episode, studio
   - Includes all interactions, controls, and overlays

2. **VideoPlayerWrapper** (`components/VideoPlayerWrapper.tsx`)
   - Simplified wrapper components for common use cases
   - Pre-configured players for specific contexts

3. **useUnifiedVideoPlayer** (`hooks/useUnifiedVideoPlayer.ts`)
   - Hook for managing video player state
   - Global context for cross-component video state management

## 🎮 Player Modes

### Feed Mode (`mode="feed"`)
- Full-screen vertical video player
- Includes interactions (like, comment, share, gift)
- Shows video details and creator info
- Supports comments modal
- Auto-tracks viewing history
- Seek gestures (tap left/right to skip ±10s)

```tsx
<UnifiedVideoPlayer
  uri={video.videoUrl}
  videoData={video}
  mode="feed"
  isActive={isActive}
  autoPlay={true}
  showInteractions={true}
  showDetails={true}
  showComments={true}
  setGiftingData={setGiftingData}
  setIsWantToGift={setIsWantToGift}
/>
```

### Episode Mode (`mode="episode"`)
- Full-screen landscape video player
- Shows episode and series information
- Includes back button
- Progress bar and play controls

```tsx
<UnifiedVideoPlayer
  uri={episode.videoUrl}
  mode="episode"
  autoPlay={true}
  episodeTitle="Episode 1: The Beginning"
  seriesTitle="My Series"
  episodeNumber={1}
  seasonNumber={1}
/>
```

### Studio Mode (`mode="studio"`)
- 16:9 aspect ratio player for studio screens
- Optional delete button
- Minimal controls for content management

```tsx
<UnifiedVideoPlayer
  uri={draft.videoUrl}
  mode="studio"
  showDeleteButton={true}
  onDelete={handleDelete}
/>
```

### Preview Mode (`mode="preview"`)
- Compact player for lists and grids
- Basic play/pause controls
- Customizable dimensions

```tsx
<UnifiedVideoPlayer
  uri={video.videoUrl}
  mode="preview"
  style={{ height: 200 }}
  title="Video Title"
/>
```

### Fullscreen Mode (`mode="fullscreen"`)
- Full-screen player with all features
- Can include interactions if video data provided
- Back button to exit

```tsx
<UnifiedVideoPlayer
  uri={video.videoUrl}
  videoData={video}
  mode="fullscreen"
  showInteractions={true}
  showDetails={true}
/>
```

## 🔄 Migration Guide

### Step 1: Replace VideoFeed
```tsx
// Before
<VideoItem
  uri={item.videoUrl}
  videoData={item}
  isActive={index === visibleIndex}
  // ... other props
/>

// After
<UnifiedVideoPlayer
  uri={item.videoUrl}
  videoData={item}
  mode="feed"
  isActive={index === visibleIndex}
  autoPlay={index === visibleIndex}
  showInteractions={true}
  showDetails={true}
  showComments={true}
  // ... other props
/>
```

### Step 2: Replace Episode Players
```tsx
// Before
<VideoView player={player} style={styles.video} />
// + custom controls and overlays

// After
<UnifiedVideoPlayer
  uri={episode.videoUrl}
  mode="episode"
  episodeTitle={episode.name}
  seriesTitle={series.title}
  episodeNumber={episode.episode_number}
  seasonNumber={episode.season_number}
/>
```

### Step 3: Replace Studio Players
```tsx
// Before
<UniversalVideoPlayer
  uri={draft.videoUrl}
  showControls={true}
  style={{ aspectRatio: 16/9 }}
/>

// After
<UnifiedVideoPlayer
  uri={draft.videoUrl}
  mode="studio"
  showDeleteButton={true}
  onDelete={handleDeleteDraft}
/>
```

### Step 4: Update Search Results
```tsx
// Video search results
<UnifiedVideoPlayer
  uri={video.videoUrl}
  mode="preview"
  style={{ height: 120 }}
  title={video.title}
/>
```

### Step 5: Community Video Previews
```tsx
// Community video grids
<UnifiedVideoPlayer
  uri={video.videoUrl}
  mode="preview"
  style={{ aspectRatio: 9/16, height: 200 }}
/>
```

## 🎨 Customization

### Custom Styles
```tsx
<UnifiedVideoPlayer
  uri={video.videoUrl}
  mode="preview"
  style={{
    borderRadius: 12,
    overflow: 'hidden',
    height: 250,
  }}
/>
```

### Event Handlers
```tsx
<UnifiedVideoPlayer
  uri={video.videoUrl}
  mode="feed"
  onPlaybackStatusUpdate={(status) => {
    console.log('Playback status:', status);
  }}
  onVideoEnd={() => {
    console.log('Video ended');
  }}
  onError={(error) => {
    console.error('Video error:', error);
  }}
/>
```

## 🔧 Advanced Usage

### Global Video State Management
```tsx
// Wrap your app with VideoPlayerProvider
<VideoPlayerProvider>
  <App />
</VideoPlayerProvider>

// Use in any component
const { state, actions } = useVideoPlayerContext();

// Control video from anywhere
actions.play();
actions.pause();
actions.setCurrentVideo(newVideo);
```

### Cross-Screen Video Continuity
```tsx
// Save video state when navigating
const { state } = useVideoPlayerContext();
router.push('/video/fullscreen', {
  videoId: state.currentVideo?._id,
  currentTime: state.currentTime,
});

// Resume from saved state
<UnifiedVideoPlayer
  uri={video.videoUrl}
  mode="fullscreen"
  onPlaybackStatusUpdate={(status) => {
    if (status.currentTime === 0 && savedTime > 0) {
      player.currentTime = savedTime;
    }
  }}
/>
```

## 📱 Responsive Design

The unified player automatically adapts to different screen sizes and orientations:

- **Mobile Portrait**: Optimized for feed mode
- **Mobile Landscape**: Switches to fullscreen controls
- **Tablet**: Maintains aspect ratios appropriately
- **Different Screen Densities**: Scales controls and text

## 🚀 Benefits

### For Users
- **Consistent Experience**: Same controls and behavior everywhere
- **Familiar Interface**: Learn once, use everywhere
- **Seamless Transitions**: Smooth navigation between video contexts
- **Unified Interactions**: Like, comment, share work the same way

### For Developers
- **Single Source of Truth**: One component to maintain
- **Reduced Code Duplication**: Reuse instead of recreate
- **Easier Testing**: Test one component thoroughly
- **Consistent Bug Fixes**: Fix once, apply everywhere
- **Faster Development**: Pre-built modes for common use cases

### For Product
- **Better User Retention**: Consistent experience reduces confusion
- **Easier Feature Rollouts**: Add features to one component
- **Improved Analytics**: Consistent tracking across all video contexts
- **Brand Consistency**: Uniform video experience reinforces brand

## 🔄 Implementation Checklist

- [ ] Install UnifiedVideoPlayer component
- [ ] Replace VideoFeed with unified player
- [ ] Update episode players
- [ ] Replace studio video players
- [ ] Update search result video previews
- [ ] Replace community video grids
- [ ] Add VideoPlayerProvider to app root (optional)
- [ ] Test all video contexts
- [ ] Update navigation to use consistent video routes
- [ ] Remove old video player components

## 🎯 Next Steps

1. **Implement the UnifiedVideoPlayer** in your main video feed
2. **Gradually migrate** other video contexts
3. **Test thoroughly** across all use cases
4. **Gather user feedback** on the unified experience
5. **Iterate and improve** based on usage patterns

This unified system will create a seamless, professional video experience that users will love and developers will find easy to maintain and extend.