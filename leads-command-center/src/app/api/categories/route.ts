import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ResultRow } from '@/lib/supabase/types'

/**
 * GET /api/categories
 * Fetches unique categories and their counts, respecting filters.
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)

        // Parse query params (same as leads route to ensure counts match)
        const search = searchParams.get('search')?.trim() || ''
        const minRating = parseFloat(searchParams.get('minRating') || '0')
        const maxRating = parseFloat(searchParams.get('maxRating') || '5')
        const hasEmail = searchParams.get('hasEmail') === 'true'
        const doesNotHaveEmail = searchParams.get('doesNotHaveEmail') === 'true'
        const hasWebsite = searchParams.get('hasWebsite') === 'true'
        const doesNotHaveWebsite = searchParams.get('doesNotHaveWebsite') === 'true'
        const hasPhotos = searchParams.get('hasPhotos') === 'true'

        // Build the query
        // We want to count categories from the 'data' JSONB column
        // Since Supabase doesn't support GROUP BY on JSONB fields directly via the client easily for aggregations,
        // we'll fetch the data and aggregate in memory or use an RPC if available.
        // Given the dataset size (66 rows currently), in-memory aggregation is safe and easy.
        // For larger datasets, an RPC or custom view would be better.

        let query = supabase
            .from('results')
            .select('data')

        // Apply filters
        if (search) {
            query = query.or(
                `data->>title.ilike.%${search}%,` +
                `data->>category.ilike.%${search}%,` +
                `data->>address.ilike.%${search}%,` +
                `data->complete_address->>city.ilike.%${search}%`
            )
        }

        if (minRating > 0) query = query.gte('data->review_rating', minRating)
        if (maxRating < 5) query = query.lte('data->review_rating', maxRating)

        if (hasEmail) {
            query = query.not('data->>emails', 'is', 'null').neq('data->>emails', '[]')
        }
        if (doesNotHaveEmail) {
            query = query.or('data->>emails.is.null,data->>emails.eq.[]')
        }

        if (hasWebsite) query = query.neq('data->>web_site', '')
        if (doesNotHaveWebsite) {
            query = query.or('data->>web_site.is.null,data->>web_site.eq.""')
        }

        if (hasPhotos) {
            query = query.not('data->>images', 'is', 'null').neq('data->>images', '[]')
        }

        const { data: results, error } = await query

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch categories.', details: error.message },
                { status: 500 }
            )
        }

        // Aggregate categories in memory
        const categoryMap: Record<string, number> = {}

        results?.forEach((row: any) => {
            const category = row.data?.category || 'Uncategorized'
            categoryMap[category] = (categoryMap[category] || 0) + 1
        })

        const categories = Object.entries(categoryMap)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)

        return NextResponse.json({ categories })

    } catch (error) {
        console.error('[API] Unexpected error in categories:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
