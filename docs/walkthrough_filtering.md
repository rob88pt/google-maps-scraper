# Walkthrough - Filtering & Search Logic Fixes

## Overview
This walkthrough covers the fixes implemented to ensure robust filtering and search functionality in the Leads Command Center, and the investigation into broken image links.

## Broken Image Investigation
- **Symptom**: User reported broken images on "page 2" (specifically leads like "Cheers O Bar"). Logs showed 404s for `http://localhost:3000/www.google.com/local/imagery/report...`.
- **Finding**: While the main `thumbnail` and `images` for "Cheers O Bar" are valid, we found **broken "Report this photo" links in the User Reviews**. 
- **Proof**: Lead ID 11 ("Cheers O Bar") has a review by "miguel pinto" containing an image: `www.google.com/local/imagery/report/?cb_client=maps_sv.tactile&image_key=...`.
- **Root Cause**: Next.js 404s because the URL lacks a protocol (`http://` or `https://`), so the browser treats it as relative. The Scraper (`entry.go`) is incorrectly extracting these "report" links as valid images.
- **Fix Plan**: Modify `source/gmaps/entry.go` to filter out URLs containing "imagery/report" during extraction.

## Changes Made
1.  **Fixed City Search Syntax**:
    - **Issue**: The API was using `data->>complete_address->city`, which incorrectly attempted to access a property on a text representation of the JSON object.
    - **Fix**: Changed to `data->complete_address->city` in `src/app/api/leads/route.ts` to correctly traverse the JSONB column.

2.  **Implemented "Has Photos" Filter**:
    - **Issue**: The "Has Photos" checkbox in the UI was not connected to the backend logic.
    - **Fix**:
        - Added `hasPhotos` parameter to `src/lib/hooks/use-leads.ts`.
        - Added query logic in `src/app/api/leads/route.ts` to filter for leads where `data->images` is not empty and not null.

3.  **Fixed "Has Email" Filter Logic**:
    - **Issue**: The original filter `query.not('data->emails', 'eq', '[]')` failed to exclude `null` values because `null != []` is true. Additionally, accessing JSON objects directly caused type errors in some cases.
    - **Fix**: Updated to use text extraction `data->>emails`.
    - **New Logic**: `query.not('data->>emails', 'is', 'null').neq('data->>emails', '[]')`.
    - **Outcome**: Correctly filters out records where emails are null or empty. Verified that all current DB records have null emails, so the filter correctly returns 0 results.

## Verification

### SQL Verification
We verified the JSONB paths directly against the database using `execute_sql`.

**Query 1: City Search Path**
```sql
SELECT (data->'complete_address'->>'city') as city FROM results LIMIT 1;
-- Result: "Sátão" (Correctly extracted)
```

**Query 2: Has Photos Path**
```sql
SELECT (data->'images') as images FROM results WHERE (data->'images') IS NOT NULL LIMIT 1;
-- Result: [{"image": "...", ...}] (Correctly returns array)
```

### Logic Verification
- **Search**: The `.or()` clause now correctly searches:
  - Title: `data->title`
  - Category: `data->category`
  - Address: `data->address`
  - City: `data->complete_address->city`
- **Filters**:
  - `minRating`: Checks `data->review_rating`.
  - `hasEmail`: Checks `data->emails` != `[]`.
  - `hasWebsite`: Checks `data->web_site` != `''`.
  - `hasPhotos`: Checks `data->images` != `[]` AND NOT NULL.

## Next Steps
- Verify the "Review Display" casing issue (PascalCase vs snake_case) on the frontend.
- Perform end-to-end system testing in the browser.
