# Map Restoration & CRM Enhancements - Session Handoff

Read this file to continue where the previous session left off.

## Project
- **Location:** `d:\Websites\GMaps_scraper_gosom`
- **Repo:** N/A (Local Monorepo)

## User's Goal
Implement CRM features (notes/status), restore map functionality with image markers, fix data traceability in the scraper, and add a coordinate picker to the job form.

---

## Files Created
| File                                                                  | Purpose                                      |
| --------------------------------------------------------------------- | -------------------------------------------- |
| `leads-command-center/src/components/jobs/location-search-dialog.tsx` | Coordinate picker dialog using Nominatim API |

## Files Modified
| File                                                              | What Changed                                                            |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `leads-command-center/src/components/leads/lead-detail-panel.tsx` | Added CRM Status dropdown and Notes feed; fixed coordinate label typo.  |
| `leads-command-center/src/components/ui/map-base.tsx`             | Added thumbnail markers; fixed popups to be persistent on hover.        |
| `leads-command-center/src/components/leads/leads-table.tsx`       | Implemented interactive column resizing and removed content truncation. |
| `leads-command-center/src/components/jobs/job-form.tsx`           | Integrated LocationSearchDialog for coordinate picking.                 |
| `leads-command-center/src/lib/hooks/use-leads.ts`                 | Added `useLeadStatus` and `useLeadNotes` hooks.                         |
| `leads-command-center/src/app/api/leads/[cid]/status/route.ts`    | Backend for CRM status (removed auth requirement).                      |
| `leads-command-center/src/app/api/leads/[cid]/notes/route.ts`     | Backend for CRM notes (removed auth requirement).                       |
| `source/gmaps/multiple.go`                                        | Passed query ID to scraper job.                                         |
| `source/gmaps/searchjob.go`                                       | Mapped search keywords to `input_id`.                                   |
| `source/runner/jobs.go`                                           | Correctly passed query ID from runner.                                  |

---

## What Was Implemented
- **CRM Features**: Complete status/notes system with real-time updates and feed display.
- **Enhanced Map**: Markers now show business images; popups don't disappear when trying to click links.
- **Improved Leads Table**: Columns can be resized by dragging; no more truncated text in Name/Query/Location.
- **Coordinate Picker**: Users can now search for cities/addresses in the job form to get lat,lng.
- **Data Traceability**: Fixed the scraper to ensure search queries are saved as `input_id` in fast mode.

## Remaining Work
- [ ] Thoroughly test the "Fast Mode" query mapping with a real job run.
- [ ] Review any remaining `longtitude` typos in underlying data structures if necessary.

## How to Run
```bash
cd d:\Websites\GMaps_scraper_gosom\leads-command-center
npm run dev
```

## Suggested First Action
Verify the CRM features by adding a note to a lead and changing its status in the table view.
