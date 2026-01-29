# CRM Feature Improvements – Phased Implementation Plan

This plan is broken into 4 phases for incremental delivery, including fixes for current persistence issues.

---

## Phase 1: Persistence & Schema Fixes (CRITICAL)

**Goal**: Fix note-saving and prepare database for "Archived" status.

### Tasks
1. **API Fix**: Update `POST /api/leads/[cid]/notes` to include `user_id` from the authenticated session.
2. **API Fix**: Ensure `PATCH /api/leads/[cid]/status` also includes/respects `user_id`.
3. **Database Migration**: 
   - Add `archived` to the `lead_status` CHECK constraint.
   - (Recommendation) Add `DEFAULT auth.uid()` to `user_id` columns in CRM tables to simplify API logic.
4. **API Enhancement**: Modify `GET /api/leads` to return `crm_status` and `notes_count` for each lead.

### Files
- [notes/route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/%5Bcid%5D/notes/route.ts)
- [status/route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/%5Bcid%5D/status/route.ts)
- [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/route.ts)

---

## Phase 2: Table UI – Status Visualization & Notes Badge

**Goal**: Save horizontal space while providing at-a-glance CRM data.

### Tasks
1. **Status Colors**: Integrate status visualization into the **Checkbox Cell**.
   - Apply border colors to checkboxes based on status (Yellow: Contacted, Green: Qualified, Dark: Archived).
   - Dim the entire row for "Archived" leads.
2. **Notes Badge**: Add a 🗨️ (comment) icon next to the lead title if `notes_count > 0`.
3. **Archive Filter**: Add a toggle in the Table Header to "Show Archived" leads.

### Files
- [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/\(dashboard\)/leads/page.tsx)

---

## Phase 3: Archive Workflow

**Goal**: Implement bulk archive to prevent re-scraping confusion.

### Tasks
1. Replace "Delete Selected" with **"Archive Selected"**.
2. Implement bulk status update API/hook to mark leads as `archived`.
3. Add "Archive" to the Quick Actions in the Detail Panel.

---

## Phase 4: Detail Panel – Refined CRM UX

**Goal**: Condense the UI and improve note-taking efficiency.

### Tasks
1. **Expandable Notes**: Hide the note textarea by default. Show a **"New Note (+)"** button to expand it.
2. **Compact Spacing**: Reduce vertical padding in the CRM section (`p-2`).
3. **Date-only Notes**: Standardize the notes timeline to show date/content only.

### Files
- [lead-detail-panel.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)

---

## Verification Plan

1. **Phase 1**: Confirm notes save successfully and appear after refresh.
2. **Phase 2**: Verify checkbox borders change color correctly.
3. **Phase 3**: Verify archived leads are hidden by default and revealable via toggle.
4. **Phase 4**: Confirm Detail Panel looks tighter and notes input is togglable.
