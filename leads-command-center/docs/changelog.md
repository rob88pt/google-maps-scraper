# Changelog

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
