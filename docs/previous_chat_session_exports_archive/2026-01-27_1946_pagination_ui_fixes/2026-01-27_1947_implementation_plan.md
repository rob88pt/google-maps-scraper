# implementation_plan.md: Fix UI Pagination & Selection Counts

Following the investigation and AI-agent review, we will implement **Option A** to resolve the nested pagination and count discrepancies.

## Proposed Changes

### [Component] Leads Table
- **File:** [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- **Modifications:**
    - Remove `getPaginationRowModel` from `useReactTable` config.
    - Remove the entire pagination and selection info footer (lines 487-513).
    - Ensure the table renders all rows provided by the parent without local paging.

### [Component] Leads Page
- **File:** [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
- **Modifications:**
    - The existing selection count in the header (lines 99-102) is already sufficient and accurate.
    - Ensure the server-side pagination controls (lines 181-207) remain the single source of navigation.

## Verification Plan

### Manual Verification
- [ ] Confirm only one set of "Previous"/"Next" buttons is visible (the ones at the very bottom).
- [ ] Confirm "0 selected" vs "X selected" updates correctly in the header without a second count in the footer.
- [ ] Verify that clicking "Next" correctly loads the next 25 items and updates the "Page X of Y" indicator.
- [ ] Ensure that selection is preserved or handled gracefully when changing pages (standard behavior is that selection is client-side and resets or persists based on row ID).
