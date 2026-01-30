# Changelog

## [2026-01-30] - CRM Phase 4 & 5: UI Polishing & Notes Evolution

### Added
- **Notes Editor Modal**: Centered modal with large plain-text editor for full note management.
- **Note CRUD**: Complete backend and frontend support for updating and deleting lead notes.
- **Delete Confirmation**: Secure alert dialog for preventing accidental note deletion.
- **Google Maps Shortcut**: Quick-action button in the Name column for direct access to locations.

### Changed
- **Lead Detail Panel**: Significantly condensed layout with reduced padding and uppercase labels.
- **Header Actions**: Moved Copy/Export JSON and Archive/Restore to the panel header.
- **Note Truncation**: Applied `line-clamp-2` to notes in the side panel for improved vertical density.
- **Data Standardization**: Standardized note IDs to UUID strings across API, hooks, and UI components.

### Files Affected
- `leads-command-center/src/components/leads/note-editor-modal.tsx`
- `leads-command-center/src/components/leads/lead-detail-panel.tsx`
- `leads-command-center/src/components/leads/leads-table.tsx`
- `leads-command-center/src/lib/hooks/use-leads.ts`
- `leads-command-center/src/app/api/leads/[cid]/notes/route.ts`

## [2026-01-29] - CRM Phase 1-3: Archive System & Persistence Fixes

### Added
- **Archive System**: Created `/api/leads/archive` and `/api/leads/unarchive` to replace deletion.
- **Status Filter**: Implemented "Active/Archived/All" 3-state filter in the Leads toolbar.
- **Database View**: Created `leads_with_status` view to enable efficient filtering via PostgREST.

### Fixed
- **Multi-User RLS**: Relaxed restrictive FK constraints and updated RLS policies on `lead_status` and `lead_notes` to allow collaborative management.
- **Status Sync**: Resolved 405 errors during status restoration from the row actions menu.

### Files Affected
- `leads-command-center/src/app/api/leads/archive/route.ts`
- `leads-command-center/src/lib/hooks/use-leads.ts`
- `leads-command-center/src/app/leads/page.tsx`
- `supabase/migrations/` (RLS and schema updates)

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

### Fixed
- **Row Selection Sync**: Resolved issue where selection state could become inconsistent after bulk actions by implementing reactive synchronization between internal table state and parent selection state.

### Changed
- **Toolbar UI Optimization**: Removed text labels ("Delete", "Export") from action buttons in the Leads table toolbar. The buttons now display icons and selection counts only, significantly reducing horizontal space requirements on smaller screens.

### Files Affected
- `leads-command-center/src/app/api/leads/route.ts`
- `leads-command-center/src/lib/hooks/use-leads.ts`
- `leads-command-center/src/components/leads/delete-leads-button.tsx`
- `leads-command-center/src/components/leads/leads-table.tsx`
- `leads-command-center/src/app/leads/page.tsx`

2: 
3: ## [2026-01-28] - Table Layout Persistence
4: 
5: ### Added
6: - **Layout Persistence**: Column widths, ordering, and visibility are now saved in `localStorage`.
7: - **useLocalStorage Hook**: Created a robust, SSR-safe hook for persisting state between sessions.
8: 
9: ### Changed
10: - **LeadsTable Integration**: Updated component to support column sizing and visibility persistence.
11: 
12: ### Files Affected
13: - `leads-command-center/src/lib/hooks/use-local-storage.ts`
14: - `leads-command-center/src/components/leads/leads-table.tsx`
15: - `leads-command-center/src/app/leads/page.tsx`
16: 

## [2026-01-28] - Search by Query Functionality

### Added
- **Query String Search**: Global leads search now includes the original search query (`input_id`). Users can type terms used during the scraping job (e.g., "plumbers") to filter results.
- **Concise Search UI**: Updated search box placeholder to `"Search by name, category, location or query..."` for better clarity.

### Changed
- **Backend Search Logic**: Refined the Supabase `OR` query to cross-reference `data->>input_id` without introducing metadata noise (removed experimental Job ID/Metadata search fields).

### Files Affected
- `leads-command-center/src/app/api/leads/route.ts`
- `leads-command-center/src/app/leads/page.tsx`

## [2026-01-28] - Filter UI Overhaul & "No Reviews" Filter

### Added
- **Side-by-Side Range Filters**: Reorganized Rating and Reviews range filters into a two-column grid to optimize vertical space in the filter menu.
- **Review Count Range Filter**: Added "Min" and "Max" inputs to the filter menu to allow specific targeting of leads based on review volume.
- **Filter UI Reorganization**: 
    - Moved **Web Presence** (Website Type) to the top of the filter menu as the highest priority filter.
    - Organized all filters into logical groups with uppercase subtitles (Web Presence, Quality & Reviews, Contact Setup, Assets).
    - Improved visual density and clarity with subtle separators.
- **"No Reviews" Filter**: Added a specific toggle to find leads with zero reviews, complementing the existing "Has Reviews" logic.
- **Improved Toggles**: Enhanced mutual exclusion for Email and Review toggles (checking one unchecks the other).

## [2026-01-28] - Social Media Icons & Comprehensive Website Filtering

### Added
- **Website Type Filter**: 
    - Replaced basic website checkboxes with a consolidated "Website Type" dropdown/select filter.
    - Added dedicated filtering for "Proper Sites" (excluding social media), "Social Only" (FB/IG/X), and "No Website".
- **Social Media Icons**: 
    - Implemented platform-specific icons (Facebook, Instagram, Twitter) in the Website column.
    - Added human-readable labels ("Facebook Page", "Instagram Profile") for social links to improve table scannability.
    - Used color-coded icons (Blue for Facebook, Pink for Instagram, Sky for Twitter) for quick visual identification.
- **Enhanced Search**:
    - Extended server-side search logic to include the `web_site` field.
    - Users can now search for "facebook", "instagram", or specific domain names to filter leads.

## [2026-01-28] - Table Copy Buttons

### Added
- **Row Copy Buttons**: 
    - Implemented subtle hover-triggered copy buttons for Name, Category, and Query columns.
    - Integrated `sonner` for real-time visual feedback (toast notifications).
    - Added temporary visual state (checkmark) on the copy button itself after successful copy.
- **Logic**: Used `e.stopPropagation()` to prevent copy actions from triggering the lead detail panel.

### Fixed
- **Sticky Table Headers**: Resolved issue where headers would not stay pinned during scroll by removing redundant nested `overflow` containers.
- **Table Layout & Scrolling**: Resolved issue where headers were not sticky and pagination buttons overlapped by removing redundant nested overflows and fixing the flex-direction in `page.tsx`.
- **UI Density**: 
    - Reduced vertical padding and margins around the search bar and pagination for a more compact design.
    - Synchronized text colors between results count and pagination info (Standardized to `text-slate-400`).

### Files Affected
- `leads-command-center/src/components/leads/leads-table.tsx`

## [2026-01-27] - Dynamic Column Reordering

### Added
- **Dynamic Column Reordering**: 
    - Implemented native HTML5 Drag and Drop for table columns via new Grip handles.
    - Added keyboard/accessible reordering via "Move Up/Down" buttons in the "Columns" toggle menu.
    - Synchronized column order between the table view and the toggle menu.
- **Shared State**: Lifted `columnOrder` to the page level to ensure persistence and UI consistency.
- **UI Refinement**: Reduced header and cell padding to exactly 4px (px-1) for a tighter, more data-dense look.

### Fixed
- **Interaction Conflicts**: Prevented row click (detail panel) from firing immediately after a column drag operation.
- **Unified Header Alignment**: Standardized the layout across both sortable and non-sortable columns, ensuring consistent spacing from the grip handle to the label. Sorting icons are now right-aligned within the header cell.
- **Overlap Fix**: Resolved issue where grip handles covered header text by removing negative margins and nested paddings.

## [2026-01-27] - Category Column & Filter dropdown with counts

### Added
- **Category Column**: Added a dedicated column in the Leads table to display business categories.
- **Category Filter**: Implemented a dynamic filter dropdown in the toolbar that shows result counts per category.
- **Server-Side Sorting**: Implemented server-side sorting for all key columns (Name, Category, Rating, Query) to support large datasets across pages.
- **Text Wrapping**: Enabled text wrapping in table columns to prevent truncation of long titles, categories, and locations.
- **API Endpoints**: New `/api/categories` route for aggregating counts and updated `/api/leads` for category filtering.

### Changed
- **Terminology**: Updated "leads" to "results" across the UI (count display and empty state).
- **UI Refinement**: Removed redundant category subtitles from the business name column.

## [2026-01-27] - UI Refinement & Scrolling Fix

### Fixed
- **Leads Table Scrolling**: Resolved issue where the table was clipped by `overflow-hidden` containers. Re-enabled vertical scrolling and implemented **sticky headers** for better data readability.
- **UI Layout**: Removed redundant "Leads" heading from the Leads tab and moved the "XX leads found" indicator into the filter bar, saving significant vertical space.

## [2026-01-27] - Responsiveness & Fluid Layout Implementation

### Added
- **Global Layout Structure**: Migrated to `flex flex-col h-screen overflow-hidden` root layout.
    - Benefits: Prevents double scrollbars, maintains pinned header, delegates scroll to content areas.
- **Responsive Components**:
    - `useMediaQuery`: Hydration-safe hook for breakpoint logic.
    - `Sheet`: Radix-based overlay drawer for lead details on viewports < 1280px.
- **Fluid Jobs Page**: Refactored Jobs page to full-width, eliminating the centered container constraint.

### Fixed
- **Jobs Page "Squeezed" Layout**: Removed the fixed 3-column grid that reserved space for empty columns, allowing the main card to span the full viewport.
- **Duplicate Close Buttons**: Hidden the internal "X" in `LeadDetailPanel` when rendered within a `Sheet` overlay to prevent UI redundancy.
- **Table Column Breakpoints**: Fixed an issue where the 'Query' column wouldn't hide correctly on narrow screens by explicitly setting IDs and refining initialization logic.
- **JSX Syntax**: Fixed unclosed tags and broken formatting in `src/app/page.tsx` introduced during layout refactoring.

### Changed
- **Leads Table**: 
    - Forced `table-fixed` for reliable column width management.
    - Implemented auto-hiding for `input_id` and `indicators` columns on screens < 1280px.
- **Leads Page**: Switched from sidecar panel to overlay drawer at the 1280px breakpoint.

### Files Affected
- `leads-command-center/src/app/layout.tsx`
- `leads-command-center/src/app/page.tsx`
- `leads-command-center/src/app/leads/page.tsx`
- `leads-command-center/src/components/leads/leads-table.tsx`
- `leads-command-center/src/components/leads/lead-detail-panel.tsx`
- `leads-command-center/src/lib/hooks/use-media-query.ts`
- `leads-command-center/src/components/ui/sheet.tsx`


### Added
- **Website Column**: Added a new "Website" column to the `LeadsTable` component.
    - Positioning: Placed between 'Location' and 'Phone'.
    - Features: Displayed as a Globe icon + truncated link, opens in a new tab with `rel="noreferrer"`.
    - UX: Integrated `e.stopPropagation()` to prevent row click when clicking the link.
    - Toggle: Integrated with the "Columns" visibility menu (visible by default).

### Files Affected
- `leads-command-center/src/components/leads/leads-table.tsx`

## [2026-01-27] - Scraper Documentation Alignment

### Fixed
- **Scraper Source**: Reverted unintentional JSON tag additions in `source/gmaps/entry.go` to maintain original casing.
- **Documentation**: Aligned `docs/fork_strategy.md` with the actually implemented state of the Go scraper.

### Changed
- **Fork Strategy**: Removed outdated/ghost requirements (Image Filtering, UTF-8 BOM, standard RPC index fixes) that were not present in the current stable fork.

### Files Affected
- `source/gmaps/entry.go`
- `docs/fork_strategy.md`

## [2026-01-27] - UI Consolidation & Pagination Fix

### Fixed
- **Nested Pagination**: Resolved conflicting pagination controls in `LeadsTable`. Removed client-side row limits and "Previous/Next" buttons, consolidating navigation into the server-side page controls.
- **Selection Count**: Consolidated the selection counter to the page header to prevent "X of 25 row(s)" mismatch in the table footer.

### Removed
- Redundant TanStack Table pagination logic in `leads-table.tsx`.

### Files Affected
- `leads-command-center/src/components/leads/leads-table.tsx`
- `leads-command-center/src/app/leads/page.tsx`


## [2026-01-27] - Map Restoration & CRM Enhancements

### Added
- **CRM Integration**: 
    - Lead status tracking (New, Contacted, Qualified, Closed).
    - Persistent notes feed for internal team communication.
    - `useLeadStatus` and `useLeadNotes` hooks for state management.
- **Map Enhancements**:
    - Circular business thumbnail markers in `MapBase`.
    - Interactive map popups that remain open on hover for link clicks.
    - Map auto-centering on the most recent lead results.
- **Coordinate Picker**:
    - Integrated Nominatim (OSM) search dialog into the New Job form.
    - One-click coordinate population from search results.
- **Table Improvements**:
    - Interactive column resizing with visible drag handles.
    - Removed content truncation and max-width constraints for better viewport usage.

### Fixed
- **CRM Backend**: Resolved status/notes save failures by removing unnecessary auth constraints and fixing column mapping.
- **Data Traceability**: Fixed "Fast Mode" query-to-result mapping in the Go scraper (via `input_id`).

### Files Affected
- `leads-command-center/src/components/ui/map-base.tsx`
- `leads-command-center/src/components/leads/lead-detail-panel.tsx`
- `leads-command-center/src/components/leads/leads-table.tsx`
- `leads-command-center/src/components/jobs/job-form.tsx`
- `leads-command-center/src/app/api/leads/[cid]/status/route.ts`
- `leads-command-center/src/app/api/leads/[cid]/notes/route.ts`


## [2026-01-25] - UI Enhancements & Image Preview

### Added
- **Full Screen Image Preview**: 
    - Implemented a high-quality image preview overlay using `@radix-ui/react-dialog`.
    - Integrated preview triggers for both the main image carousel and fallback thumbnails in the `LeadDetailPanel`.
    - Added subtle micro-animations (scale-up on hover) and cursor cues (`cursor-zoom-in`) to improve discoverability.
- **Session Tracking**: Initialized and finalized the first comprehensive chat session export system for project history reconstruction.

### Changed
- **Lead Detail UI**: Improved interactivity of business images in the side panel.

### Files Affected
- `leads-command-center/src/components/leads/lead-detail-panel.tsx`
- `docs/chat_sessions/` (NEW) - Session tracking directories.


## [2026-01-24] - Filtering Fixes & Image Investigation

### Fixed
- **Leads Filtering**:
    - Fixed **City Search** by correcting the JSONB path to use text extraction (`data->complete_address->>city`).
    - Implemented missing **Has Photos** filter in both the `use-leads` hook and the backend API route.
    - Resolved **Has Email** filter failure by correctly handling JSON `null` values via text extraction (`data->>emails IS NOT NULL AND data->>emails != '[]'`).
- **API Robustness**: Corrected "invalid input syntax for type json" errors by switching from `->` to `->>` for text-based filtering and searches.

### Investigated
- **Broken Images**: 
    - Identified that "Report this photo" links (`www.google.com/local/imagery/report/...`) are being scraped as review images.
    - Confirmed that these links lack protocols, causing 404 errors in the browser when treated as relative paths.
    - Documented a fix plan to filter these out in the Go scraper's `entry.go` file.

### Files Affected
- `leads-command-center/src/app/api/leads/route.ts`
- `leads-command-center/src/lib/hooks/use-leads.ts`
- `docs/walkthrough_filtering.md` (NEW)

---

## [2026-01-24] - Monorepo Transition & Git Setup

### Infrastructure
- **Unified Repository**: Consolidated `docs`, `leads-command-center` (Web App), and `source` (Scraper) into a single git repository at the project root.
- **Git Subtree Strategy**: Configured `upstream-scraper` remote and documented workflow to manage the scraper as a subtree, enabling simpler updates from the original author.
- **Cleanup**: Removed nested `.git` repositories and established a clean `.gitignore` usage.

### Documentation
- **Updated Fork Strategy**: Rewrote `docs/fork_strategy.md` to providing a complete guide on Git Monorepo workflow, Upstream Sync commands, and docker rebuilding steps.

---

## [2026-01-24] - Reverted Review Image Scraping

### Reverted
- **Image Extraction Logic**: Reverted changes in `source/gmaps/reviews.go` and `entry.go` that attempted to extract `lh3.googleusercontent.com` URLs from background images. This feature proved fragile and complex to implement reliably alongside the RPC extraction.
- **Legacy Fallback**: Restored the original legacy image extraction fallback in `entry.go`.

### Kept
- **RPC Path Fix**: Preserved the updated RPC path discovery (`jd[2][0][4]`) in `entry.go` as it provides better compatibility with the current Google Maps response structure.

---

## [2026-01-24] - Review Display & Scraper Fixes

### Fixed
- **Scraper Panic**: Initialized `patterns` map in `gmaps/reviews.go` to solve nil map panic during place ID extraction.
- **Data Quality**:
    - Filtered out "Report this photo" and profile pictures from review images.
    - Improved rating extraction logic in `reviews.go` to correctly parse "5.0" style ratings.
- **Frontend Sync**:
    - Added proper JSON tags to `Review` struct in Go scraper codebase.
    - Updated `src/lib/supabase/types.ts` and `lead-detail-panel.tsx` to handle PascalCase keys (`Name`, `Rating`, etc.) from the scraper to match actual JSON output.
    - Fixed `docker.ts` type definitions to align with real data structure.

### Files Affected
- `leads-command-center/src/lib/supabase/types.ts`
- `leads-command-center/src/components/leads/lead-detail-panel.tsx`
- `leads-command-center/src/lib/docker.ts`
- `source/gmaps/reviews.go`
- `source/gmaps/entry.go`

---

## [2026-01-24] - Review Display & Image Investigation

### Fixed
- **Frontend Review Casting**: Fixed `Review` interface in `src/lib/docker.ts` to use lowercase fields (`name`, `rating`, `description`, etc.) to match the backend JSON serialization.
- **Lead Detail UI**: Ensured reviews are correctly rendered in the side panel with proper field mapping.

### Investigated
- **Missing Review Images**: Analyzed raw `results.json` and confirmed image arrays contain reporting links instead of photo URLs. Identified `parseReviews` in `source/gmaps/entry.go` as the target for index updates.

## [2026-01-24] - Extra Reviews Pipeline Fix

### Fixed
- **Review Struct Serialization**: Added standard `json` tags to the `Review` struct in Go (`gmaps/entry.go`) to ensure matching lowercase keys in the NDJSON extraction.
- **Database Unique Constraint**: Applied a proper `UNIQUE (user_id, cid)` constraint to the `results` table to resolve `ON CONFLICT` mismatches during lead updates.
- **TypeScript Type Safety**: Updated `ScrapedLead` and `Review` interfaces in `src/lib/docker.ts` to reflect the fixed casing and structure.
- **End-to-End Reliability**: Verified that extra reviews are successfully extracted, transferred via NDJSON, and upserted into Supabase.

### Files Affected
- `source/gmaps/entry.go`: Added JSON tags.
- `src/lib/docker.ts`: Updated TypeScript interfaces.
- `Supabase`: Added `results_user_id_cid_key` UNIQUE constraint.

---

## [2026-01-24] - Preset Management & UI Accessibility

### Added
- **Overwrite Preset**: Users can now update existing presets directly from the "New Job" form with a confirmation safety check.
- **Delete Confirmation**: Added an `AlertDialog` to prevent accidental deletion of presets.
- **Accessibility Refinement**: Significantly improved color contrast for 'Overwrite' (Blue) and 'Delete' (Red) action buttons on dark backgrounds.

### Changed
- **API Enhancements**: Implemented `PATCH` method in the presets API to handle partial updates.
- **UI Consolidation**: Unified preset action buttons (Save As, Overwrite, Delete) into a high-contrast action bar in `job-form.tsx`.

### Files Affected
- `src/app/api/presets/[id]/route.ts`: Implemented `PATCH` method.
- `src/lib/hooks/use-presets.ts`: Added `useUpdatePreset` hook.
- `src/components/jobs/job-form.tsx`: Integrated overwrite/delete dialogs and improved button accessibility.

---

## [2026-01-24] - Scraper Flag Hints

### Added
- **Flag Tooltips**: Implemented descriptive tooltips for all configuration options in the "New Job" form.
- **Label Hover Trigger**: Added `Tooltip` components that trigger on label hover, with `cursor-help` styling to guide users.

### Changed
- **Job Form UI**: Integrated `TooltipProvider` and updated all field labels in `job-form.tsx` with helpful hints and optimized positioning (top/right).

### Files Affected
- `src/components/jobs/job-form.tsx` - Added tooltips and styling to labels.

---

## [2026-01-24] - Lead Synchronization Fix

### Fixed
- [Fixed] Running the same job twice (e.g. to get more reviews) resulted in 0 leads due to a unique constraint on `(user_id, cid)`. This was fixed in both manual and auto-sync API paths.
- [Fixed] Extra reviews (requested via `extraReviews` parameter) were being extracted but lost before reaching the database due to a Go type assertion failure. This was fixed by using raw `[][]byte` for data transfer.

## Current Issue
- Scraper still hangs/slows down significantly when `extraReviews` is very high (e.g. 100+).

## Next Steps
1. Add timeout safeguard to review extraction in `place.go`.
2. Add page limit to RPC review fetcher in `reviews.go`.
3. Implement Map Coordinate Picker with search and pinpointing functionality.

---

## [2026-01-24] - Job Configuration View & Preset Saving

### Added
- **Job Configuration Dialog**: New component to view detailed parameters (queries, depth, concurrency, etc.) used for completed/active jobs.
- **Save as Preset from Job**: Functionality to save the configuration of an existing job as a new preset directly from the UI.
- **Check/Copy Keywords**: Added a "Copy All" button to the configuration view to easily extract search queries.

### Changed
- **Jobs Table Integration**: Individual job rows are now clickable to open the configuration dialog.
- **Enhanced UI Feedback**: Added success toasts and loading states for preset saving.

### Files Affected
- `src/components/jobs/job-config-dialog.tsx` (NEW) - Main dialog component.
- `src/app/page.tsx` - Integrated row click and configuration dialog state.

---

## [2026-01-24] - Preset Saving Fix

### Fixed
- **Preset API Schema Mismatch**: `extraReviews` was incorrectly typed as `z.boolean()` in `src/app/api/presets/route.ts` but should be `z.number()` (0 = disabled, >0 = max reviews). This caused Zod validation to fail when saving presets.
- **Missing user_id in Preset Insert**: The RLS policy requires `auth.uid() = user_id` but the insert statement was missing `user_id`. Added authentication check and now includes `user_id` in the insert.

### Files Affected
- `src/app/api/presets/route.ts`
  - Line 12: Changed `extraReviews: z.boolean()` → `extraReviews: z.number().min(0).default(0)`
  - Lines 76-82: Added `supabase.auth.getUser()` check with 401 response
  - Line 90: Added `.eq('user_id', user.id)` to duplicate name check
  - Line 103: Added `user_id: user.id` to insert statement

---

## [2026-01-24] - Planning & Scraper Research

### Added
- Detailed implementation plan for configurable review count in `implementation_plan.md`.

### Changed
- Reverted initial `maxReviews` webapp changes to adopt a cleaner "integer `extra-reviews` flag" approach.

### Decisions
- Modify the existing `-extra-reviews` flag in the Go scraper fork from boolean to integer to control the scroll limit (1 scroll ≈ 10 reviews).
- Document all fork changes in `docs/fork_strategy.md` for maintainability.

### Problems & Solutions
- Upstream limit of ~300 reviews → Found hardcoded `maxScrollAttempts := 30` in `reviews.go`. Solution: Make it configurable.

---

## [2026-01-23] - Infrastructure Fixes & JSON+Sync Architecture

### Added
- **JSON+Sync Workflow**: Implemented a post-processing architecture where the scraper writes to `results.json` and the web app parses and syncs it to Supabase. This decouples the app from the upstream scraper's DSN-specific schema requirements.
- **Docker CP Integration**: Switched from broken WSL2 bind mounts to `docker cp` for query injection and results extraction.
- **Network Resolution**: Switched to Supavisor (IPv4) to resolve Docker connectivity crashes caused by IPv6 routing issues on Docker Desktop.
- **Sync API**: Created `POST /api/jobs/[id]/sync` to parse NDJSON and insert leads into Supabase with correct `job_id` and `user_id`.
- **Security Hardening**:
  - Switched to `spawn()` in `src/lib/docker.ts` to prevent shell injection.
  - Applied `005_security_hardening.sql` for DB-level protection.
  - Implemented `AlertDialog` for job deletion.
- **Job Deduplication**: Added `cid` column and unique index `(user_id, cid)` to `results` table via migration `006`.

### Fixed
- **Docker Race Condition**: Switched from `docker run` to `docker create` → `docker cp` → `docker start` to ensure `queries.txt` is present before the scraper starts.
- **API 500s**: Resolved RLS-related errors in `/api/leads` and fixed auth redirect exclusions in middleware.
- **Types**: Fixed `lucide-react` icon props and Zod coercion issues in `JobForm`.

---

## [2026-01-23] - Auth & Real-time UI implementation (Phase 4 & 5)

### Added
- **Authentication**: Login/Signup pages, Supabase Auth integration, and protected route middleware.
- **Real-time Monitoring**: Polling-based job status updates and "LIVE" pulsing badge for active jobs.
- **Database Triggers**: Added trigger `004` to automatically update `result_count` on the `jobs` table when new leads are inserted.

## [2026-01-23] - Leads Table & Security (Phase 2 & 3)

### Added
- **Leads Management**:
  - `leads-table.tsx`: Complex TanStack Table with filtering, sorting, and row selection.
  - `lead-detail-panel.tsx`: Comprehensive slide-over for lead data inspection.
  - **Export System**: Excel-compatible CSV, JSON, and Google Contacts export.
- **Security Foundation**:
  - `002_enable_rls.sql`: Strict Row Level Security policies across all tables.
  - Authenticated queries for all Data APIs.

## [2026-01-23] - Foundation & Job Submission (Phase 1)

### Added
- **Foundation**: Next.js 16.1 app, shadcn/ui, TanStack Query, and Supabase integration.
- **Core Schema**: Migration `001_initial_schema.sql` (Jobs, Results, Presets, Notes, Tags).
- **Job Engine**: Initial `lib/docker.ts` integration with CLI flag support.
- **Presets**: API and UI components for saving/loading job configurations.

---
... (previous content)
