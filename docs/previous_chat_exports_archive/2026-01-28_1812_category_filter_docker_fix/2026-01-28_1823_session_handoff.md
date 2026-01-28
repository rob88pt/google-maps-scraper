# Leads Command Center - Session Handoff

## Project
- **Location:** `d:\Websites\GMaps_scraper_gosom`
- **Repo:** Local development environment

## User's Goal
The user wanted to refine the Filter Section UI (searchable categories, accent-insensitive search), fix a Docker startup error related to the inactivity flag, and implement a "Resend Job" feature for easier duplication of scraping tasks.

---

## Files Created
| File | Purpose                                                        |
| ---- | -------------------------------------------------------------- |
| None | No new source files created, only documentation and artifacts. |

## Files Modified
| File                                                             | What Changed                                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `leads-command-center/src/app/page.tsx`                          | Implemented `handleResendJob`, added menu items, and fixed event propagation. |
| `leads-command-center/src/components/jobs/job-config-dialog.tsx` | Added "Resend" button, passed `onResend` prop, and enabled custom scrolling.  |
| `leads-command-center/src/app/api/jobs/route.ts`                 | Fixed Docker flag parsing (added 'm' suffix to `exitOnInactivity`).           |
| `leads-command-center/src/components/leads/category-filter.tsx`  | Added accent-insensitive search, fixed focus loss, and added search input.    |
| `leads-command-center/src/app/globals.css`                       | Implemented global "Glass" style scrollbars.                                  |

## Key Reference Files
| File                                                            | Why It Matters                                             |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| `leads-command-center/src/app/page.tsx`                         | Main orchestrator for job management and the Jobs page UI. |
| `leads-command-center/src/components/leads/category-filter.tsx` | Core component for category-based lead filtering.          |

---

## What Was Implemented
- **Category Filter Enhancements**: Added a real-time, accent-insensitive search box to the category filter dropdown. Fixed a bug where Radix UI's internal navigation would steal focus while typing.
- **Docker Error Fix**: Resolved `invalid value "1" for flag -exit-on-inactivity` by automatically appending the 'm' (minutes) suffix if a raw number is provided in the job form.
- **Resend Job Functionality**: Added "Resend Job" button to each job row's menu and the Job Configuration dialog. This duplicates the job's queries and parameters for a fresh execution.
- **Global Glass Scrollbars**: Replaced default browser scrollbars with a custom, translucent "Glass" aesthetic across the entire application for a premium feel.
- **Dialog Scrollable Content**: Enabled vertical scrolling in `JobConfigDialog` to ensure all parameters and buttons are accessible on smaller screens.

## Remaining Work
- [ ] **System Testing**: Verify end-to-end stability for sync and decoupled scraper from DB.
- [ ] **Real-time Map Updates**: Implement real-time lead status updates on the Map view (future enhancement).

## How to Run
```powershell
cd d:\Websites\GMaps_scraper_gosom\leads-command-center
npm run dev
```
