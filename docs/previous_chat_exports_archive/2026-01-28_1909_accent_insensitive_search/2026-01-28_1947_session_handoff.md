# GMaps Scraper - Session Handoff

## Project
- **Location:** `d:\Websites\GMaps_scraper_gosom`
- **Repo:** `rob88pt/google-maps-scraper`

## User's Goal
Refine the search functionality for leads by expanding searchable fields to include 'query' (input_id) and fixing a bug where search was accent-sensitive (e.g., "salao" didn't match "Salão").

---

## Files Created
| File                                                                                                                                                            | Purpose                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [007_add_accent_insensitive_search.sql](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/supabase/migrations/007_add_accent_insensitive_search.sql) | Physical migration file for accent-insensitive search. |
| `migration: add_search_index_robust`                                                                                                                            | SQL migration applied via Supabase MCP.                |

## Files Modified
| File                                                                                                     | What Changed                                                                                  |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/route.ts)      | Updated search logic.                                                                         |
| [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/categories/route.ts) | Updated category filtering.                                                                   |
| [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)          | Updated search placeholder and **implemented Table Layout Persistence** (via `localStorage`). |
| [task_list.md](file:///d:/Websites/GMaps_scraper_gosom/docs/task_list.md)                                | Updated task status.                                                                          |
| [active_context.md](file:///d:/Websites/GMaps_scraper_gosom/docs/active_context.md)                      | Updated context.                                                                              |
| [changelog.md](file:///d:/Websites/GMaps_scraper_gosom/docs/changelog.md)                                | Logged search and layout persistence changes.                                                 |

---

## What Was Implemented
- **Optimized Search Index**: Created a generated column `search_index` in the `results` table.
- **Accent-Insensitivity**: Implemented via custom immutable PostgreSQL functions and normalization logic.
- **Query Traceability**: Added `input_id` to searchable fields.
- **Table Layout Persistence**: (User Implemented) Added `localStorage` support for column widths, ordering, and visibility on the Leads page.
- **Migration Tracking**: Saved the SQL migration to `supabase/migrations/007_add_accent_insensitive_search.sql`.

## Remaining Work
- [ ] System Testing: Verify end-to-end stability for sync and decoupled scraper from DB.
- [ ] Monitor performance of the GIN index on `search_index` as the dataset grows significantly.

## How to Run
```bash
cd d:\Websites\GMaps_scraper_gosom\leads-command-center
npm run dev
```

## Dependencies Added
- `unaccent` (PostgreSQL extension) - for accent-insensitive string matching.
