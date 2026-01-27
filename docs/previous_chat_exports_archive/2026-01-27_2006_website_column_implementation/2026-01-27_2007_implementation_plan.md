# Implementation Plan - Add Website Column to Leads Table

Display the website URL directly in the leads table for easier access.

## Proposed Changes

### [Component] [Leads Table](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)

#### [MODIFY] [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- Insert a new column definition for `web_site` after `complete_address`.
- Render as globe icon + truncated link, open in a new tab with `rel="noreferrer"` and `stopPropagation`, mirroring the Phone link pattern.
- Ensure the Website column is visible by default but still toggleable in the Columns menu.

## Verification Plan

### Manual Verification
- Start the dev server: `npm run dev` in `leads-command-center`.
- Navigate to the leads page.
- Verify the "Website" column is visible.
- Verify that clicking the website link opens the site in a new tab.
- Verify that clicking the website link does NOT open the lead detail drawer (if implemented).
- Verify that the column can be toggled via the "Columns" dropdown.
