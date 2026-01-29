# Changelog Summary

For the full technical history, see the [Full Changelog](changelog.md).

## Major Milestones
- **2026-01-29** [Infinite Scroll & UI Condensation](changelog.md#2026-01-29---ui-condensation--infinite-scroll)
    - Implemented high-performance infinite scrolling with TanStack Query.
    - Condensed the Lead Detail Panel and reordered sections for better utility.
    - Implemented robust Search & Filter Presets with Drift Detection.
    - **Unified Project History**: Consolidated one week of records into centralized Command Center docs.
- **2026-01-28** [Bulk Actions & Table Polish](changelog.md#2026-01-28---bulk-delete--table-interactivity-refinements)
    - Multi-ID deletion and optimized table interactivity.
    - SSR-safe LocalStorage persistence for table layouts.
    - Comprehensive website filtering (Proper Sites, Social, None).
- **2026-01-27** [Dynamic Layouts & Category Systems](changelog.md#2026-01-27---dynamic-column-reordering--category-filtering)
    - Native drag-and-drop column reordering.
    - Server-side sorting for large datasets.
    - Mobile-responsive overlay drawers (Sheets) for small viewports.
- **2026-01-24** [Scraper Optimization & Search Fixes](changelog.md#2026-01-24---filtering-fixes--scraper-improvements)
    - Fixed complex JSONB filtering (City, Email, Photos).
    - Added scraper flag tooltips and Job Configuration inspector.
- **2026-01-23** [Core Infrastructure & Auth](changelog.md#2026-01-23---infrastructure--foundation)
    - JSON+Sync architecture for DSN-less operation.
    - Supabase Auth integration and Real-time monitoring.
    - Initial Docker engine integration.

## Key Decisions
- **Post-processing Workflow**: Scraper writes to JSON, web app syncs to DB. This prevents schema lock-in and improves reliability.
- **Strict RLS Partitioning**: Every record (Job, Lead, Preset) is tied to a `user_id`, protected at the DB level.
- **Custom UI Density**: Opted for a "high-density" professional look (px-1 padding, condensed spacing) to maximize information display on desktop.

## Current State
- **Performance**: High (Infinite scroll + Server-side sorting).
- **Security**: Hardened (RLS + Supabase Auth).
- **UX**: Professional (Presets, tooltips, responsive overlays, layout persistence).
- **Next Steps**: Phase 1 of CRM improvements (Status-colored table rows and Archive system).
