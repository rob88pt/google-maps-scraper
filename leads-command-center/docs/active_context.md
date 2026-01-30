# Active Context

## Current Focus
- Phase 4: Detail Panel Condensation & UI Polishing

## Recent Changes
- ✅ **Archive System**: Replaced bulk delete with a robust "soft-archive" system.
- ✅ **Multi-User CRM**: Fixed FK constraints and RLS on `lead_status` to allow shared lead management.
- ✅ **Advanced Filtering**: Implemented a 3-way Status Filter (Active, Archived, All).
- ✅ **Detail Panel Polishing**: Condensed the layout, moved actions to header.
- ✅ **Notes Editor Modal**: Implemented truncation, full CRUD in a centered modal, and delete confirmation.

## Next Steps
- [ ] Row Virtualization for LeadsTable (Priority: Performance for large lists).
- [ ] Search accent-insensitivity refinement.

## Blockers / Open Questions
- None. (System is stable and verified).

## Session Notes
- Use `ts-node` or `tsx` with `--env-file` for verification scripts.
- Remember to await `params` in all Next.js 15+ dynamic routes.
- Composite PKs on `(user_id, lead_cid)` are essential for multi-user CRM data.
