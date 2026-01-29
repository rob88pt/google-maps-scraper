# Implementation Plan: Fix Gallery Preview Regression

Address the issue where high-resolution image previews in the `LeadDetailPanel` fail to load due to `LazyImage` intersection gating conflicts with Portaled Dialogs.

## Proposed Changes

### UI Components

#### [MODIFY] [lazy-image.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lazy-image.tsx)
- **Priority Mode**: Add a `priority` prop (boolean).
- **Logic Change**: 
    - If `priority` is true:
        - Set `inView` to `true` on mount.
        - Set `loading` to `'eager'` on the `img` tag.
        - Bypass the `IntersectionObserver` registration.
- **Rationale**: Images inside Portals/Modals often miss intersection events or are needed immediately for user-triggered previews.

#### [MODIFY] [lead-detail-panel.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)
- Apply `priority={true}` to:
    - The `LazyImage` inside the `DialogContent` for the gallery preview.
    - The `LazyImage` inside the `DialogContent` for the single thumbnail preview.

## Verification Plan

### Manual Verification
1. **Gallery Preview**: Open a lead, click an image in the gallery, and verify the high-res preview loads instantly.
2. **Thumbnail Preview**: Click the main thumbnail for a lead without a gallery and verify the preview modal loads correctly.
3. **Regression Check**: Verify that standard table thumbnails still lazy-load correctly (skeleton -> image) to ensure `priority={false}` (default) still works.
