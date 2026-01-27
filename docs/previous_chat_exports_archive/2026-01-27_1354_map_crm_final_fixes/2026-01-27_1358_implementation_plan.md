# Map Restoration & CRM Implementation Plan

Restore full map functionality, implement CRM features (notes and status), and improve data traceability.

## User Review Required

> [!IMPORTANT]
> **Data Backfill**: The `input_id` backfill for old results can only be performed automatically for jobs with a single query. Jobs with multiple queries cannot be reliably mapped without re-running the scraper.

> [!WARNING]
> **Coordinate Typos**: The database schema and scraper output use `longtitude` (with an extra 't'). I will create a migration to add a `longitude` column and fix it in the UI, but I'll keep the legacy field in the API for compatibility if needed.

## Proposed Changes

---

### [Component] Map Restoration

#### [MODIFY] [map-base.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/ui/map-base.tsx)
- Use thumbnail images as map markers instead of blue dots.
- Implement custom HTML markers using `maplibregl.Marker`.
- Ensure markers display the business image if available, falling back to a category-based icon.

#### [MODIFY] [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/map/page.tsx)
- Ensure map automatically centers on the results of the last completed job upon opening.
- Update side panel logic to match the leads tab (reuse `LeadDetailPanel` with correct styling).

---

### [Component] CRM Features

#### [NEW] [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/[cid]/notes/route.ts)
- Implement `POST` handler to create/update lead notes.
- Implement `GET` handler to fetch notes for a specific lead CID.

#### [NEW] [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/[cid]/status/route.ts)
- Implement `PATCH` handler to update lead status (`new`, `contacted`, `qualified`, `closed`).

#### [MODIFY] [lead-detail-panel.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)
- Add a status selection dropdown.
- Add a notes textarea with local persistence/autosave.
- Fix the display of Latitude/Longitude (using the corrected spelling).

---

### [Component] Data Traceability & Scraper Fixes

#### [MODIFY] [multiple.go](file:///d:/Websites/GMaps_scraper_gosom/source/gmaps/multiple.go)
- Pass the search query to `ParseSearchResults` to ensure `input_id` is correctly set in fast mode.

#### [MODIFY] [searchjob.go](file:///d:/Websites/GMaps_scraper_gosom/source/gmaps/searchjob.go)
- Capture the query from `params` and pass it to the parser.

#### [NEW] [007_backfill_input_id.sql](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/supabase/migrations/007_backfill_input_id.sql)
- SQL script to map `input_id` from the `jobs` table to `results` for unambiguous cases (single-query jobs).

---

### [Component] Coordinate Picker

#### [MODIFY] [job-form.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/jobs/job-form.tsx)
- Add a "Search" button next to the Geo Coordinates field.
- Implement a `LocationSearchDialog` that uses Nominatim API to find coordinates for addresses/cities.

## Verification Plan

### Automated Tests
- Run `npm run test` for frontend component validation (if existing).
- Run `go test ./...` in the `source/gmaps` directory to verify scraper parsing.

### Manual Verification
1. **Map**: Open the map tab and verify that business thumbnails appear as markers and the map centers on recent results.
2. **CRM**: Open a lead, change its status, and add a note. Refresh the page to ensure changes are persisted.
3. **Traceability**: Run a "Fast Mode" job and verify that the "Query" column in the leads table shows the search term instead of a Google ID.
4. **Picker**: Use the new search button in the job form to find coordinates for "Lisbon" and verify it populates the field correctly.
