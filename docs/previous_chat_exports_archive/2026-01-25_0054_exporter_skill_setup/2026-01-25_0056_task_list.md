# Task List

## 🔴 Blocked
- [ ] Investigate Thumbnails: Check browser console for 404 details for page 2 thumbnails. (added: 2026-01-25)
  - Need to reproduce this to see if it's a scraper issue or frontend issue.

## 🟡 In Progress
- [/] Resolve broken images in Leads Command Center. (added: 2026-01-25)
  - Found that "Report this photo" links are being scraped as images.
  - Need to filter these out in the scraper.

## 📋 Backlog (To Do)
- [ ] Fix Scraper: Filter out "Report this photo" links in `source/gmaps/entry.go`. (added: 2026-01-25)
- [ ] System Testing: Verify end-to-end stability for sync and export workflows. (added: 2026-01-25)
- [ ] Add timeout safeguard to review extraction in `place.go`. (added: 2026-01-25, from Changelog)
- [ ] Add page limit to RPC review fetcher in `reviews.go`. (added: 2026-01-25, from Changelog)
- [ ] Implement Map Coordinate Picker with search and pinpointing functionality. (added: 2026-01-25, from Changelog)

## ✅ Done
- [x] Create this task list file. (done: 2026-01-25)
- [x] Fix Leads Filtering: City Search, "Has Photos", and "Has Email" logic. (done: 2026-01-24)
- [x] Investigate Broken Images: Identified "Report this photo" links as the cause. (done: 2026-01-24)
- [x] Fix Review Display: Corrected field casing (PascalCase vs snake_case). (done: 2026-01-24)
- [x] Infrastructure: Consolidate repositories into Unified Monorepo. (done: 2026-01-24)
- [x] Scraper: Revert fragile DOM image extraction & restore legacy fallback. (done: 2026-01-24)
- [x] Scraper: Fix nil map panic in review extraction. (done: 2026-01-24)
- [x] Feature: Add Overwrite/Delete protection for Job Presets. (done: 2026-01-24)
- [x] Feature: Job Configuration Dialog & "Save as Preset". (done: 2026-01-24)
- [x] Feature: JSON+Sync workflow to decouple scraper from DB. (done: 2026-01-23)
- [x] Fix: Docker race conditions & network resolution (Supavisor). (done: 2026-01-23)
- [x] Feature: Auth, Real-time status, and Leads Table UI. (done: 2026-01-23)
- [x] Project Initialization: Next.js 16.1, Supabase, Docker integration. (done: 2026-01-23)
