# Active Context

## Recent Changes
- **[2026-01-27]** Implemented Dynamic Column Reordering (DND + Keyboard menu sync) with refined 4px spacing and right-aligned sorting icons.
- **[2026-01-27]** Implemented Server-Side Sorting for Leads Table (Name, Category, Rating, Query).
- **[2026-01-27]** Implemented Category Column & Filter dropdown with counts.
- **[2026-01-27]** Enabled text wrapping in Leads Table cells and updated terminology to "results".
- **[2026-01-27]** Fixed Leads Table scrolling issue by enabling internal vertical overflow and implementing sticky headers.
- **[2026-01-27]** Refined Leads UI by removing redundant header and moving lead count to the filter bar.
- **[2026-01-27]** Consolidated Leads toolbar: Lifted column visibility state and moved 'Columns' selector to the main filter bar.
- **[2026-01-27]** Implemented Laptop/Desktop Responsiveness: Root layout refactor, responsive side-panel/overlay toggle.
- **[2026-01-27]** Added "Website" column to Leads Table with truncated links.
- **[2026-01-27]** Implemented CRM status and Notes feed.

## Current Focus
- Verification: Highly successful verification of dynamic column reordering and category filtering.
- System Testing: Verifying end-to-end stability for sync and decoupled scraper from DB.

## Next Steps
1. **Stability Testing**: Run a production-like job to verify end-to-end stability (scraper -> NDJSON -> Supabase sync).
2. **Review Feedback**: Confirm with user if the unified header layout (right-aligned sorting icons) meets their preferences for the entire table.

## Session Notes
- Pivot: User requested to prioritize stability, search/filtering correctness, and verifying existing features over adding new CRM capabilities.
- "Review Field Casing" is preserved as a high-priority bug content.
