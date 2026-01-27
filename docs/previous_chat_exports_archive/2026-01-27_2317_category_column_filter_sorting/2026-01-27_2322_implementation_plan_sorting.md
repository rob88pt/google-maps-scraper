# Server-Side Sorting Implementation Plan

The objective is to move sorting logic from client-side (local page results) to server-side (entire dataset) for the Leads table.

## Proposed Changes

### [Component] [LeadsTable](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- [MODIFY] Add `sorting` and `onSortingChange` to `LeadsTableProps`.
- [MODIFY] Use provided `sorting` and `onSortingChange` in `useReactTable` instead of local state.
- [MODIFY] Synchronize sort state with parent component.

### [Page] [LeadsPage](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
- [MODIFY] Initialize `sorting` state using `useState<SortingState>([{ id: 'created_at', desc: true }])`.
- [MODIFY] Update `queryOptions` to derive `sortBy` and `sortOrder` from the `sorting` state.
- [MODIFY] Pass `sorting` and `setSorting` to the `LeadsTable` component.

### [API] [Leads API Route](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/route.ts)
- [MODIFY] Update `validSortFields` mapping to include `input_id` and rename `rating` to `review_rating` to match table column keys.

### [Hook] [useLeads Hook](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/lib/hooks/use-leads.ts)
- [MODIFY] Update `sortBy` type definition to include `input_id` and `review_rating`.

## Verification Plan

### Manual Verification
- Click on the "Name" column header and verify results are sorted alphabetically on the server (check network tab for API request).
- Click on the "Category" column header and verify sorting.
- Click on "Rating" and "Query" (input_id) and verify sorting.
- Ensure that sorting correctly resets pagination or works across pages.
