# Add Copy Buttons to Leads Table Rows

This plan outlines the addition of copy-to-clipboard buttons for text-heavy columns in the Leads Table, improving user efficiency when extracting data.

## Proposed Changes

### [Component] [LeadsTable](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)

#### [MODIFY] [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- Import `toast` from `sonner`.
- Add `Check` icon from `lucide-react`.
- Implement a reusable `CellCopyButton` component that:
    - Appears on hover of the cell (or is always subtle).
    - Uses `navigator.clipboard.writeText`.
    - Shows a temporary "success" checkmark.
    - Triggers a `sonner` toast for confirmation.
- Update the following columns to include the `CellCopyButton`:
    - **Name** (`title`)
    - **Category** (`category`)
    - **Query** (`input_id`)

## Verification Plan

### Manual Verification
1.  **Hover over cells**: Verify that a copy icon appears for the target columns.
2.  **Click Copy**:
    - Confirm the icon changes to a checkmark briefly.
    - Confirm a toast notification appears.
    - Verify the text is actually in the clipboard.
3.  **Check Phone Column**: Ensure the phone link still works, but a copy button is also available.
4.  **Check Layout**: Ensure the copy button doesn't cause word-wrapping issues or layout shifts.
