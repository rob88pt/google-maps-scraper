# Active Context

## Recent Changes
- **[2026-01-27]** Fixed Leads Table scrolling issue by enabling internal vertical overflow and implementing sticky headers.
- **[2026-01-27]** Refined Leads UI by removing redundant header and moving lead count to the filter bar.
- **[2026-01-27]** Consolidated Leads toolbar: Lifted column visibility state and moved 'Columns' selector to the main filter bar.
- **[2026-01-27]** Implemented Laptop/Desktop Responsiveness: Root layout refactor, responsive side-panel/overlay toggle.
- **[2026-01-27]** Added "Website" column to Leads Table with truncated links.
- **[2026-01-27]** Implemented CRM status and Notes feed.

## Current Focus
- Verification: Waiting for user feedback on the new responsive UI and consolidated toolbar.
- System Testing: Verifying end-to-end stability for sync and decoupled scraper from DB.

## Next Steps
1. **Testing**: Run a production-like job to verify end-to-end stability (scraper -> NDJSON -> Supabase sync).
2. **Review Verification**: Confirm with user if the UI refinements meet their expectations.

## Session Notes
- Pivot: User requested to prioritize stability, search/filtering correctness, and verifying existing features over adding new CRM capabilities.
- "Review Field Casing" is preserved as a high-priority bug content.
