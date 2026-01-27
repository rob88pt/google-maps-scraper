# Implementation Plan - Fix Duplicate Close Buttons

The `LeadDetailPanel` currently explicitly renders a close button. When the application uses the `Sheet` component for lead details on smaller viewports, a second close button is automatically provided by the `Sheet` UI. This results in two "X" icons in the top-right corner.

This plan introduces a flag to conditionally hide the panel's internal close button when rendered in an overlay context.

## Proposed Changes

### [Component Name] Lead Detail View

#### [MODIFY] [lead-detail-panel.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)
- Update `LeadDetailPanelProps` interface to include `showCloseButton?: boolean`.
- Wrap the close button `<Button>` in the header with a conditional check for `showCloseButton`.
- Default `showCloseButton` to `true` to maintain existing behavior for the sidecar panel.

#### [MODIFY] [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
- In the `Sheet` overlay section, update the `LeadDetailPanel` component call to pass `showCloseButton={false}`.

## Verification Plan

### Manual Verification
- **Browser Testing**: 
    1. Navigate to `http://localhost:3000/leads`.
    2. **Desktop Mode**: Ensure window width is >1280px. Click a lead and verify exactly one "X" button is present in the sidecar panel.
    3. **Overlay Mode**: Resize window to <1280px (e.g., 1000px). Click a lead and verify exactly one "X" button (the vertical Sheet close button) is present.
- **Visual Check**: capture screenshots to confirm the fix across different viewports.
