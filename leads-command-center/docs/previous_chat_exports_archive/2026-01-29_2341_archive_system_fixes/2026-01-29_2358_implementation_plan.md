# Implementation Plan - Phase 3: Archive System

Replaces the current permanent deletion functionality with a soft-archive system. Leads will no longer be removed from the database but will instead be marked with an `'archived'` status.

## User Review Required

> [!IMPORTANT]
> The "Delete" button in the main toolbar and row actions will be replaced with an "Archive" action. Permanent deletion will no longer be accessible through the primary UI to prevent accidental data loss, as requested.

## Proposed Changes

### Backend API

#### [MODIFY] [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/route.ts)
- Implement `POST /api/leads/archive` (or repurpose `DELETE` if preferred, but a new endpoint or `PATCH` is cleaner for status updates). I will add `POST /api/leads/archive`.
- Ensure `GET /api/leads` correctly filters by `status != 'archived'` when `includeArchived` is false.

---

### Hooks & State

#### [MODIFY] [use-leads.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/lib/hooks/use-leads.ts)
- Add `includeArchived?: boolean` to `LeadsQueryOptions`.
- Implement `useArchiveLeads` mutation hook.
- Implement `useUnarchiveLeads` mutation hook (or unify into `useUpdateLeadsStatus`).

---

### Components

#### [NEW] [archive-leads-button.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/archive-leads-button.tsx)
- New component based on `delete-leads-button.tsx`.
- Uses `Archive` icon from `lucide-react`.
- Triggers batch archival via `useArchiveLeads`.

#### [DELETE] [delete-leads-button.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/delete-leads-button.tsx)
- Removing in favor of the Archive button.

#### [MODIFY] [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
- Integrate `ArchiveLeadsButton`.
- Add a "Show Archived" toggle to the toolbar (Switch or Checkbox).
- Pass `includeArchived` state to `useLeads`.

#### [MODIFY] [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- Update Row Action menu:
  - Add "Archive Lead" (if not archived).
  - Add "Unarchive Lead" (if archived).

#### [MODIFY] [lead-detail-panel.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)
- Add Archive/Unarchive button in the header or actions section.

## Verification Plan

### Automated Tests
- Create a new verification script `scripts/verify_archive_system.ts` (based on `run_crm_tests.ts`) to:
  1. Create a test lead.
  2. Archive it via API.
  3. Verify it's hidden from `GET /api/leads` by default.
  4. Verify it's visible when `includeArchived=true`.
  5. Unarchive it and verify it returns to normal status.

### Manual Verification
1. Open the Leads page.
2. Select multiple leads and click "Archive".
3. Verify they disappear from the list.
4. Toggle "Show Archived" in the toolbar.
5. Verify archived leads appear (with amber status borders).
6. Click "Unarchive" in the row dropdown of an archived lead.
7. Verify it returns to its previous status (or "new").
