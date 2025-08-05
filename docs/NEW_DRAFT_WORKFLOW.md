# New Draft Workflow Implementation

## Overview

Implemented a new draft workflow where file selection becomes the last step, allowing users to save drafts without uploading videos and continue later.

## Key Changes

### 1. Upload Flow Modifications

#### New Flow Order:
1. **Format Selection** (Episode/Single) - First step
2. **Episode/Series Selection** (if Episode format)
3. **Video Details** (3 steps: Title/Community, Format, Type)
4. **Final Stage** (Genre, timing)
5. **File Selection** - **MOVED: Now the last step with Save to Draft button**
6. **Upload Progress** - Final step

#### Previous Flow:
1. File Selection → Format → Details → Final → Upload

#### New Flow:
1. Format → Details → Final → File Selection → **Save to Draft** OR **Upload**

### 2. Draft Management

#### Save to Draft Functionality:
- **Button Location**: File selection screen (last step)
- **API Endpoint**: `POST /api/v1/drafts/create-or-update`
- **Data Saved**: All metadata without video file
- **Behavior**: Stays on file selection screen after saving

#### Draft Editing:
- **Navigation**: Click on draft in studio → Opens upload flow from beginning
- **Pre-filled Data**: All previously entered metadata is restored
- **Update Mode**: Can modify any field and save draft again or proceed to upload

### 3. Updated Components

#### `useUploadFlow.ts` Hook:
```typescript
// New state properties
interface UploadFlowState {
  // ... existing properties
  draftId?: string | null;
  isEditingDraft?: boolean;
}

// New functions
const initializeFromDraft = (draftData: any) => { /* ... */ };
const saveToDraft = async () => { /* ... */ };
```

#### `FileSelectScreen.tsx`:
- **NEW**: Added "Save to Draft" button (now the last step)
- Save to Draft button appears when file is selected
- User can save draft and stay on file selection screen

#### Draft Editing (Studio Integration):
- Clicking on draft in studio opens upload flow directly
- No separate draft details screen needed
- Integrates VideoUploadFlow for editing

#### `VideoUploadFlow.tsx`:
- Accepts optional `draftData` prop
- Initializes from draft data on mount
- Handles draft saving workflow

### 4. API Integration

#### Draft Creation/Update:
```typescript
POST /api/v1/drafts/create-or-update
{
  draftId?: string, // For updates
  name: string,
  description: string,
  genre: string,
  type: 'Free' | 'Paid',
  language: string,
  age_restriction: boolean,
  contentType: 'video',
  start_time: number, // in seconds
  display_till_time: number, // in seconds
  communityId?: string,
  seriesId?: string // for episodes
}
```

#### Video Upload (unchanged):
- Still uses 3-step process for final upload
- Draft metadata is used to pre-populate upload data

### 5. User Experience Flow

#### Creating New Content:
1. User starts upload flow
2. Selects format and fills details
3. At final stage, can choose:
   - **Save to Draft**: Saves metadata, returns to studio
   - **Continue to Upload**: Proceeds to file selection

#### Editing Draft:
1. User clicks on draft in studio
2. Upload flow opens at file selection step
3. All previous data is pre-filled
4. User can go back to modify any field
5. Can save updated draft or proceed with upload

#### Completing Draft:
1. User selects video file
2. Upload proceeds with saved metadata
3. Draft is converted to published video

### 6. Navigation Updates

#### Studio Navigation:
```typescript
// Old
router.push(`/studio/components/DraftVideoPlayer?id=${draft.id}`);

// New
router.push(`/studio/draft/${draft.id}`);
```

#### Draft Details Navigation:
- Shows video player if video exists
- Shows upload button if no video
- "Edit Draft" button opens upload flow

### 7. Benefits

1. **Flexible Workflow**: Users can save progress without video
2. **Better UX**: No need to select file first
3. **Draft Management**: Easy to edit and continue drafts
4. **Consistent API**: Uses same upload flow for completion
5. **Data Persistence**: All metadata is preserved

### 8. Technical Implementation

#### State Management:
- `isEditingDraft` flag controls behavior
- `draftId` tracks current draft being edited
- Pre-filled data from draft API response

#### Error Handling:
- Validates draft data on initialization
- Handles API errors gracefully
- Maintains user progress

#### Performance:
- No video processing until final step
- Efficient metadata-only saves
- Reuses existing upload infrastructure

## Usage Examples

### Starting New Upload:
```typescript
<VideoUploadFlow
  onComplete={() => router.back()}
  onCancel={() => router.back()}
/>
```

### Editing Existing Draft:
```typescript
<VideoUploadFlow
  draftData={draftDetails}
  onComplete={() => router.back()}
  onCancel={() => router.back()}
/>
```

### Save to Draft:
```typescript
const handleSaveToDraft = async () => {
  try {
    await saveToDraft();
    onComplete(); // Return to studio
  } catch (error) {
    // Handle error
  }
};
```

## Future Enhancements

1. **Auto-save**: Automatically save draft as user types
2. **Draft Templates**: Save common configurations
3. **Batch Upload**: Upload multiple videos with same metadata
4. **Scheduled Publishing**: Set publish dates for drafts
5. **Collaboration**: Share drafts with team members