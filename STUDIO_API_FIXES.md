# 🎬 Studio API Fixes - 404 Errors Resolved

## Issue
The studio was getting 404 errors because API endpoints had double `/api/v1` paths:
- Expected: `http://192.168.1.36:8080/api/v1/drafts/all`
- Actual: `http://192.168.1.36:8080/api/v1/api/v1/drafts/all` ❌

## Root Cause
When we updated `CONFIG.API_BASE_URL` to include `/api/v1`, some files still had hardcoded `/api/v1` in their fetch calls, causing the duplication.

## Files Fixed

### 1. ✅ Studio Drafts Hook
**File:** `app/studio/hooks/useStudioDrafts.ts`
```typescript
// Before
fetch(`${CONFIG.API_BASE_URL}/api/v1/drafts/all`)

// After  
fetch(`${CONFIG.API_BASE_URL}/drafts/all`)
```

### 2. ✅ Series Hook
**File:** `app/studio/hooks/useSeries.ts`
```typescript
// Before
fetch(`${CONFIG.API_BASE_URL}/api/v1/series/user`)

// After
fetch(`${CONFIG.API_BASE_URL}/series/user`)
```

### 3. ✅ Delete Actions Hook
**File:** `app/studio/hooks/useDeleteActions.ts`
```typescript
// Before
fetch(`${CONFIG.API_BASE_URL}/api/v1/drafts/${draftId}`)
fetch(`${CONFIG.API_BASE_URL}/api/v1/series/${seriesId}`)
fetch(`${CONFIG.API_BASE_URL}/api/v1/episodes/${episodeId}`)

// After
fetch(`${CONFIG.API_BASE_URL}/drafts/${draftId}`)
fetch(`${CONFIG.API_BASE_URL}/series/${seriesId}`)
fetch(`${CONFIG.API_BASE_URL}/episodes/${episodeId}`)
```

## Expected Results
After these fixes, the studio should:
1. ✅ Load drafts successfully (no more 404 errors)
2. ✅ Load series data correctly
3. ✅ Delete operations work properly
4. ✅ All API calls use correct endpoints

## API Endpoints Now Working
- `GET /api/v1/drafts/all` - Fetch all drafts
- `GET /api/v1/series/user` - Fetch user series
- `DELETE /api/v1/drafts/{id}` - Delete draft
- `DELETE /api/v1/series/{id}` - Delete series
- `DELETE /api/v1/episodes/{id}` - Delete episode

## Testing
To verify the fixes:
1. Open the Studio tab
2. Check that drafts load without 404 errors
3. Switch to Series tab and verify data loads
4. Try deleting a draft or series (if you have any)

The console should now show successful API calls instead of 404 errors.