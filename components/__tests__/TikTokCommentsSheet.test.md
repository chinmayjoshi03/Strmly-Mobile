# TikTok Comments Sheet - Manual Test Steps

## Visual Tests
1. **Bottom Sheet Appearance**
   - [ ] Sheet appears from bottom with smooth spring animation
   - [ ] Background overlay is rgba(0,0,0,0.6)
   - [ ] Sheet has 36px top border radius
   - [ ] Drag handle is 56x4px, centered, gray color
   - [ ] Title "Comments" is centered, 22px, weight 700
   - [ ] Sheet background is #0E0E0E

2. **Comment Layout**
   - [ ] Avatar is 44px circle on left
   - [ ] Username is 14px semi-bold
   - [ ] Comment text is 16px
   - [ ] Time/reply text is 13px muted #9E9E9E
   - [ ] Right action column is fixed 68px width
   - [ ] Icons are ~22px with counts 12px below

3. **Input Bar**
   - [ ] Height is 52px with 28px border radius
   - [ ] Attach icon on left
   - [ ] Placeholder "Add comment........."
   - [ ] Send button is 40px circular outline

## Interaction Tests
1. **Drag to Dismiss**
   - [ ] Can drag sheet down to dismiss
   - [ ] Springs back if drag is insufficient
   - [ ] Smooth animation on dismiss

2. **Reply Functionality**
   - [ ] Tapping "Reply" focuses input and prefills @username
   - [ ] Can cancel reply
   - [ ] Reply indicator shows correctly

3. **Expand/Collapse Replies**
   - [ ] "View replies (n)" toggles expansion
   - [ ] Replies indent by 56px
   - [ ] Reply avatars are 32px
   - [ ] Smooth height animation

4. **Voting**
   - [ ] Upvote/downvote toggles with micro animation
   - [ ] Scale + color change animation
   - [ ] Counts update locally

5. **Tip Modal**
   - [ ] Tapping currency icon triggers onPressTip callback
   - [ ] Callback receives correct commentId

6. **Username Navigation**
   - [ ] Tapping username triggers onPressUsername callback
   - [ ] Callback receives correct userId

## Accessibility Tests
1. **Touch Targets**
   - [ ] All interactive elements have minimum 44px tap area
   - [ ] Icons have proper accessibilityLabel

2. **Screen Reader**
   - [ ] All buttons have descriptive labels
   - [ ] Content is properly announced

## Performance Tests
1. **FlatList Performance**
   - [ ] Uses keyExtractor properly
   - [ ] removeClippedSubviews enabled
   - [ ] Smooth scrolling with many comments

2. **Animation Performance**
   - [ ] Staggered fade-in for list items
   - [ ] Smooth micro animations for votes
   - [ ] No frame drops during sheet animations

## Keyboard Handling
1. **Input Behavior**
   - [ ] Input stays pinned above keyboard
   - [ ] List scrolls to keep replied comment visible
   - [ ] Keyboard dismisses properly

## Color Tokens Validation
- [ ] Sheet background: #0E0E0E
- [ ] Primary text: #FFFFFF
- [ ] Secondary text: #9E9E9E
- [ ] Currency accent: #FFD24D
- [ ] Upvote active: #FF3B30
- [ ] Mention/link: #2A6EF7 (if applicable)

## Edge Cases
1. **Empty States**
   - [ ] Shows "No comments yet" message
   - [ ] Shows "No replies yet" for empty reply sections

2. **Loading States**
   - [ ] Shows loading spinner while fetching
   - [ ] Shows loading in send button while submitting

3. **Error Handling**
   - [ ] Graceful error handling for failed requests
   - [ ] User feedback for errors