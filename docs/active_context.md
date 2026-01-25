# Active Context

## Recent Changes
- **[2026-01-24]** Fixed **City Search**, **Has Photos**, and **Has Email** filtering logic in Leads API.
- **[2026-01-24]** Investigated broken images; identified "Report this photo" links in reviews as a cause.
- **[2026-01-24]** Fixed **Review Display** field casing (PascalCase vs snake_case).
- **[2026-01-24]** Transitioned to Unified Monorepo (Git Repositories consolidated).
- **[2026-01-24]** Reverted attempts to extract review images via DOM (proved unreliable).

## Current Focus
- Resolving broken images in Leads Command Center.

## Next Steps
1. **Fix Scraper**: Filter out "Report this photo" links in `source/gmaps/entry.go`.
2. **Investigate Thumbnails**: Check browser console for 404 details for page 2 thumbnails.
3. **System Testing**: Verify end-to-end stability for sync and export workflows.


## Session Notes
- Pivot: User requested to prioritize stability, search/filtering correctness, and verifying existing features over adding new CRM capabilities.
- "Review Field Casing" is preserved as a high-priority bug content.
