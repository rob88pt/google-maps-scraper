# Implementation Plan - Fix Jobs Page Fluid Layout

The Jobs page currently uses a `container mx-auto` wrapper which constrains the content width on large monitors, making it appear "squeezed" to the left. This plan refactors the layout to be fluid (full width) to match the Leads page.

## Proposed Changes

### [Component Name] Jobs Page

#### [MODIFY] [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/page.tsx)
- Remove the `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3` classes from the container.
- Use `flex flex-col gap-6` or simpler `space-y-6` to allow the Job Queue card (and any future cards) to span the full viewport width.
- Ensure the layout is consistent with the Leads page's full-width approach.

## Verification Plan

### Manual Verification
- **Browser Testing**: 
    1. Navigate to http://localhost:3000/
    2. Resize to a very wide viewport (e.g., > 1600px).
    3. Confirm the "Scraping Jobs" title and cards are no longer trapped in a narrow central column and instead span the full width with consistent `p-6` padding.
    4. Verify the grid still transitions correctly between 1, 2, and 3 columns.
- **Visual Check**: Compare the padding and layout alignment with the Leads page (`/leads`) to ensure consistency across the application.
