# Copy Reviews JSON Feature

Add one-click JSON copy buttons for reviews and refine the display:
- Deduplicate reviews (Extended > Base set).
- Sort reviews: Text-rich reviews at the top, rating-only at the bottom.
- Add "Review Distribution" summary (chart or text) in the side panel.
- Enhance Side Panel header with Average Rating and Count.
- Relocate System Info (CID, Place ID, Scraped time) to the very bottom of the panel.

---

## Proposed Changes

### LeadsTable Component

#### [MODIFY] [leads-table.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/leads-table.tsx)

**1. Update `RatingDisplay` component (lines 123-134)**
- Add an optional `reviews` prop to pass the reviews array
- Add a copy button next to the review count `(count)`
- Reuse the existing `CellCopyButton` pattern for consistency
- The button should only appear if reviews exist (length > 0)

**Current:**
```tsx
function RatingDisplay({ rating, count }: { rating: number; count: number }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                <Star className={...} />
                <span ...>{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-500">({count})</span>
        </div>
    )
}
```

**After:**
```tsx
function RatingDisplay({ rating, count, reviews }: { 
    rating: number; 
    count: number; 
    reviews?: Review[] 
}) {
    return (
        <div className="flex items-center gap-1.5 group">
            <div className="flex items-center gap-0.5">
                <Star className={...} />
                <span ...>{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-500">({count})</span>
            {reviews && reviews.length > 0 && (
                <CellCopyButton 
                    text={JSON.stringify(reviews, null, 2)} 
                    label="Reviews JSON" 
                />
            )}
        </div>
    )
}
```

**2. Update Rating column cell (line 317-322)**
- Pass the combined reviews array to `RatingDisplay`

**Current:**
```tsx
cell: ({ row }) => (
    <RatingDisplay
        rating={row.getValue('review_rating') as number}
        count={row.original.review_count}
    />
),
```

**After:**
```tsx
cell: ({ row }) => {
    // Prefer extended reviews if available, otherwise fall back to regular reviews
    const reviews = row.original.user_reviews_extended?.length 
        ? row.original.user_reviews_extended 
        : row.original.user_reviews || []
    return (
        <RatingDisplay
            rating={row.getValue('review_rating') as number}
            count={row.original.review_count}
            reviews={reviews.length > 0 ? reviews : undefined}
        />
    )
},
```

---

### LeadDetailPanel Component

#### [MODIFY] [lead-detail-panel.tsx](file:///d:/Websites/GMaps_scraper_gosom/leads-command-center/src/components/leads/lead-detail-panel.tsx)

**1. Add copy button to Reviews section heading (lines 771-775)**

**After:**
```tsx
<div className="flex items-center justify-between">
    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Star className="h-4 w-4" />
        Reviews ({(lead.user_reviews?.length || 0) + (lead.user_reviews_extended?.length || 0)})
    </h4>
    <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-slate-500 hover:text-white"
        title="Copy Reviews as JSON"
        onClick={() => {
            // Prefer extended reviews if available (avoids duplicates)
            const reviews = lead.user_reviews_extended?.length 
                ? lead.user_reviews_extended 
                : lead.user_reviews || []
            copy(JSON.stringify(reviews, null, 2), 'Reviews JSON')
        }}
    >
        <Copy className="h-3.5 w-3.5" />
    </Button>
</div>
```

---

## Data Export Deduplication

> **Rule:** When exporting lead data, prefer `user_reviews_extended` if available, otherwise use `user_reviews`. Never include both to avoid duplicates.

### Helper Function (shared logic)

Create a utility to normalize leads before export (Deduplicate + Sort):

```tsx
function normalizeLeadForExport(lead: Lead): Lead {
    // Prefer extended, then base. 
    // Sort reviews: those with descriptions first, rating-only last.
    const reviews = (lead.user_reviews_extended?.length 
        ? lead.user_reviews_extended 
        : lead.user_reviews || [])
        .sort((a, b) => {
            const aHasText = !!(a.Description && a.Description.trim())
            const bHasText = !!(b.Description && b.Description.trim())
            if (aHasText && !bHasText) return -1
            if (!aHasText && bHasText) return 1
            return 0
        })
    
    return {
        ...lead,
        user_reviews: reviews,
        user_reviews_extended: undefined,
    }
}
```

---

### [NEW] Review Distribution Chart (LeadDetailPanel)

**1. Create a `RatingDistribution` component**
- A simple bar chart showing counts for 1-5 stars.
- Calculates distribution from the `user_reviews` array.
- Place it between the header and the review list.

```tsx
function RatingDistribution({ reviews }: { reviews: Review[] }) {
    const distribution = reviews.reduce((acc, r) => {
        const rating = Math.floor(r.Rating)
        if (rating >= 1 && rating <= 5) acc[rating] = (acc[rating] || 0) + 1
        return acc
    }, {} as Record<number, number>)

    const maxCount = Math.max(...Object.values(distribution), 1)

    return (
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-2 mb-4">
            {[5, 4, 3, 2, 1].map(star => {
                const count = distribution[star] || 0
                const percent = (count / maxCount) * 100
                return (
                    <div key={star} className="flex items-center gap-2 text-[10px]">
                        <div className="flex items-center gap-1 w-8 shrink-0">
                            <span className="text-slate-400">{star}</span>
                            <Star className="h-2 w-2 text-yellow-500 fill-yellow-500" />
                        </div>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500/50" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-4 text-slate-500 text-right">{count}</span>
                    </div>
                )
            })}
        </div>
    )
}
```

---

### [MODIFY] lead-detail-panel.tsx - Header & Review Rendering

**1. Update Header UI (lines 771-775)**
- Show Rating and Official Count.

**After:**
```tsx
<div className="flex items-center justify-between">
    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Star className="h-4 w-4" />
        Reviews
        {lead.review_rating !== undefined && (
            <span className="ml-1 text-white normal-case">
                {lead.review_rating.toFixed(1)} ({lead.review_count})
            </span>
        )}
    </h4>
    ...
</div>
```

**2. Update Review Rendering Logic (line 778+)**
- Use `normalizeLeadForExport` for the display set.
- Add `<RatingDistribution reviews={normalized.user_reviews} />` before the list.

---

### [MODIFY] export/route.ts - Bulk Export API

- Apply `sort` (text first) in `normalizeLeadForExport`.

---

## Verification Plan

### Manual Browser Test
1. **Leads Table - Copy Reviews JSON:**
   - Hover over row with reviews → Copy button appears next to count
   - Click → Verify JSON contains only one set of reviews (no duplicates)

2. **Leads Table - Row Actions → Copy as JSON:**
   - Click "..." actions menu → "Copy as JSON"
   - Paste → Verify `user_reviews_extended` is removed, only `user_reviews` exists

3. **Side Panel - Copy JSON (header):**
   - Open lead detail panel
   - Click Copy icon in header
   - Paste → Verify deduplicated review structure

4. **Side Panel - Export JSON (download):**
   - Click Download icon in header
   - Open downloaded file → Verify deduplicated structure

5. **Bulk Export (multiple leads):**
   - Select multiple leads → Export as JSON
   - Open file → Verify all leads have deduplicated reviews
