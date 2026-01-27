# Task List

## 🔴 Blocked
- [ ] Investigate Thumbnails: Check browser console for 404 details for page 2 thumbnails. (added: 2026-01-25)
  - User commented "looks like images are ok", pausing investigation.


## 🟡 In Progress
- [/] Re-implement Reverted Features & Enhancements (added: 2026-01-25)
  - [ ] Restore Map Tiles (CartoDB Dark Matter)
  - [ ] Redo Map Side Panel (Reuse Leads Detail Panel)
  - [ ] Show Images on Map Markers (without hover)
  - [ ] Fix Leads Table "Query" Column (Show search term instead of ID)
  - [ ] Recreate CRM API Endpoints (Notes POST, Status PATCH)
  - [ ] Recreate Map Coordinate Picker (Nominatim)

## 📋 Backlog (To Do)
- [ ] Fix Scraper: Filter out "Report this photo" links in `source/gmaps/entry.go`. (added: 2026-01-25)
- [ ] System Testing: Verify end-to-end stability for sync and# Active Context

## Recent Changes
- **[2026-01-27]** Researched and planned Map Restoration & CRM Enhancements (Image markers, Side Panel, Notes, Status).
- **[2026-01-25]** Upgraded `copy_artifacts.ps1` with smart deduplication to prevent redundant backups.
- **[2026-01-25]** Added navigation arrows and keyboard support to High-Res Image Previews.
- **[2026-01-25]** Implemented High-Resolution Image Previews in `LeadDetailPanel` (using `=s0` parameter).
- **[2026-01-25]** Implemented Negative Filters ("Does not have email/website") in Leads API and UI.

## Current Focus
- Session Handoff: Preparing for implementation of Map Restoration & CRM.

## Next Steps
1. **Restore Map Functionality**: Switch to CartoDB tiles and add image markers.
2. **Implement CRM API**: Create endpoints for notes and status updates.
3. **Integrate CRM in UI**: Add notes and status management to `LeadDetailPanel`.
4. **Fix Data Traceability**: Implement query mapping via `#!#` separator.

## Session Notes
- Implementation plan approved for next session.
- Discovered typo "longtitude" in Supabase schema/types, fix planned in UI display.
- Database tables `lead_status` and `lead_notes` verified for CRM feature integration.
couple scraper from DB. (done: 2026-01-23)
- [x] Fix: Docker race conditions & network resolution (Supavisor). (done: 2026-01-23)
- [x] Feature: Auth, Real-time status, and Leads Table UI. (done: 2026-01-23)
- [x] Project Initialization: Next.js 16.1, Supabase, Docker integration. (done: 2026-01-23)
