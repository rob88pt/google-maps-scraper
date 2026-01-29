# Active Context

## Current Focus
- Phase 3: Archive System (Ready to Implement)

## Recent Changes
- ✅ **Stability Hotfix**: Resolved `PGRST200` error and Next.js 15+ `params` Promise issues.
- ✅ **Multi-User Fix**: Upgraded `lead_status` to composite PK `(user_id, lead_cid)` and enabled RLS.
- ✅ **UI Fix**: Resolved application crash by unifying `usePresets` hooks.
- ✅ **CRM Phase 2**: Implemented status-colored checkboxes and notes indicators in `LeadsTable`.

## Next Steps
- [ ] Phase 3: Replace Delete with Archive
- [ ] Phase 3: Implement "Show Archived" toggle in Leads UI
- [ ] Phase 4: Consolidate lead details for higher density

## Blockers / Open Questions
- None. (System is stable and verified).

## Session Notes
- Use `ts-node` or `tsx` with `--env-file` for verification scripts.
- Remember to await `params` in all Next.js 15+ dynamic routes.
- Composite PKs on `(user_id, lead_cid)` are essential for multi-user CRM data.
