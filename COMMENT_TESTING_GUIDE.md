# TikTok Comments Testing Guide

## 🚨 Issue: Old Comment UI Still Showing

If you're still seeing the old comment section UI instead of the new TikTok-style design, follow these steps:

## 🔄 Step 1: Clear Cache & Restart

### For Expo Development
```bash
# Clear Expo cache
npx expo start --clear

# Or if using yarn
yarn start --clear

# Force restart the development server
npx expo r --clear
```

### For React Native CLI
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clean and rebuild
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

## 🔍 Step 2: Verify Implementation

### Check Component Imports
The following files should be using the updated `CommentsSection`:

1. ✅ `VideoFeed.tsx` - Uses `UnifiedVideoPlayer` with TikTok comments
2. ✅ `VideoItem.tsx` - Updated with new props
3. ✅ `VideoPlayer.tsx` - Updated with new props  
4. ✅ `UnifiedVideoPlayer.tsx` - Updated with new props
5. ✅ `GlobalVideoPlayer.tsx` - Uses updated components

### Verify Props
All `CommentsSection` components should have these props:
```tsx
<CommentsSection
  onClose={() => setShowCommentsModal(false)}
  videoId={videoData._id}
  commentss={videoData.comments}
  longVideosOnly={videoData.type === "long"}
  onPressUsername={(userId) => {
    // Navigate to user profile
    console.log('Navigate to user profile:', userId);
  }}
  onPressTip={(commentId) => {
    // Open tip modal
    console.log('Open tip modal for comment:', commentId);
  }}
/>
```

## 🧪 Step 3: Test with Demo Components

### Test 1: Standalone Comments Demo
```tsx
import TikTokCommentsDemo from '@/components/TikTokCommentsDemo';

// Add this to any screen to test
<TikTokCommentsDemo />
```

### Test 2: Global Video Player Demo
```tsx
import GlobalVideoPlayerDemo from '@/components/GlobalVideoPlayerDemo';

// Add this to any screen to test
<GlobalVideoPlayerDemo />
```

### Test 3: Comment Test Component
```tsx
import CommentTestComponent from '@/components/CommentTestComponent';

// Add this to any screen to test
<CommentTestComponent />
```

## 🎯 Step 4: Visual Verification Checklist

When you open comments, you should see:

### ✅ TikTok-Style Design
- [ ] Dark background (#0E0E0E)
- [ ] Rounded top corners (36px radius)
- [ ] Drag handle at top (56x4px gray bar)
- [ ] "Comments" title centered (22px, bold)
- [ ] Backdrop overlay (rgba(0,0,0,0.6))

### ✅ Comment Layout
- [ ] 44px circular avatars on left
- [ ] Username in white (14px, semi-bold)
- [ ] Comment text in white (16px)
- [ ] Time/meta text in gray (#9E9E9E, 13px)
- [ ] Right action column (68px width) with:
  - [ ] Currency icon (₹) in gold (#FFD24D)
  - [ ] Upvote arrow (↑) 
  - [ ] Downvote arrow (↓)
  - [ ] Counts below each icon (12px)

### ✅ Input Bar
- [ ] Rounded input (28px radius, 52px height)
- [ ] Attach icon on left (📎)
- [ ] Placeholder: "Add comment........."
- [ ] Send button on right (40px circular outline)

### ✅ Interactions
- [ ] Drag down to dismiss
- [ ] Tap username → console log
- [ ] Tap currency → console log
- [ ] Tap reply → input focuses with @mention
- [ ] Upvote/downvote → micro animation
- [ ] "View replies" → expands/collapses

## 🐛 Step 5: Troubleshooting

### If Still Showing Old UI:

1. **Check File Paths**: Ensure all imports point to the correct files
2. **Restart Development Server**: Clear all caches
3. **Check Console**: Look for any import errors
4. **Verify Component**: Check if `CommentSection.tsx` has the new TikTok-style code

### Common Issues:

#### Issue: Import Error
```
Error: Cannot resolve module '@/app/(dashboard)/long/_components/CommentSection'
```
**Solution**: Restart development server with cache clear

#### Issue: Props Error
```
Error: Property 'onPressUsername' does not exist
```
**Solution**: Ensure you're using the updated `CommentSection.tsx`

#### Issue: Old UI Still Shows
**Solution**: 
1. Force close the app completely
2. Clear development server cache
3. Restart development server
4. Rebuild the app

## 📱 Step 6: Platform-Specific Testing

### iOS
```bash
npx expo run:ios --clear
```

### Android  
```bash
npx expo run:android --clear
```

## 🔧 Step 7: Manual Verification

If automated testing doesn't work, manually check these files:

1. Open `Strmly-Mobile/app/(dashboard)/long/_components/CommentSection.tsx`
2. Verify it contains the TikTok-style UI code (should have `#0E0E0E` background)
3. Check that it has the new props interface with `onPressUsername` and `onPressTip`

## ✅ Success Indicators

You'll know it's working when:
- Comments sheet slides up from bottom with smooth animation
- Dark theme with proper TikTok-style colors
- Drag handle visible at top
- Right action column with currency/vote icons
- Proper typography and spacing
- Console logs when tapping usernames/currency

## 🆘 Still Not Working?

If you're still seeing the old UI after following all steps:

1. **Check Git Status**: Ensure all files are saved and committed
2. **Restart IDE**: Close and reopen your development environment  
3. **Clean Install**: Delete `node_modules` and reinstall
4. **Check Branch**: Ensure you're on the correct branch with updates

The implementation is complete and should work. The issue is likely caching or the development server needs a fresh restart with cache clearing.