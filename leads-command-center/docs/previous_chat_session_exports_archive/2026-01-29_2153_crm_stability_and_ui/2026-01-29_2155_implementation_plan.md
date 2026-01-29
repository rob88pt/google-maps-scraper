# CRM Enhancements Phase 2: Table UI & Status Indicators

This phase focuses on the visual representation of CRM data within the Leads table, emphasizing visual density and quick identification of lead status and notes.

## Proposed Changes

### [Component] [LeadsTable](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)

#### [MODIFY] `LeadRow` Type
- Update `LeadRow` to include `crm_status` and `notes_count`.
- `crm_status` types: `'new' | 'contacted' | 'qualified' | 'closed' | 'archived'`.

#### [MODIFY] Checkbox Styling (Space-Saving Status)
- Integrate status colors directly into the selection checkboxes in the `select` column.
- **Visual implementation**: Apply background fills and borders to the checkboxes even in the *unchecked* state to indicate CRM status.
- **Color Palette**:
    - `new`: `bg-slate-700/20 border-slate-500` (Neutral)
    - `contacted`: `bg-blue-500/20 border-blue-500` (Information)
    - `qualified`: `bg-emerald-500/20 border-emerald-500` (Success/Money)
    - `closed`: `bg-rose-500/20 border-rose-500` (Lost/Closed)
    - `archived`: `bg-amber-500/20 border-amber-500` (Attention/Old)

#### [MODIFY] Notes Indicator (Google Docs Style)
- Add a subtle primary indicator next to the **Business Name** (title) instead of a separate column or generic badge.
- **Visual implementation**: Use a small `MessageSquare` icon (size-3) next to the title text, appearing only if `notes_count > 0`.
- **UX**: Show a tooltip on hover with the note count or "View notes in detail panel".

### [Component] [LeadDetailPanel](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)
- Ensure the detail panel also reflects these statuses visually (already partially implemented, but will refine for consistency).

## Verification Plan

### Manual Verification
- **Visual Check**: Open the Leads table and verify:
    - Checkboxes have the correct border colors based on the lead's status.
    - Leads with notes display a "Notes" badge.
    - The layout remains tight and doesn't break with the new indicators.
- **Data Integrity**: Change a lead's status/notes in the Detail Panel and verify the table row updates accordingly (via TanStack Query invalidation).
