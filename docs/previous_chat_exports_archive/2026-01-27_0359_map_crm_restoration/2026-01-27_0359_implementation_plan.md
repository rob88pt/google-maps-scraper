# Map Restoration & CRM Enhancements Plan

Restore reverted features and implement new CRM capabilities to improve lead management and data visualization.

## Proposed Changes

### 🔧 Map & Visualization
#### [MODIFY] [map-base.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/ui/map-base.tsx)
- **Tile Fix**: Ensure CartoDB Dark Matter tiles are correctly rendering (Fix blank map).
- **Image Markers**: Replace the simple blue dot pin with a thumbnail image marker (if available) for better visual context without hovering.
- **Interactivity**: Ensure clicking a marker reliably opens the side panel.

#### [MODIFY] [MapPage](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/map/page.tsx)
- Re-verify consistency between the Map side panel and the Leads tab side panel.
- Ensure the map centers on the most recent leads by default.

### 💼 CRM Features
#### [MODIFY] [lead-detail-panel.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)
- **Status Management**: Add a dropdown to update lead status (New, Contacted, Qualified, Closed).
- **Notes System**: Add a section to view and create notes for each lead.
- **Coordinate Display**: Fix the Latitude/Longitude display (resolving the "longtitude" typo).

#### [NEW] [CRM API Endpoints]
- `POST /api/leads/[cid]/notes`: Save new notes to the `lead_notes` table.
- `PATCH /api/leads/[cid]/status`: Update lead status in the `lead_status` table.

### 🔍 Data Traceability & Scraper
#### [MODIFY] [docker.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/lib/docker.ts)
- **Query Mapping**: Ensure `input_id` passed to the scraper matches the actual search query via the `#!#` separator.

#### [NEW] [Migration Script]
- A SQL script to backfill `input_id` in the `results` table for existing jobs where the mapping is unambiguous (single-query jobs).

### 📍 Location Picker
#### [MODIFY] [job-form.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/jobs/job-form.tsx)
- Add a "Search" button next to the Geo Coordinates field.
- Implement a location search dialog using the Nominatim (OpenStreetMap) API to find coordinates for addresses/cities.

## Verification Plan

### Automated Tests
- Run browser tests to verify map rendering and side panel interactivity.
- Test CRM API endpoints using `curl` or internal test scripts.

### Manual Verification
- Create a new job and verify the "Query" column shows the search term.
- Use the new coordinate picker to find a location and start a job.
- Update a lead's status and add a note, then refresh to verify persistence.
