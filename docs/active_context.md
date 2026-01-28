# Active Context

## Recent Changes
- **[2026-01-28]** Implemented **Global Glass Scrollbars**: The premium "Glass" aesthetic is now applied automatically to Every scrollable element in the application for a cohesive UI.
- **[2026-01-28]** Added **Dialog Scrolling**: The Job Configuration dialog now includes vertical scrolling, ensuring accessibility on small screens.
- **[2026-01-28]** Implemented **Resend Job**: Users can now duplicate and rerun any existing job via the job queue menu or the job configuration dialog.
- **[2026-01-28]** Fixed **Docker Inactivity Flag**: Automatically appends 'm' suffix to `-exit-on-inactivity` if a raw number is provided, preventing scraper parse errors.
- **[2026-01-28]** Added **Accent-Insensitive Search**: Category search now ignores diacritics (e.g., "cafe" matches "café").
- **[2026-01-28]** Fixed **Category Search Focus**: Resolved an issue where focus was lost while typing in the category filter search box.
- **[2026-01-28]** Implemented **Searchable Category Filter**: Added a search box to the category dropdown with real-time filtering and automatic reset.
- **[2026-01-28]** Refined **Filter Section UI**: Renamed range labels to "Star rating" and "Number of reviews", removed helper text, and added a **Star icon** to the rating section.
- **[2026-01-28]** Optimized **Filter UI Columns**: Moved Rating and Reviews ranges to a side-by-side layout.
- **[2026-01-28]** Implemented **Review Count Range Filter**: Added min/max review count filtering to frontend and backend.
- **[2026-01-28]** Overhauled **Filter UI**: Moved Web Presence to top and organized filters with section headers (Quality, Contact, Media).
- **[2026-01-28]** Added **"No Reviews" Filter**: Enabling targeting of leads with 0 reviews.
- **[2026-01-28]** Implemented **Website Type Filter** (Option A): Replaced website toggles with a dropdown for Proper Site, Social Only, and No Website.
- **[2026-01-28]** Implemented Social Media Icons (Facebook, Instagram, Twitter) in the Website column and enhanced search logic to include non-empty website URLs.
- **[2026-01-28]** Added Copy Buttons to Name, Category, Query, and Location columns.
- **[2026-01-28]** Refined Location column display (Semibold Title / Street Subtitle) and added Copy Button.
- **[2026-01-28]** Fixed Table scrolling and sticky headers by resolving nested overflow conflicts and flex hierarchy in `page.tsx`.
- **[2026-01-28]** Refined UI Density: Reduced vertical spacing and synchronized typography colors for a cleaner, more industrial look.
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
- Completed **Filter Section UI Overhaul**: Searchable categories, accent-insensitive search, and premium glass scrollbars.
- Completed **Resend Job**: Duplication logic for failed/completed scraping tasks.

## Next Steps
1. **Stability Testing**: Run a production-like job to verify the fix for the `exit-on-inactivity` flag and the general sync reliability.
2. **Review Feedback**: Confirm with user if the global "Glass" scrollbar aesthetic meets their preference for the entire application.

## Session Notes
- Pivot: User requested to prioritize stability, search/filtering correctness, and verifying existing features over adding new CRM capabilities.
- "Review Field Casing" is preserved as a high-priority bug content.
