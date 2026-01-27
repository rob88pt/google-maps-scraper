import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ResultRow, Lead } from '@/lib/supabase/types'

export interface LeadsResponse {
    leads: (Lead & { id: number; created_at: string })[]
    total: number
    page: number
    pageSize: number
}

/**
 * GET /api/leads
 * Fetches paginated leads with search, filter, and sort options.
 * 
 * Query params:
 * - page: Page number (1-indexed, default: 1)
 * - pageSize: Items per page (default: 25, max: 100)
 * - search: Search term for title, category, address
 * - minRating: Minimum rating filter
 * - maxRating: Maximum rating filter
 * - hasEmail: Filter for leads with emails
 * - hasWebsite: Filter for leads with website
 * - sortBy: Field to sort by (title, rating, review_count, created_at)
 * - sortOrder: asc or desc
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)

        // Parse query params
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '25')))
        const search = searchParams.get('search')?.trim() || ''
        const minRating = parseFloat(searchParams.get('minRating') || '0')
        const maxRating = parseFloat(searchParams.get('maxRating') || '5')
        const hasEmail = searchParams.get('hasEmail') === 'true'
        const doesNotHaveEmail = searchParams.get('doesNotHaveEmail') === 'true'
        const hasWebsite = searchParams.get('hasWebsite') === 'true'
        const doesNotHaveWebsite = searchParams.get('doesNotHaveWebsite') === 'true'
        const hasPhotos = searchParams.get('hasPhotos') === 'true'
        const category = searchParams.get('category')?.trim() || ''
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

        // Calculate offset
        const offset = (page - 1) * pageSize

        // Build the query - results table has JSONB 'data' column
        let query = supabase
            .from('results')
            .select('id, data, created_at, user_id', { count: 'exact' })

        // Apply JSONB filters using Supabase's json operators
        // Note: These work on the 'data' JSONB column

        // For search, we need to use textSearch or ilike on extracted fields
        // Supabase supports: data->>'field' for text extraction
        if (search) {
            // Search in title, category, and address
            query = query.or(
                `data->>title.ilike.%${search}%,` +
                `data->>category.ilike.%${search}%,` +
                `data->>address.ilike.%${search}%,` +
                `data->complete_address->>city.ilike.%${search}%`
            )
        }

        // Category filter
        if (category) {
            query = query.eq('data->>category', category)
        }

        // Rating filter - compare numeric values in JSONB
        if (minRating > 0) {
            query = query.gte('data->review_rating', minRating)
        }
        if (maxRating < 5) {
            query = query.lte('data->review_rating', maxRating)
        }

        // Has email filter - check if emails array is not empty
        // data->>emails returns SQL NULL if json is null, or string representation
        if (hasEmail) {
            query = query.not('data->>emails', 'is', 'null').neq('data->>emails', '[]')
        }

        // Does not have email filter
        if (doesNotHaveEmail) {
            query = query.or('data->>emails.is.null,data->>emails.eq.[]')
        }

        // Has website filter
        if (hasWebsite) {
            query = query.neq('data->>web_site', '')
        }

        // Does not have website filter
        if (doesNotHaveWebsite) {
            // Check for null or empty string
            query = query.or('data->>web_site.is.null,data->>web_site.eq.""')
        }

        // Has photos filter
        if (hasPhotos) {
            // Check that images array is not empty and not null
            query = query.not('data->>images', 'is', 'null').neq('data->>images', '[]')
        }

        // Apply sorting
        // For JSONB fields, we need to use the arrow operator
        const validSortFields: Record<string, string> = {
            'title': 'data->title',
            'review_rating': 'data->review_rating',
            'review_count': 'data->review_count',
            'created_at': 'created_at',
            'category': 'data->category',
            'city': 'data->complete_address->city',
            'input_id': 'data->input_id'
        }

        const sortField = validSortFields[sortBy] || 'created_at'
        query = query.order(sortField, { ascending: sortOrder === 'asc' })

        // Apply pagination
        query = query.range(offset, offset + pageSize - 1)

        // Execute query
        const { data: results, error, count } = await query

        if (error) {
            console.error('[API] Failed to fetch leads:', error)
            return NextResponse.json(
                { error: 'Failed to fetch leads.', details: error.message },
                { status: 500 }
            )
        }

        // Transform results - extract lead data from JSONB
        const leads = (results as ResultRow[] || []).map(row => ({
            ...row.data,
            id: row.id,
            created_at: row.created_at
        }))

        const response: LeadsResponse = {
            leads,
            total: count || 0,
            page,
            pageSize
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('[API] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}
