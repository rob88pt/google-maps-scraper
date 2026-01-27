# Implementation Plan - Fix Leads Scroll Issue

The Leads table is currently clipped by a container with `overflow: hidden`, preventing users from scrolling through the rows. This was likely introduced during the "Global Layout Refactor" which aimed to manage scrolling more precisely.

## Proposed Changes

### [Component] [Leads Command Center](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center)

#### [MODIFY] [Leads Table Component](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- Update the root `div` to be a flex container with `h-full` to fill the available space.
- Update the table wrapper `div` to have `overflow-y-auto` and `flex-1` to handle the scrolling rows.
- Add sticky positioning to the `TableHeader` so it remains visible while scrolling leads.
- Refine the table border and overflow settings to ensure a clean look.

#### [MODIFY] [Leads Page](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
- Ensure the container wrapping `LeadsTable` correctly passes down height and doesn't explicitly hide overflow if the child is supposed to handle it, OR change its overflow to `overflow-auto`.
- Actually, the best approach is to keep the parent `overflow-hidden` to keep the page layout stable, and make `LeadsTable` fully self-contained with its own scrollbar.

## Verification Plan

### Automated Tests
- None available for layout scrolling.

### Manual Verification
1. Navigate to `/leads`.
2. Ensure there are enough leads to cause overflow (e.g., > 10-15 rows).
3. Verify that a vertical scrollbar appears for the table.
4. Scroll down and verify that the Table Header (Name, Category, etc.) stays at the top.
5. Verify that the "Columns" visibility toggle remains at the top of the table area.
6. Verify that the Pagination (at the bottom of the page) remains visible and accessible.
7. Test on different viewport sizes (Desktop > 1280px and Laptop < 1280px) to ensure the responsive overlay doesn't break.
