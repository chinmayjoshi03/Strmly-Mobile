# Strmly Series & Episode Implementation Guide

## Overview

This document outlines the corrected implementation for series and episode upload functionality in the Strmly mobile app. The implementation follows the proper API flow as specified in the requirements.

## 🚨 CRITICAL FIX: ObjectId Validation Issue

### Problem Identified
The "Invalid ID format" error was caused by improper ObjectId validation in the backend. The JWT token contains user IDs that need proper MongoDB ObjectId validation.

### Solution Applied
1. **Backend Authentication Middleware** (`middleware/auth.js`):
   - Added ObjectId validation for decoded user IDs
   - Ensured proper string conversion of ObjectIds
   
2. **Series Controller** (`controller/series.controller.js`):
   - Added ObjectId validation for user IDs in all functions
   - Return empty array instead of 404 for no series found
   
3. **Video Controller** (`controller/video.controller.js`):
   - Added ObjectId validation for user IDs and series IDs
   - Proper error handling for invalid ID formats

## Key Changes Made

### 1. Removed Draft API Usage for Episodes
- **Before**: Episodes were uploaded using `/api/v1/drafts/create-or-update` and `/api/v1/drafts/complete`
- **After**: Episodes now use `/api/v1/video/upload` directly with proper series association

### 2. Proper Series-Episode Association
- Episodes are now properly linked to series during upload
- Series ID is included in the video upload FormData
- Backend automatically handles episode numbering and series updates

### 3. Centralized API Actions
- Created `api/series/seriesActions.ts` for all series-related API calls
- Consistent error handling and response transformation
- Type-safe API interfaces

### 4. Fixed ObjectId Validation
- Added proper MongoDB ObjectId validation throughout the backend
- Prevents "Invalid ID format" errors
- Consistent error handling for malformed IDs

## API Flow

### 1. Create New Series
```typescript
POST /api/v1/series/create
Headers: Authorization: Bearer <token>
Body: {
  "title": "Series Title",
  "description": "Series Description",
  "genre": "Action",
  "language": "english",
  "type": "Free" | "Paid",
  "price": 0 | amount,
  "promisedEpisodesCount": 2
}
```

### 2. Get User's Series
```typescript
GET /api/v1/series/user
Headers: Authorization: Bearer <token>
```

### 3. Upload Episode Video
```typescript
POST /api/v1/video/upload
Headers: Authorization: Bearer <token>
Body: FormData {
  "name": "Episode Title",
  "description": "Episode Description",
  "genre": "Genre",
  "type": "Free" | "Paid",
  "language": "english",
  "age_restriction": "false",
  "communityId": "community_id" (optional),
  "seriesId": "selected_series_id", // KEY: Include series ID
  "is_standalone": "false", // For episodes
  "videoFile": video_file
}
```

## File Changes

### 1. Upload Flow Hook (`app/upload/hooks/useUploadFlow.ts`)
- Removed draft creation and update functions
- Updated `submitUpload` to use `/api/v1/video/upload`
- Added proper series ID inclusion for episodes
- Simplified state management

### 2. Series Actions (`api/series/seriesActions.ts`)
- New file with centralized series API functions
- `createSeries()` - Create new series
- `getUserSeries()` - Get user's series list
- `addEpisodeToSeries()` - Add episode to series (backup method)

### 3. Episode Selection Screen (`app/upload/screens/EpisodeSelectionScreen.tsx`)
- Updated to use new `getUserSeries()` API function
- Improved error handling and loading states

### 4. Series Creation Screens
- `SimpleSeriesCreationScreen.tsx` - Updated to use new API actions
- `SeriesCreationScreen.tsx` - Updated to use new API actions
- Consistent error handling and response transformation

## Implementation Details

### Episode Upload Process
1. User selects "Episode" format
2. User selects existing series or creates new one
3. User fills video details
4. On upload, video is sent to `/api/v1/video/upload` with:
   - `seriesId` in FormData
   - `is_standalone: "false"`
   - All other video metadata

### Backend Handling
The backend automatically:
- Assigns next episode number
- Updates series episode count
- Adds video to series episodes array
- Updates series analytics

### Error Handling
- Authentication errors (401/403)
- Series not found (404)
- Validation errors (400)
- Network errors
- File size limits (413)

## Usage Examples

### Creating a Series
```typescript
import { createSeries } from '@/api/series/seriesActions';

const newSeries = await createSeries({
  title: "My New Series",
  description: "A great series",
  genre: "Action",
  language: "english",
  type: "Free",
  promisedEpisodesCount: 5
});
```

### Uploading an Episode
```typescript
// In upload flow, series ID is automatically included
const formData = new FormData();
formData.append('seriesId', selectedSeries.id);
formData.append('is_standalone', 'false');
// ... other fields

const response = await fetch('/api/v1/video/upload', {
  method: 'POST',
  body: formData
});
```

## Testing Checklist

- [ ] Create new series works
- [ ] Select existing series works
- [ ] Episode upload includes series ID
- [ ] Episodes appear in series after upload
- [ ] Series episode count updates
- [ ] Error handling works for all scenarios
- [ ] Single video upload still works
- [ ] Community association works with episodes

## Migration Notes

### For Existing Drafts
- Existing drafts will continue to work for single videos
- Episodes should no longer use draft API
- Consider migrating existing draft episodes to proper series

### Database Considerations
- Ensure series-video relationships are properly indexed
- Monitor episode numbering for consistency
- Backup data before major changes

## Future Enhancements

1. **Batch Episode Upload**: Upload multiple episodes at once
2. **Episode Reordering**: Allow changing episode order
3. **Season Support**: Full season management
4. **Episode Scheduling**: Schedule episode releases
5. **Analytics**: Detailed episode performance metrics

## Troubleshooting

### Common Issues
1. **Episodes not appearing in series**: Check series ID in upload
2. **Authentication errors**: Verify token validity
3. **File upload failures**: Check file size and format
4. **Series creation fails**: Verify required fields

### Debug Steps
1. Check network requests in developer tools
2. Verify API responses and error messages
3. Check authentication token
4. Validate form data before submission

## API Reference

See the complete API documentation in the backend controller files:
- `Strmly-Backend/controller/series.controller.js`
- `Strmly-Backend/controller/video.controller.js`