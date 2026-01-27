# Implementation Plan: Category Column with Filter and Text Wrapping

## Goal
Add a "Category" column to the Leads table with a category filter dropdown (with counts), change "leads" to "results" in the count display, and enable text wrapping in table columns.

---

## Context for Executing Agent

### Project Location
`D:\Websites\GMaps_scraper_gosom\leads-command-center`

### Tech Stack
- **Framework**: Next.js 16.1 (App Router)
- **UI**: shadcn/ui components, TailwindCSS
- **Data**: Supabase MCP, TanStack Query
- **Table**: TanStack Table v8

### Key Files to Understand
| File                                                                                                                     | Purpose                                         |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| [page.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/leads/page.tsx)                          | Leads page - manages filters, state, and layout |
| [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)     | Table component with column definitions         |
| [leads-filters.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-filters.tsx) | Filter popover component                        |
| [use-leads.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/lib/hooks/use-leads.ts)                  | React Query hooks for fetching leads            |
| [route.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/app/api/leads/route.ts)                      | API endpoint for leads with filtering           |
| [types.ts](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/lib/supabase/types.ts)                       | TypeScript types for Lead data                  |

### Data Structure
The `results` table stores business data in a JSONB `data` column. Relevant fields:
- `data->>'category'` - Primary category string (e.g., "Loja de costura")
- `data->'categories'` - Array of all categories

---

## Proposed Changes

### 1. New API Endpoint for Category Aggregation

> [!IMPORTANT]
> This endpoint uses Supabase MCP to query category counts. It respects the same filters as the main leads query so the counts reflect the filtered dataset.

#### [NEW] `src/app/api/categories/route.ts`

Create a new API route that returns distinct categories with their counts:

```typescript
// GET /api/categories
// Returns: { categories: { category: string; count: number }[] }

// SQL to execute via Supabase:
// SELECT data->>'category' as category, COUNT(*) as count
// FROM results
// WHERE [apply same filters as leads query]
// GROUP BY data->>'category'
// ORDER BY count DESC
```

**Implementation details:**
- Accept the same filter query params as `/api/leads` (search, minRating, maxRating, hasEmail, etc.)
- Apply filters identically so counts match the filtered view
- Return sorted by count descending

---

### 2. New Hook for Categories

#### [NEW] `src/lib/hooks/use-categories.ts`

Create a hook to fetch category data:

```typescript
export interface CategoryCount {
    category: string;
    count: number;
}

export interface CategoriesResponse {
    categories: CategoryCount[];
}

export function useCategories(filters: LeadsQueryOptions) {
    return useQuery({
        queryKey: ['categories', filters],
        queryFn: () => fetchCategories(filters),
        staleTime: 30 * 1000,
    });
}
```

---

### 3. Category Filter Component

#### [NEW] `src/components/leads/category-filter.tsx`

Create a single-select dropdown for category filtering:

```tsx
// Props:
// - categories: CategoryCount[]
// - selectedCategory: string | null
// - onCategoryChange: (category: string | null) => void
// - isLoading: boolean

// UI Structure:
// <DropdownMenu>
//   <DropdownMenuTrigger>
//     Category <ChevronDown />
//     {selectedCategory && <Badge>{selectedCategory}</Badge>}
//   </DropdownMenuTrigger>
//   <DropdownMenuContent>
//     <DropdownMenuItem onClick={() => onCategoryChange(null)}>
//       All Categories
//     </DropdownMenuItem>
//     <Separator />
//     {categories.map(cat => (
//       <DropdownMenuItem onClick={() => onCategoryChange(cat.category)}>
//         {cat.category} <Badge variant="secondary">({cat.count})</Badge>
//       </DropdownMenuItem>
//     ))}
//   </DropdownMenuContent>
// </DropdownMenu>
```

**Styling:**
- Use same button styling as existing filter buttons (`variant="outline"`, `border-slate-700`, `bg-transparent`)
- Show selected category as a badge on the trigger button
- Display counts in muted badge next to each category name

---

### 4. Update Leads Page

#### [MODIFY] `src/app/leads/page.tsx`

**Changes:**

1. **Add state for selected category:**
   ```tsx
   const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
   ```

2. **Fetch categories with useCategories hook:**
   ```tsx
   const { data: categoriesData, isLoading: categoriesLoading } = useCategories(queryOptions)
   ```

3. **Pass category filter to API:**
   Add `category` to `queryOptions`:
   ```tsx
   const queryOptions: LeadsQueryOptions = React.useMemo(() => ({
       ...existing options,
       category: selectedCategory || undefined,
   }), [page, debouncedSearch, filters, selectedCategory])
   ```

4. **Add CategoryFilter to toolbar:**
   Insert between the Filters button and Columns button:
   ```tsx
   <CategoryFilter
       categories={categoriesData?.categories ?? []}
       selectedCategory={selectedCategory}
       onCategoryChange={setSelectedCategory}
       isLoading={categoriesLoading}
   />
   ```

5. **Change "leads found" to "results found":**
   Line 138: Change `{data?.total ?? 0} leads found` to `{data?.total ?? 0} results found`

6. **Add 'category' to column visibility toggle:**
   Line 156: Add `'category'` to the array of toggleable columns

---

### 5. Update API Route

#### [MODIFY] `src/app/api/leads/route.ts`

**Add category filter support:**

1. Parse the new query param:
   ```typescript
   const category = searchParams.get('category')?.trim() || null
   ```

2. Apply filter:
   ```typescript
   if (category) {
       query = query.eq('data->>category', category)
   }
   ```

---

### 6. Update Hooks

#### [MODIFY] `src/lib/hooks/use-leads.ts`

**Add category to LeadsQueryOptions:**

```typescript
export interface LeadsQueryOptions {
    // ... existing options
    category?: string
}
```

**Update fetchLeads to include category param:**
```typescript
if (options.category) params.set('category', options.category)
```

---

### 7. Add Category Column to Table

#### [MODIFY] `src/components/leads/leads-table.tsx`

**Add new column definition after 'title' column (around line 188):**

```tsx
{
    id: 'category',
    accessorKey: 'category',
    header: ({ column }) => (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-slate-400 hover:text-white -ml-4"
        >
            Category
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
    ),
    cell: ({ row }) => (
        <div className="text-sm text-slate-300 whitespace-normal break-words">
            {row.getValue('category') || '—'}
        </div>
    ),
    size: 180,
},
```

**Remove category subtitle from 'title' column:**
Line 184: Delete `<div className="text-xs text-slate-500">{row.original.category}</div>`

**Update getColumnLabel helper:**
Add case for 'category':
```typescript
case 'category': return 'Category'
```

---

### 8. Enable Text Wrapping in Table Cells

#### [MODIFY] `src/components/leads/leads-table.tsx`

**Update TableCell styling (around line 502-506):**

Change the cell content styling to allow text wrapping:

```tsx
<TableCell
    key={cell.id}
    style={{ width: cell.column.getSize() }}
    className="overflow-hidden py-3"
>
    <div className="whitespace-normal break-words">
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
</TableCell>
```

**Or**, update individual cell definitions to use `whitespace-normal break-words` class on their content divs. Target these columns specifically:
- `title` (line 182-186)
- `category` (new column)
- `complete_address` (line 212-220)

---

### 9. Update Empty State Message

#### [MODIFY] `src/components/leads/leads-table.tsx`

Line 521: Change `No leads found.` to `No results found.`

---

## Files Summary

| Action     | File                                       |
| ---------- | ------------------------------------------ |
| **NEW**    | `src/app/api/categories/route.ts`          |
| **NEW**    | `src/lib/hooks/use-categories.ts`          |
| **NEW**    | `src/components/leads/category-filter.tsx` |
| **MODIFY** | `src/app/leads/page.tsx`                   |
| **MODIFY** | `src/app/api/leads/route.ts`               |
| **MODIFY** | `src/lib/hooks/use-leads.ts`               |
| **MODIFY** | `src/components/leads/leads-table.tsx`     |

---

## Verification Plan

### Manual Testing
1. **Category Column:**
   - Verify new "Category" column appears between Name and Query
   - Confirm category text wraps if longer than column width
   - Confirm category is no longer displayed as subtitle under business name

2. **Category Filter:**
   - Open dropdown and verify all categories are listed with counts
   - Select a category → verify table filters to show only that category
   - Verify count in header updates to reflect filtered count
   - Verify "All Categories" option clears the filter

3. **Text Wrapping:**
   - Resize columns and verify text wraps instead of being truncated
   - Test on columns: Name, Category, Location

4. **Terminology:**
   - Verify "X results found" displays (not "X leads found")
   - Verify "No results found." in empty state

### Browser Testing
Run the dev server and test at `http://localhost:3000/leads`:
```bash
cd D:\Websites\GMaps_scraper_gosom\leads-command-center
npm run dev
```

---

## Documentation Updates

After implementation, update:
- `docs/active_context.md` - Add entry for Category column feature
- `docs/changelog.md` - Log the changes
- `docs/task_list.md` - Mark task as complete
