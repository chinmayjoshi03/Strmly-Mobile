# Dynamic Community Selection for Video Upload

## Overview
Replaced hardcoded community options in the video upload flow with dynamic fetching from the backend API.

## Implementation

### 1. API Integration
- **Endpoint**: `GET /api/v1/community/all`
- **Response Structure**:
  ```json
  {
    "communities": [
      {
        "_id": "string",
        "name": "string",
        "bio": "string",
        "founder": {...},
        "community_fee_type": "free" | "paid",
        "profile_photo": "string",
        ...
      }
    ],
    "count": number,
    "message": "Communities fetched successfully"
  }
  ```

### 2. New Files Created
- `app/upload/hooks/useCommunities.ts` - Hook for fetching communities
- `debug/testCommunityAPI.js` - Test script for API endpoint

### 3. Modified Files
- `api/community/communityActions.ts` - Added `getAllCommunities` method
- `app/upload/screens/VideoDetailScreen.tsx` - Integrated dynamic community fetching
- `app/upload/components/Dropdown.tsx` - Added disabled state support
- `app/upload/types.ts` - Added disabled prop to DropdownProps
- `app/upload/data/dropdownOptions.ts` - Removed hardcoded communities

### 4. Features
- **Dynamic Loading**: Communities are fetched from the backend API
- **Loading States**: Shows loading indicator while fetching
- **Error Handling**: Graceful fallback if API fails
- **Caching**: Hook caches results and provides refetch functionality
- **Authentication**: Uses auth token from store

### 5. User Experience
- Loading indicator while communities are being fetched
- Error message if fetching fails (with fallback to "No Community" option)
- Disabled dropdown state during loading
- Real community names from the backend

### 6. Fallback Behavior
If the API call fails:
- Shows error message to user
- Falls back to basic "No Community" option
- Allows user to continue with upload flow

## Usage

The `VideoDetailScreen` now automatically fetches and displays real communities:

```tsx
const { communities, loading, error } = useCommunities();

// Communities are automatically converted to dropdown format:
// [
//   { label: 'No Community', value: 'none' },
//   { label: 'Tech Talk', value: '507f1f77bcf86cd799439011' },
//   { label: 'Startup India', value: '507f1f77bcf86cd799439012' },
//   ...
// ]
```

## Testing

Run the test script to verify the API endpoint:
```bash
node debug/testCommunityAPI.js
```

## Backend Requirements

The backend must have:
1. `/api/v1/community/all` endpoint implemented
2. Proper authentication middleware
3. Community model with required fields (name, _id)

## Future Enhancements

1. **Search Functionality**: Add search/filter for large community lists
2. **Pagination**: Handle large numbers of communities
3. **Caching**: Implement more sophisticated caching strategy
4. **Offline Support**: Cache communities for offline usage
5. **Community Icons**: Display community profile photos in dropdown