# Implementation Plan - Image Preview Navigation

Add navigation arrows (previous/next) inside the full-screen image preview dialog to allow users to browse through business images without closing the preview.

## Proposed Changes

### LeadDetailPanel (`src/components/leads/lead-detail-panel.tsx`)

#### [MODIFY] [lead-detail-panel.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)
-   Refactor `ImageGallery` to include `ChevronLeft` and `ChevronRight` buttons inside the `DialogContent`.
-   Add a `useEffect` hook to handle `keydown` events (ArrowLeft, ArrowRight) when the gallery is active.
-   Ensure the navigation buttons inside the dialog update the same `currentIndex` state as the main gallery.

## Verification Plan

### Manual Verification
1.  Open the Leads app.
2.  Select a lead with multiple images.
3.  Click an image to open the full-screen preview.
4.  **Verify UI**: Large left/right arrows should appear on the sides of the enlarged image.
5.  **Verify Click**: Clicking the arrows should cycle through the images in high resolution.
6.  **Verify Keyboard**: Pressing the physical Left and Right arrow keys on the keyboard should also cycle through the images.
7.  **Verify State Sync**: Close the dialog and ensure the thumbnail in the side panel matches the last image viewed in the preview.
