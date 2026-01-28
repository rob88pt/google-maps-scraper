# Implementation Plan - Native Column Reordering (Final)

Implement reorderable columns in the Leads table using the native HTML5 Drag and Drop API, synchronized with TanStack Table's `columnOrder` state.

## User Review Required

> [!IMPORTANT]
> - **Grip Handles**: A dedicated "drag handle" (GripVertical icon) will be added to reorderable headers. It will be positioned to the far left of the header cell to avoid the resizer hitbox on the right.
> - **Keyboard Accessibility**: "Move Up/Down" buttons will be added to the column toggle menu (these move columns Left/Right in the table).
> - **Shared Truth**: Column IDs will be derived from a single exported constant to prevent UI drift.

## Proposed Changes

### [leads-command-center]

#### [MODIFY] [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)

1.  **Shared Source of Truth**:
    - Export `columnIds` derived directly from the `columns` array.
2.  **Column Metadata**:
    - Set `meta: { reorderable: false }` for fixed columns (`select`, `actions`).
3.  **Controlled State**:
    - Add optional `columnOrder` and `onColumnOrderChange` to `LeadsTableProps`.
    - Implement internal fallback state matching `sorting`.
4.  **Drag Logic**:
    - Implement `handleDragStart`, `handleDragOver`, and `onDrop`.
    - **Safety**: Do not render the drag handle or attach handlers if `header.isPlaceholder` is true.
    - **Conflict Prevention**: Set an `isDragging` bit on `dragstart` and clear it on `dragend` (with a small timeout, e.g., 100ms) to ensure the `onRowClick` on `TableRow` doesn't fire.
    - **Complete State**: Ensure `columnOrder` always contains ALL IDs from `columnIds`.
5.  **UI Components**:
    - Add `GripVertical` icon in `TableHead`, positioned on the left side.
    - Ensure it is outside the `w-5` resizer hit zone on the right.

#### [MODIFY] [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)

1.  **Lift State**: Manage `columnOrder` in `LeadsPage`, initialized from the exported `columnIds`.
2.  **Dynamic Toggle Menu**:
    - Drive the column list from the `columnOrder` state.
    - **Keyboard Access**: Add "Move Up" (left) and "Move Down" (right) arrow buttons next to each column title in the toggle menu.
3.  **Reorder Function**: Implement `moveColumn(id, direction)` to handle both DND updates and button clicks.

## Verification Plan

### Manual Verification
1.  **DND Interaction**: Drag a column via the grip handle. Confirm sorting and resizing still work via their respective regions.
2.  **Drag Conflicts**: Verify `onRowClick` does NOT trigger after a drag.
3.  **Menu Buttons**: Verify that the "Move Up/Down" buttons in the toggle menu move the columns in the table but do NOT change their visibility status.
4.  **Placeholder Safety**: Ensure no drag handles appear in empty header spaces or group headers (if any).
5.  **State Consistency**: Hide 3 columns, move a 4th, unhide all—verify the list is still correct and complete.
