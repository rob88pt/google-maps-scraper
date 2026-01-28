# Plan: Apply Global Glass-style Scrollbars

Make the premium "Glass" scrollbar aesthetic the default for the entire application (Leads page, Job Queue, Dialogs, etc.).

## Proposed Changes

### [Component] [globals.css](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/globals.css)

#### [MODIFY] [globals.css](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/globals.css)
- Move the `.glass-scrollbar` styles to a global selector (`*` or `@layer base`) so it applies automatically to all scrollable elements in the app.
- Keep the scrollbars thin and translucent as previously designed.

### [Component] [job-config-dialog.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/jobs/job-config-dialog.tsx)

#### [MODIFY] [job-config-dialog.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/jobs/job-config-dialog.tsx)
- (Optional) Remove the explicit `glass-scrollbar` class if the global style is sufficient.

## Verification Plan

### Manual Verification
1. Navigate to the Leads page and scroll the table.
2. Open the Job Queue and scroll.
3. Open any dialog.
4. Verify all scrollbars share the same cohesive "Glass" look.
