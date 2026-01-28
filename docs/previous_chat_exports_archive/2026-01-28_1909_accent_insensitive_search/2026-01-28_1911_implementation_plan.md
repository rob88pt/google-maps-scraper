# Implementation Plan - Accent-Insensitive Search (Perplexity Optimized)

Implement a high-performance, accent-insensitive search using a generated index column and an immutable `unaccent` wrapper. This approach follows the best practices verified via Perplexity research.

## Proposed Changes

### [Database] Search Optimization

#### [SQL] [Migration]
- **Enable Extensions**: Ensure `unaccent` is enabled. 
- **Immutable Wrapper**: Create `f_unaccent(text)` immutable function (required because standard `unaccent` is STABLE and cannot be used in generated columns).
- **Generated Column**: Add `search_index` to `results` table.
    - Combines `title`, `category`, `address`, `city`, and `input_id`.
    - Applies `f_unaccent()` and `LOWER()` for normalization.
- **Index**: Create a GIN or B-tree index on `search_index` for microsecond-level lookups.

### [Backend] API Routes

#### [MODIFY] [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/route.ts)
- Replace complex JSONB `OR` logic with a simple query against `search_index`.
- Use `f_unaccent(LOWER(%search%))` on the input side to match the index perfectly.

#### [MODIFY] [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/categories/route.ts)
- Sync the filtering logic to use `search_index` for consistent result counts.

## Verification Plan

### Automated Tests
- **Accent Handling**: Search for "salao" and verify it returns "Salão Darling" and "Salão de estética".
- **Performance**: Verify search executes in <10ms for current dataset.
- **Combined Search**: Verify search matches across name, category, and location simultaneously.

### Manual Verification
1. Open Leads page.
2. Search "salao".
3. Verify multiple results appear across different categories/names.



