# Implementation Plan - Fix Table Interactivity and Hydration Mismatch

Fix the non-responsive row checkboxes and resolve the React hydration mismatch on the Leads page.

## User Review Required

> [!NOTE]
> I am consolidating the "responsive defaults" logic into the parent `LeadsPage` component and removing it from `LeadsTable`. This ensures a single source of truth for initial column visibility.

## Proposed Changes

### Leads Command Center

#### [MODIFY] [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- Add `enableRowSelection: true` to the `useReactTable` configuration.
- Remove the `useEffect` that sets responsive column defaults (this will now be handled exclusively by `LeadsPage`).
- Remove the `hasInitializedVisibility` ref.
- Update `TableRow` `onClick` to more robustly ignore clicks on checkboxes by checking for Radix-specific attributes or common checkbox classes if necessary.

#### [MODIFY] [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
- Wrap the main table content in a `hasMounted` check to prevent hydration mismatches caused by `localStorage` and `useMediaQuery`.
- Refine the responsive defaults `useEffect` to ensure it only runs once and correctly interacts with `localStorage`.

---

## [NEW] Expand Checkbox Hit Area

Improve row selection usability by making the entire selection column cell clickable.

### Proposed Changes

#### [MODIFY] [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- Wrap the `Checkbox` in both `header` and `cell` definitions for the `select` column with a `div` that:
    - Fills the available space.
    - Has `cursor: pointer`.
    - Handles `onClick` to toggle selection.
    - Prevents event propagation to the row click handler.

---

## [NEW] Fix Header Checkbox Alignment

Ensure the header "Select All" checkbox is perfectly centered and occupies the full hit area of its cell.

### Proposed Changes

#### [MODIFY] [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- Refactor the `TableHead` content rendering:
    - If `header.id === 'select'`, render the `flexRender` output directly (which already contains our optimized, centered `div`).
    - Otherwise, render the existing wrapper with reordering grips and sorting icons.
- This removes the wrapping `justify-between` and `gap-1` containers that were pushing the header checkbox to the left.

---

## Verification Plan

### Automated Tests
- I will use the browser tool to:
    1. Navigate to the Leads page.
    2. Verify if the checkboxes are interactive.
    3. Verify if selecting a row works.
    4. Verify if bulk delete button appears and functions (up to the confirmation dialog).

### Manual Verification
- Verify that resizing the window to mobile/tablet and back to desktop correctly maintains column visibility (or applies defaults if no saved state exists).
- Verify that clicking a checkbox DOES NOT open the side panel.
- Verify that clicking the row (away from the checkbox) DOES open the side panel.
