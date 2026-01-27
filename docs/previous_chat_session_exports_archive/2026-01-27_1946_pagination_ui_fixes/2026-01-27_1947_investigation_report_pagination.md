# Investigation Report: UI Pagination & Lead Count Discrepancy

**Date:** 2026-01-27
**Subject:** Conflict between Server-Side and Client-Side Pagination

## 1. Issue Summary
The user reported three specific UI anomalies in the Leads table:
1.  **Dual Controls:** Two sets of "Previous" and "Next" buttons appearing simultaneously.
2.  **Count Inconsistency:** The UI showing "66 leads found" but also "0 of 25 row(s) selected".
3.  **Page Count Paradox:** Showing "1 of 3" pages for 60+ leads when only 3 pages were expected.

## 2. Technical Root Cause
The system is suffering from **Nested Pagination**. The frontend is implementing two independent pagination engines that are unaware of each other:

### A. Server-Side Pagination (managed in `page.tsx`)
- **Location:** [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
- **Logic:** Calls the API with `pageSize: 25` (line 36).
- **Navigation:** Renders buttons that increment/decrement the `page` state variable, triggering a new Supabase query via the `useLeads` hook.
- **Result:** This engine correctly calculates 3 total pages ($66/25 = 2.64 \rightarrow 3$) and renders the bottom-most navigation controls.

### B. Client-Side Pagination (managed in `leads-table.tsx`)
- **Location:** [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- **Logic:** Uses TanStack Table (`useReactTable`) with `getPaginationRowModel()` enabled (line 350).
- **Navigation:** TanStack Table defaults to a client-side page size of **10**. It renders its own set of buttons (lines 494-511) to navigate the *subset* of data it received from the server.
- **Result:** Even though the server sent 25 leads (one full server-page), the table component splits those 25 leads into two pages of 10 and one page of 5.

## 3. Discrepancy Breakdown
- **"66 leads found":** This is the correct total count returned by the Supabase query (`count: exact`).
- **"0 of 25 row(s) selected":** The number **25** refers to the current server-side batch size. The table component correctly detects that it has exactly 25 rows in memory, which it then attempts to sub-paginate.
- **Dual Buttons:** One set navigates the 10-lead chunks (client-side), the other set navigates the 25-lead batches (server-side).

# Implementation Plan

To resolve this, we will consolidate the navigation logic into a single server-side engine and remove the redundant client-side pagination.

## Proposed Changes

### [Component] Leads Table
- **Location:** [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)
- **Action:**
    - Disable TanStack pagination by removing `getPaginationRowModel()`.
    - Delete the redundant `Previous`/`Next` buttons and the "row(s) selected" footer within this component.

### [Component] Leads Page
- **Location:** [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)
- **Action:**
    - Ensure the single set of pagination buttons at the bottom remains the primary navigation.
    - Keep the existing logic that manages the `page` state and `pageSize: 25`.

## Verification Plan
1.  Verify that only **one** set of pagination buttons exists.
2.  Confirm that clicking "Next" loads the next batch of 25 leads from the database.
3.  Confirm that the "66 leads found" header remains accurate.
