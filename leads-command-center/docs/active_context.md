# Active Context

## Current Focus
- Phase 4: Detail Panel Condensation & UI Polishing

## Recent Changes
- ✅ **Archive System**: Replaced bulk delete with a robust "soft-archive" system.
- ✅ **Multi-User CRM**: Fixed FK constraints and RLS on `lead_status` to allow shared lead management.
- ✅ **Advanced Filtering**: Implemented a 3-way Status Filter (Active, Archived, All) using a database view to overcome PostgREST limitations.
- ✅ **API Robustness**: Added `/api/leads/unarchive` and integrated toast feedback for all CRM actions.

## Next Steps
- [ ] Phase 4: Consolidate lead details for higher information density
- [ ] Implement expandable notes input in the detail panel

## Blockers / Open Questions
- None. (System is stable and verified).

## Session Notes
- Use `ts-node` or `tsx` with `--env-file` for verification scripts.
- Remember to await `params` in all Next.js 15+ dynamic routes.
- Composite PKs on `(user_id, lead_cid)` are essential for multi-user CRM data.
