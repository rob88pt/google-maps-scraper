# Implementation Plan - Filter Logic Fix

## Goal Description
Fix the filtering and search functionality in the Leads Command Center, specifically addressing a bug in the JSONB path syntax for city search and verifying overall filter behavior.

## User Review Required
None. Changes are backend API logic fixes.

## Proposed Changes

### Broken Review Images [BUG]
#### [MODIFY] [entry.go](file:///d:/Websites/GMaps_scraper_gosom/source/gmaps/entry.go)
- In `parseReviews`, valid image URLs are blindly extracted from the RPC response.
- "Report this photo" links (`www.google.com/local/imagery/report/...`) are improperly included.
- **Fix**: Add a check to exclude any URL containing "imagery/report" or ensure it contains likely image domains.

### Backend API
#### [MODIFY] [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/route.ts)
- Update search query to use `->>` for text extraction: `data->>title`, `data->>category`, `data->>address`, `data->complete_address->>city`.
- Update `hasWebsite` filter to use `data->>web_site`.
- Implement `hasPhotos` filter logic to check if `data->images` array is not empty.

#### [MODIFY] [use-leads.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/lib/hooks/use-leads.ts)
- Add `hasPhotos` parameter to `fetchLeads` function and query parameters.

## Verification Plan

### Automated Verification
- Use `mcp_supabase-mcp-server_execute_sql` to verify that the corrected SQL syntax returns results while the old one would fail or return nothing.
- Use `test_api.js` (once populated with data) or `curl` to smoke test the API responses (Verified manually via code review of the API logic).

### Manual Verification
1.  **Search**:
    - Enter a city name (e.g., "Viseu") in the search bar.
    - Verify leads from that city are returned.
2.  **Filtering**:
    - Set Min Rating to 4.5.
    - Verify all returned leads have rating >= 4.5.
    - Toggle "Has Email".
    - Verify all returned leads have a non-empty emails array.
3.  **Combined**:
    - Search for a common term (e.g., "Bar") AND set Min Rating to 4.0.
    - Verify results match both criteria.
