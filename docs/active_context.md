# Active Context

## Recent Changes
- **[2026-01-27]** Fixed nested pagination in `LeadsTable` and consolidated UI navigation controls.
- **[2026-01-27]** Cleaned up `docs/fork_strategy.md` and reverted minor unintentional Go code changes.
- **[2026-01-27]** Implemented CRM status (New/Contacted/etc) and Notes feed in `LeadDetailPanel`.
- **[2026-01-27]** Added business thumbnail markers and auto-centering to Map view.
- **[2026-01-27]** Integrated Nominatim API coordinate picker into `JobForm`.
- **[2026-01-27]** Fixed leads table content truncation and implemented interactive column resizing.
- **[2026-01-27]** Fixed map popups to be persistent on hover for easier link interaction.
- **[2026-01-25]** Upgraded `copy_artifacts.ps1` with smart deduplication.

## Current Focus
- Verification: Ensuring the consolidated pagination flow is working as expected across multiple pages.

## Next Steps
1. **Testing**: Run a production-like job to verify that all active customizations (traceability, review limits) function correctly.
2. **Feedback**: Collect user feedback on CRM and Map improvements.


## Session Notes
- Pivot: User requested to prioritize stability, search/filtering correctness, and verifying existing features over adding new CRM capabilities.
- "Review Field Casing" is preserved as a high-priority bug content.
