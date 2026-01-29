# Changelog

## [2026-01-29] - Search and Filter Templates (Presets)

### Added
- Search Template System:
    - New `search_templates` table in Supabase with RLS policies and multi-user support.
    - `POST`, `GET`, `DELETE` API routes for managing templates.
    - `usePresets` hook for state management.
    - `SearchPresetManager` component:
        - Save/Load templates capturing filters, sorting, column layout, category, and search query.
        - Deletion confirmation dialog for safety.
        - Helpful empty state with onboarding hint.
- Visual Feedback:
    - Active indicators (blue theme + badges) for Category and Preset filters.
    - Robust drift detection using `useRef` comparison to prevent visual state race conditions.

### Changed
- Integrated `SearchPresetManager` into the `LeadsPage` toolbar.
- Added detailed server-side logging to `api/search-templates` to track operations and debug mysterious deletions.

### Fixed
- Fixed research/gallery preview regression where images in modals failed to load due to `LazyImage` intersection observer logic.
- Fixed a race condition where applying a preset would immediately clear the "active" indicator due to state update latency.


## [2026-01-28] - Robust Image Loading

### Added
- `LazyImage` component in `src/components/leads/lazy-image.tsx`:
    - Intersection Observer gating for loading and retries.
    - Exponential backoff with jitter for retries (800ms to 5s).
    - Cache busting parameter (`_r`) for retry attempts.
    - Optimized browser attributes: `loading`, `decoding`, `referrerPolicy`.
    - `Skeleton` state and `Building2` fallback icon.

### Changed
- Integrated `LazyImage` into `leads-table.tsx` thumbnails.
- Integrated `LazyImage` into `lead-detail-panel.tsx` (Gallery, Thumbnail, Reviews).
- Refactored `LeadsTable` column definitions to handle the new component and fix structural issues.

### Fixed
- Resolved broken image display in dashboard due to browser concurrency limits and CDN rate-limiting.
- Fixed TypeScript errors and broken imports in `leads-table.tsx` after component integration.
