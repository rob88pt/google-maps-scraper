# Active Context

## Recent Changes
- **[2026-01-27]** Finalized a comprehensive Technical Implementation Plan for Laptop/Desktop Responsiveness.
- **[2026-01-27]** Added "Website" column to Leads Table with truncated links and toggleable visibility.
- **[2026-01-27]** Fixed nested pagination in `LeadsTable` and consolidated UI navigation controls.
- **[2026-01-27]** Cleaned up `docs/fork_strategy.md` and reverted minor unintentional Go code changes.
- **[2026-01-27]** Implemented CRM status (New/Contacted/etc) and Notes feed in `LeadDetailPanel`.
- **[2026-01-27]** Added business thumbnail markers and auto-centering to Map view.
- **[2026-01-27]** Integrated Nominatim API coordinate picker into `JobForm`.
- **[2026-01-27]** Fixed leads table content truncation and implemented interactive column resizing.
- **[2026-01-27]** Fixed map popups to be persistent on hover for easier link interaction.
- **[2026-01-25]** Upgraded `copy_artifacts.ps1` with smart deduplication.

## Current Focus
- Implementation: Making the Leads Command Center responsive for laptop/desktop viewports according to the approved plan.
- Verification: Ensuring the new "Website" column displays correctly and links work without row click interference.

## Next Steps
1. **Implementation**: Execute the Laptop/Desktop Responsiveness plan (root layout, `useMediaQuery`, `Sheet` overlay, `table-fixed`).
2. **Testing**: Verify end-to-end stability for sync and decoupled scraper from DB in a production-like job.


## Session Notes
- Pivot: User requested to prioritize stability, search/filtering correctness, and verifying existing features over adding new CRM capabilities.
- "Review Field Casing" is preserved as a high-priority bug content.
