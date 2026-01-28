# GMaps Scraper - Session Handoff

## Project
- **Location:** `d:\Websites\GMaps_scraper_gosom`
- **Repo:** `rob88pt/google-maps-scraper`

## User's Goal
Refine the search functionality for leads by expanding searchable fields to include 'query' (input_id) and fixing a bug where search was accent-sensitive (e.g., "salao" didn't match "Salão").

---

## Files Created
| File                                 | Purpose                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `migration: add_search_index_robust` | SQL migration creating an immutable unaccent wrapper and a generated `search_index` column. |

## Files Modified
| File                                                                                                     | What Changed                                                                              |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/route.ts)      | Updated to use `search_index` column and normalize search input for accent-insensitivity. |
| [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/categories/route.ts) | Updated category filtering to match the new search logic.                                 |
| [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)          | Updated search input placeholder to reflect new query search capability.                  |
| [task_list.md](file:///d:/Websites/GMaps_scraper_gosom/docs/task_list.md)                                | Moved search refinement tasks to "Done".                                                  |
| [active_context.md](file:///d:/Websites/GMaps_scraper_gosom/docs/active_context.md)                      | Updated with details on the accent-insensitive search fix.                                |
| [changelog.md](file:///d:/Websites/GMaps_scraper_gosom/docs/changelog.md)                                | Formally logged the search refinement and database-level fixes.                           |

---

## What Was Implemented
- **Optimized Search Index**: Created a generated column `search_index` in the `results` table that aggregates `title`, `category`, `address`, `city`, and `input_id`.
- **Accent-Insensitivity**: Implemented via a custom immutable PostgreSQL function `f_unaccent` (wrapping the `unaccent` extension).
- **Search Logic Refinement**: Normalized frontend search terms (NFD normalization + regex) and backend queries to ensure perfect matching regardless of special characters.
- **Traceability**: Added the original scraping query (`input_id`) to the searchable fields.

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
