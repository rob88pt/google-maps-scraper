# Active Context

## Recent Changes
- **[2026-01-25]** Implemented High-Resolution Image Previews in `LeadDetailPanel` (using `=s0` parameter).
- **[2026-01-25]** Implemented Negative Filters ("Does not have email/website") in Leads API and UI.
- **[2026-01-24]** Fixed **City Search**, **Has Photos**, and **Has Email** filtering logic in Leads API.
- **[2026-01-24]** Investigated broken images; identified "Report this photo" links in reviews as a cause.
- **[2026-01-24]** Fixed **Review Display** field casing (PascalCase vs snake_case).
- **[2026-01-24]** Transitioned to Unified Monorepo (Git Repositories consolidated).
- **[2026-01-24]** Reverted attempts to extract review images via DOM (proved unreliable).

## Current Focus
- Implementing UI enhancements (Full Screen Image Preview).

## Next Steps
1. **Wait for User Feedback**: Confirm if image preview meets expectations.
2. **Review Scraper**: Filter out "Report this photo" links (backlog) if users report issues again.
3. **System Testing**: Verify end-to-end stability.


## Session Notes
- Pivot: User requested to prioritize stability, search/filtering correctness, and verifying existing features over adding new CRM capabilities.
- "Review Field Casing" is preserved as a high-priority bug content.
