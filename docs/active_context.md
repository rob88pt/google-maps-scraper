# Active Context

## Recent Changes
- **[2026-01-28]** **Toolbar UI Optimization**: Removed text labels from "Delete" and "Export" buttons to save horizontal space. Buttons now display icons and selection counts only (e.g., `[Icon] (1)`).
- **[2026-01-28]** Implemented **Bulk Delete Leads**:
  - Added `DELETE /api/leads` endpoint for multi-ID deletion.
  - Created `useDeleteLeads` hook with query invalidation.
  - Developed `DeleteLeadsButton` with confirmation dialog and selection count.
  - Integrated into Leads page toolbar.
- **[2026-01-28]** Resolved **Table Interactivity & Alignment**:
  - Standardized selection column width and centered checkboxes for perfect vertical alignment.
  - Expanded checkbox hit areas to cover the entire selection column cell for easier interaction.
  - Refactored selection to be fully controlled by parent `selectedIds` state, resolving a race condition.
  - Implemented `hasMounted` hydration guard for consistent client/server rendering.
  - Consolidated responsive column defaults in `LeadsPage`.
  - Optimized event propagation to prevent side panel from opening when clicking checkboxes (using `target.closest('[data-slot="checkbox"]')`).
  - Added `pl-4` padding to the selection column for better visual spacing.
- **[2026-01-28]** Implemented **Table Layout Persistence**: Column widths, ordering, and visibility are now saved in `localStorage` and maintained across sessions.
- **[2026-01-28]** Implemented **Search by Query**: Global leads search now includes the original scraping query (`input_id`). Updated the search placeholder for better user guidance.
- **[2026-01-28]** Implemented **Global Glass Scrollbars**: The premium "Glass" aesthetic is now applied automatically to Every scrollable element in the application for a cohesive UI.
- **[2026-01-28]** Added **Dialog Scrolling**: The Job Configuration dialog now includes vertical scrolling, ensuring accessibility on small screens.
- **[2026-01-28]** Implemented **Resend Job**: Users can now duplicate and rerun any existing job via the job queue menu or the job configuration dialog.
- **[2026-01-28]** Fixed **Docker Inactivity Flag**: Automatically appends 'm' suffix to `-exit-on-inactivity` if a raw number is provided, preventing scraper parse errors.
- **[2026-01-28]** Added **Accent-Insensitive Search**: Category search now ignores diacritics (e.g., "cafe" matches "café").
- **[2026-01-28]** Fixed **Category Search Focus**: Resolved an issue where focus was lost while typing in the category filter search box.
- **[2026-01-28]** Implemented **Searchable Category Filter**: Added a search box to the category dropdown with real-time filtering and automatic reset.
- **[2026-01-28]** Refined **Filter Section UI**: Renamed range labels to "Star rating" and "Number of reviews", removed helper text, and added a **Star icon** to the rating section.
- **[2026-01-27]** Implemented CRM status and Notes feed.

## Next Steps
1. **Stability Testing**: Run a production-like job to verify scraper sync reliability.
2. **Batch Operations**: Explore further bulk actions (e.g., bulk status update).

## Session Notes
- Resolved a critical race condition where `LeadsTable` internal selection state was being reset by the parent's initial empty state before synchronization could occur.
- Moving to a fully controlled pattern fixed the issue and simplified the code.
- Hydration mismatch resolved with a mount guard, ensuring stable event listener attachment.
