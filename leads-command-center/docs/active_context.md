# Active Context

## Current Focus
The current focus is on improving the robustness of the Leads Dashboard, specifically addressing data quality and visual reliability issues.

## Recent Changes
- **2026-01-28:** Implemented a robust `LazyImage` component with intersection gating, exponential backoff (with jitter), and cache-busting retries.
- **2026-01-28:** Integrated `LazyImage` into `LeadsTable` thumbnails, `LeadDetailPanel` galleries, and review sections.
- **2026-01-28:** Cleaned up broken imports and fixed TypeScript structures in `leads-table.tsx`.

## Next Steps
- [ ] Implement Row Virtualization in `LeadsTable` to further optimize resource usage.
- [ ] Improve search accent-insensitivity (from previous context).
- [ ] Implement Map restoration and CRM features (notes/status updates).

## Blockers / Open Questions
- None currently.
