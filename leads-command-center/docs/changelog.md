# Changelog

## [2026-01-29] - Archive System & Multi-User CRM Fixes

### Added
- **Soft-Archive System**: Replaced permanent deletion with a shared archiving mechanism.
- **leads_with_status View**: Created a database view to properly join and filter leads by status, overcoming PostgREST's join filtering limitations.
- **Status Filter**: Implemented a 3-way UI filter for "Active", "Archived", and "All" leads.
- **Unarchive API**: Created `/api/leads/unarchive` endpoint for restoring leads.
- **Toast Notifications**: Added comprehensive feedback for all archive/unarchive actions.

### Fixed
- **Foreign Key Constraints**: Resolved a critical issue where `lead_status` and `lead_notes` had restrictive composite keys that prevented users from managing leads they didn't personally scrape.
- **RLS Policies**: Relaxed RLS on the `results` table to enable collaborative lead management among authenticated users.
- **Method Not Allowed (405)**: Resolved API failure when restoring leads from the row actions menu.

## [2026-01-29] - CRM Phase 1: Backend & Persistence

### Added
- **CRM Metadata Integration**: Enriched `/api/leads` response with `crm_status` and `notes_count` per lead using table joins.
- **Archived Status Support**: Updated `lead_status` table constraints to allow `'archived'` status.
- **API Persistence Fixes**: Updated Lead Notes and Lead Status API handlers to correctly persist `user_id` from the auth session.

### Added
- **Lead Detail Panel Condensation**: Optimized the side panel by reducing general padding (`p-4` to `p-3`) and tightening vertical section spacing (`space-y-3`).
- **Layout Refinement**: Moved Quick Actions to the top for better utility and moved Reviews/Metadata to the bottom.
- **Infinite Scrolling**: Implemented `useInfiniteQuery` in `useLeads` hook and `IntersectionObserver` in `LeadsTable` for seamless data loading.
- **Phased CRM Plan**: Documented a 4-phase plan for advanced CRM features including status-colored checkboxes and archiving.
- **Search & Filter Templates (Presets)**: Full CRUD for UI state templates (filters, columns, search, sorting) with visual feedback and drift detection.
    - Deletion confirmation dialog for safety.
    - Helpful empty state with onboarding hint.
- **Visual Feedback**:
    - Active indicators (blue theme + badges) for Category and Preset filters.
    - Robust drift detection using `useRef` comparison to prevent visual state race conditions.
- **Documentation & History Restoration**:
    - Consolidated over a week of missing project history from root `docs/` into the command center.
    - Created a comprehensive `changelog_summary.md` covering the entire project duration (Jan 23 - present).
    - Unified `active_context.md` and `task_list.md` to reflect the complete project scope.

### Changed
- Integrated `SearchPresetManager` into the `LeadsPage` toolbar.
- Added detailed server-side logging to `api/search-templates` to track operations and debug mysterious deletions.

### Fixed
- Fixed regression in modal image previews by adding `priority` loading support to `LazyImage`.
- Fixed research/gallery preview regression where images in modals failed to load due to `LazyImage` intersection observer logic.
- Fixed a race condition where applying a preset would immediately clear the "active" indicator due to state update latency.
- Removed redundant dividers and refined separator colors for a cleaner, high-density look.

## [2026-01-28] - Bulk Delete & Table Interactivity Refinements

### Added
- **Bulk Delete Leads**:
  - Implemented `DELETE /api/leads` endpoint for multi-ID deletion.
  - Created `useDeleteLeads` hook with TanStack Query invalidation for real-time UI refresh.
  - Developed `DeleteLeadsButton` with confirmation dialog, selection count, and destructive styling.
  - Integrated delete functionality into the Leads page toolbar, conditionally visible on selection.
- **Table Interactivity Fixes**:
  - Optimized `TableRow` click handler to ignore clicks on interactive elements (buttons, links, checkboxes) using `target.closest()`, preventing the side panel from activating unintentionally.
  - Added `pl-4` padding to the selection column in `LeadsTable` for improved visual spacing and hit area.
  - Switched table row identification to use unique lead IDs (`getRowId`) to ensure selection state persists correctly after data mutations.
- **Layout Persistence**: Column widths, ordering, and visibility are now saved in `localStorage`.
- **useLocalStorage Hook**: Created a SSR-safe hook for persisting state between sessions.
- **"No Reviews" Filter**: Added a specific toggle to find leads with zero reviews.
- **Social Media Icons**: 
    - Implemented platform-specific icons (Facebook, Instagram, Twitter) in the Website column.
    - Used color-coded icons (Blue for Facebook, Pink for Instagram, Sky for Twitter) for quick visual identification.

### Changed
- **Toolbar UI Optimization**: Removed text labels from action buttons in the toolbar ("Delete", "Export").
- **Filter UI Overhaul**: Reorganized Rating and Reviews filters into a two-column grid.
- **Website Type Filter**: Replaced basic checkboxes with a consolidated dropdown (Proper Sites, Social Only, No Website).

### Fixed
- **Row Selection Sync**: Resolved selection state inconsistencies after bulk actions.
- **Sticky Table Headers**: Resolved issue where headers would not stay pinned by removing redundant nested overflows.
- **UI Density**: Reduced vertical padding and margins for a more compact design.
- **Robust Image Loading**: Implemented `LazyImage` with exponential backoff and jitter to solve CDN rate-limiting issues.

## [2026-01-27] - Dynamic Column Reordering & Category Filtering

### Added
- **Dynamic Column Reordering**: Native HTML5 Drag and Drop for table columns via Grip handles.
- **Category Column & Filter**: Dedicated column and dynamic filter dropdown with per-category result counts.
- **Server-Side Sorting**: Support for sorting Name, Category, Rating, and Query across large datasets.
- **Website Column**: Added Globe icon + truncated link with click propagation protection.
- **Leads Table Scrolling**: Fixed CSS clipping and implemented sticky headers.
- **Fluid Layout Implementation**: Migrated to `flex flex-col h-screen overflow-hidden` and added Radix-based overlay Drawer for mobile views.

### Changed
- **Terminology**: Updated "leads" to "results" across the UI.
- **UI Refinement**: Removed redundant category subtitles from business names.

### Fixed
- **Nested Pagination**: Removed client-side row limits and consolidated into server-side page controls.
- **CRM Backend**: Resolved status/notes save failures by removing improper auth constraints.
- **Scraper Alignment**: Reverted unintentional JSON tag casing in `source/gmaps/entry.go`.

## [2026-01-25] - UI Enhancements & Image Preview

### Added
- **Full Screen Image Preview**: Radix-based high-quality image overlay with micro-animations.
- **Session Tracking**: Initialized the first comprehensive session export system.

## [2026-01-24] - Filtering Fixes & Scraper Improvements

### Added
- **Preset Management**: Overwrite/Delete confirmation and accessibility improvements for job forms.
- **Flag Tooltips**: Descriptive hints for all scraper flags.
- **Job Configuration View**: Dialog to view parameters used for completed/active jobs.

### Fixed
- **Leads Filtering**: Fixed City search (JSONB path), Has Photos, and Has Email filter logic.
- **Scraper Data Quality**: Filtered out "Report this photo" and profile pictures from review data.
- **Unique Constraints**: Fixed lead synchronization failure when running the same job twice.
- **Auth Reliability**: Added missing `user_id` and auth checks to Preset API.

## [2026-01-23] - Infrastructure & Foundation

### Added
- **JSON+Sync Architecture**: Post-processing workflow decoupling web app from upstream scraper.
- **Docker CP Integration**: Workaround for WSL2 bind mount issues.
- **Sync API**: NDJSON parser to insert scraper results into Supabase.
- **Authentication**: Login/Signup pages with Supabase Auth integration.
- **Real-time Monitoring**: Polling-based job status and "LIVE" badges.
- **Project Foundation**: Next.js 16.1, shadcn/ui, TanStack Query, and standard migration schema.
