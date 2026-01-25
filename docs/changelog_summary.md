# Changelog Summary

For the full history and technical granularities, see the [Full Changelog](changelog.md).

## Major Milestones
 - **2026-01-24** [Filtering Fixes & Image Investigation](changelog.md#2026-01-24---filtering-fixes--image-investigation) (City search, hasPhotos, email null handling)
 - **2026-01-24** [Review Display & Scraper Fixes](changelog.md#2026-01-24---review-display--scraper-fixes) (Panic fix + PascalCase sync)
- **2026-01-24** [Monorepo Transition](changelog.md#2026-01-24---monorepo-transition--git-setup) (Unified Git repo for Web App & Scraper)
- **2026-01-24** [Reverted Review Image Scraping](changelog.md#2026-01-24---reverted-review-image-scraping) (Reverted fragile DOM extraction)
- **2026-01-24** [Preset Management & UI Accessibility Improvements](changelog.md#2026-01-24---preset-management--ui-accessibility) (Overwrite & Delete confirmation)
- **2026-01-24** [Scraper Flag Hints](changelog.md#2026-01-24---scraper-flag-hints) (UI tooltips for flags)
- **2026-01-24** [Job Configuration View & Preset Saving](changelog.md#2026-01-24---job-configuration-view--preset-saving) (UI improvements)
- **2026-01-24** [Preset saving fix](changelog.md#2026-01-24---preset-saving-fix) (schema type mismatch + RLS user_id)
- **2026-01-23** [JSON+Sync Architecture](changelog.md#2026-01-23---infrastructure-fixes--jsonsync-architecture) implementation (DSN-less scraping)
- **2026-01-23** [Docker Integration Fixes](changelog.md#2026-01-23---infrastructure-fixes--jsonsync-architecture) (WSL2 cp workaround + networking)
- **2026-01-23** [Auth & Security](changelog.md#2026-01-23---auth--real-time-ui-implementation-phase-4--5) (Full RLS Hardening)
- **2026-01-23** [Real-time Monitoring](changelog.md#2026-01-23---auth--real-time-ui-implementation-phase-4--5) & Dashboards
- **2026-01-23** [Leads Data Table](changelog.md#2026-01-23---leads-table--security-phase-2--3) with Multi-format Export
- **2026-01-23** [Scraper Source Fork](changelog.md#2026-01-23---infrastructure-fixes--jsonsync-architecture) (Metadata injection)
- **2026-01-23** [Project Foundation](changelog.md#2026-01-23---foundation--job-submission-phase-1) (Next.js 16.1 + Supabase)

## Key Decisions
- Modified `-extra-reviews` flag from boolean to integer (scroll limit control)
- Using JSONB for lead data storage with post-processing sync
- Strict RLS policies requiring user_id on all tables

## Current State
- All core features working
- **Preset Management** enhanced with Overwrite and Delete confirmation
- **Accessibility** improved with high-contrast action buttons
- Scraper Flag Hints added to Job Form via tooltips
- **Accessibility** improved with high-contrast action buttons
- **Scraper Panic Fixed**: Resolved nil map panic in `reviews.go`
- **Frontend Sync Fixed**: Handled PascalCase JSON keys for reviews
- **Filtering Logic Fixed**: Corrected JSONB paths and null handling for leads list
- Next: Filter out "Report this photo" links in scraper; Investigate broken thumbnails on page 2.

## Recent Fixes
- **Job Configuration**: Added dialog to view parameters and save as preset from existing jobs
- **Preset saving**: Fixed `extraReviews` type mismatch (boolean→number) and missing `user_id` in insert
