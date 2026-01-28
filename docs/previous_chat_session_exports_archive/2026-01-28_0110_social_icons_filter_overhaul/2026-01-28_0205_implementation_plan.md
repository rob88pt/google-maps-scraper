# Filter UI Overhaul & "No Reviews" Filter

This plan involves a major reorganization of the filter sidebar/popover to prioritize web presence and add a new "No Reviews" toggle.

## Proposed Changes

### [Component] [leads-filters](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-filters.tsx)
-   **State**: Add `hasReviews` and `noReviews` to `LeadsFilters` interface.
-   **Layout Reorganization**:
    -   **Web Presence**: Move to the top (All, Proper Site, Social Only, No Website).
    -   **Quality**: Group "Rating Range" and new "Reviews" toggles.
    -   **Contact Info**: Group "Has Email" and "No Email".
    -   **Media**: Group "Has Photos".
-   **UI Design**: Use subtle section titles (e.g., small, uppercase, muted labels with separators).

### [Hook] [useLeads](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/lib/hooks/use-leads.ts)
-   Add `hasReviews` and `noReviews` to `LeadsQueryOptions`.
-   Update `fetchLeads` to include these in the URL parameters.

### [API] [leads/route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/route.ts)
-   Parse `hasReviews` and `noReviews` from search parameters.
-   **Logic**:
    -   `hasReviews`: Filter where `data->review_count` > 0.
    -   `noReviews`: Filter where `data->review_count` = 0 or is null.

### [Page] [leads/page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
-   Update filter state passing to include new review toggles.

## Verification Plan

### Automated Tests
-   Verify backend filtering for `review_count` via direct API calls or browser testing.

### Manual Verification
-   [ ] Open Filters popover.
-   [ ] Verify "Web Presence" is at the top.
-   [ ] Click "No Website" and verify results.
-   [ ] Toggle "No Reviews" and verify results show leads with 0 reviews.
-   [ ] Verify "Has Reviews" shows leads with >0 reviews.
