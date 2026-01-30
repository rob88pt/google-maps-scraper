# Notes Editor Modal

Enable viewing and editing notes in a centered modal with a larger editor.

## Design Finalized
- **Plain Text Editor**: No markdown rendering for now.
- **Delete Confirmation**: A confirmation dialog will be shown before deleting a note.

---

## Proposed Changes

### Backend: Add Update & Delete Endpoints

#### [MODIFY] [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/[cid]/notes/route.ts)

- Add `PUT /api/leads/[cid]/notes` to update an existing note by `id`.
- Add `DELETE /api/leads/[cid]/notes?id=<noteId>` to delete a note.

---

### Hook: Extend `useLeadNotes`

#### [MODIFY] [use-leads.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/lib/hooks/use-leads.ts)

- Add `updateNote` mutation: `PUT /api/leads/{cid}/notes` with `{ id, content }`.
- Add `deleteNote` mutation: `DELETE /api/leads/{cid}/notes?id={noteId}`.
- Invalidate queries on success.

---

### UI: Notes Modal Component

#### [NEW] [note-editor-modal.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/note-editor-modal.tsx)

A reusable modal component:
- **Props**: `note` (content, id, created_at), `isOpen`, `onClose`, `onSave`, `onDelete`.
- **Layout**: Centered modal (`max-w-lg`), dark theme, full-height `Textarea`.
- **Actions**: Save, Delete, Cancel buttons.

---

### UI: Truncated Notes in Side Panel

#### [MODIFY] [lead-detail-panel.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)

- Truncate notes to 2 lines in the side panel using `line-clamp-2`.
- Make notes clickable → opens `NoteEditorModal`.
- Wire up `updateNote` and `deleteNote` from the hook.

---

## Verification Plan

### Manual Verification
1. Add a new note and verify it appears.
2. Click a note in the side panel → confirm modal opens with full content.
3. Edit the note content and save → confirm update persists.
4. Delete a note → confirm removal from list.
5. Verify long notes are truncated in the side panel.
