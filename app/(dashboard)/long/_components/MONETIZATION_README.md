# Comment Monetization Feature with Real-time Updates

## Overview
The comment monetization feature allows users to conditionally display the rupee (tip) icon in the comment section based on their monetization settings. The system now supports real-time updates without requiring app reload.

## API Endpoint
- **URL**: `http://localhost:8080/api/v1/user/monetization-status`
- **Method**: GET
- **Headers**: Authorization: Bearer {token}

## Response Format
```json
{
  "message": "User comment monetization status retrieved successfully",
  "comment_monetization_status": true,
  "video_monetization_status": false
}
```

## Implementation

### 1. Global Store (`useMonetizationStore.ts`)
```typescript
// Zustand store for global monetization state management
export const useMonetizationStore = create<MonetizationStore>((set, get) => ({
  // Handles caching, loading states, and real-time updates
}))
```

### 2. Custom Hook (`useMonetization.ts`)
```typescript
export const useMonetization = () => {
  // Returns: commentMonetizationEnabled, videoMonetizationEnabled, loading, error, refetch
  // Automatically refreshes when app comes to foreground
}
```

### 3. Utility Functions (`monetizationUtils.ts`)
```typescript
// Force refresh from API
export const refreshMonetizationStatus = async (token: string) => void

// Optimistic local updates
export const updateMonetizationStatus = (updates: Partial<MonetizationStatus>) => void
```

### 4. Comment Section Integration (`CommentSection.tsx`)
- Uses global store for monetization status
- Conditionally renders rupee icon based on `comment_monetization_status`
- Updates automatically without component remount

## Real-time Update Behavior

### Automatic Updates
- ✅ Status refreshes when app comes to foreground
- ✅ Changes reflect immediately without app reload
- ✅ 30-second caching prevents excessive API calls
- ✅ Global state shared across all components

### When `comment_monetization_status: true`
- ✅ Rupee icon is displayed in comments
- ✅ Users can tip comment authors
- ✅ Donation counts are visible

### When `comment_monetization_status: false`
- ❌ Rupee icon is hidden
- ❌ Tipping functionality is disabled
- ❌ Donation counts are not shown

### Settings Integration Example
```typescript
// In a settings screen
const updateSetting = async (enabled: boolean) => {
  // 1. Optimistic update for immediate UI response
  updateMonetizationStatus({ comment_monetization_status: enabled });
  
  // 2. API call to save setting
  await saveMonetizationSetting(enabled);
  
  // 3. Refresh to ensure consistency
  await refreshMonetizationStatus(token);
};
```

## Testing

### 1. Using Test Component
```typescript
import MonetizationTestComponent from '@/components/MonetizationTestComponent';

// Add to any screen for testing
<MonetizationTestComponent />
```

### 2. Debug Mode
- In development mode, the comment section shows monetization status
- Look for "Monetization: ON/OFF" text in the comments header

### 3. Manual Testing
1. Open video with comments
2. Check if rupee icons appear/disappear based on API response
3. Verify API call in network logs
4. Test with different monetization status values

## Files Created/Modified
- `store/useMonetizationStore.ts` - Global Zustand store
- `utils/monetizationUtils.ts` - Utility functions for monetization management
- `api/user/userActions.ts` - Added monetization API call
- `app/(dashboard)/long/_components/CommentSection.tsx` - Conditional rupee icon display
- `app/(dashboard)/long/_components/useMonetization.ts` - Updated hook using global store
- `components/MonetizationTestComponent.tsx` - Enhanced test component
- `examples/MonetizationSettingsExample.tsx` - Settings integration example

## Error Handling
- If API fails, defaults to `comment_monetization_status: false`
- Optimistic updates with rollback on error
- Loading states prevent UI flickering
- Error messages logged to console for debugging

## Performance Considerations
- Global state prevents duplicate API calls across components
- 30-second caching reduces server load
- Optimistic updates for immediate UI feedback
- App state listener for automatic foreground refresh
- Efficient re-renders using Zustand selectors