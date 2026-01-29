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
        const websiteType = searchParams.get('websiteType') || 'all'
        const hasPhotos = searchParams.get('hasPhotos') === 'true'
        const hasReviews = searchParams.get('hasReviews') === 'true'
        const noReviews = searchParams.get('noReviews') === 'true'
        const minReviewCount = searchParams.get('minReviewCount') ? parseInt(searchParams.get('minReviewCount')!) : null
        const maxReviewCount = searchParams.get('maxReviewCount') ? parseInt(searchParams.get('maxReviewCount')!) : null
        const category = searchParams.get('category')?.trim() || ''
        const includeArchived = searchParams.get('includeArchived') === 'true'
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

        // Calculate offset
        const offset = (page - 1) * pageSize

        // Build the query - join with lead_status and lead_notes
        let query = supabase
            .from('results')
            .select(`
                id, 
                data, 
                created_at, 
                user_id,
                cid,
                lead_status(status),
                lead_notes(count)
            `, { count: 'exact' })

        // Apply archived filter
        if (!includeArchived) {
            // Postgrest doesn't support complex joins in filters easily via the client
            // We can use the 'not.exists' or similar if we were using a different structure,
            // but here we can filter by the joined table.
            // Note: This requires lead_status to be joined.
            query = query.or('status.neq.archived,status.is.null', { foreignTable: 'lead_status' })
        }

        // For search, we use the optimized search_index column
        // We normalize the search term to match the index (lowercase + unaccented)
        if (search) {
            const normalizedSearch = search
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()

            query = query.ilike('search_index', `%${normalizedSearch}%`)
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

        // Has reviews filter
        if (hasReviews) {
            query = query.gt('data->review_count', 0)
        }

        // No reviews filter
        if (noReviews) {
            query = query.or('data->review_count.eq.0,data->review_count.is.null')
        }

        // Review Count Range Filter
        if (minReviewCount !== null) {
            query = query.gte('data->review_count', minReviewCount)
        }
        if (maxReviewCount !== null) {
            query = query.lte('data->review_count', maxReviewCount)
        }

        // Does not have email filter
        if (doesNotHaveEmail) {
            query = query.or('data->>emails.is.null,data->>emails.eq.[]')
        }

        // Website Type filter
        if (websiteType === 'proper') {
            // Has website AND is NOT social media
            query = query.neq('data->>web_site', '').not('data->>web_site', 'is', null)
                .not('data->>web_site', 'ilike', '%facebook.com%')
                .not('data->>web_site', 'ilike', '%fb.com%')
                .not('data->>web_site', 'ilike', '%fb.watch%')
                .not('data->>web_site', 'ilike', '%instagram.com%')
                .not('data->>web_site', 'ilike', '%instagr.am%')
                .not('data->>web_site', 'ilike', '%twitter.com%')
                .not('data->>web_site', 'ilike', '%x.com%')
        } else if (websiteType === 'social') {
            // Has website AND IS social media
            query = query.or(
                'data->>web_site.ilike.%facebook.com%,' +
                'data->>web_site.ilike.%fb.com%,' +
                'data->>web_site.ilike.%fb.watch%,' +
                'data->>web_site.ilike.%instagram.com%,' +
                'data->>web_site.ilike.%instagr.am%,' +
                'data->>web_site.ilike.%twitter.com%,' +
                'data->>web_site.ilike.%x.com%'
            )
        } else if (websiteType === 'none') {
            // No website
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

        // Transform results - extract lead data and enrich with CRM status/metadata
        const leads = (results as any[] || []).map(row => {
            const leadData = row.data as Lead

            // Flatten joined data
            const statusObj = row.lead_status as { status: string } | { status: string }[] | null
            const notesObj = row.lead_notes as { count: number } | { count: number }[] | null

            // Supabase returns array even for single if joined, or object depending on version/config
            const crm_status = Array.isArray(statusObj)
                ? (statusObj[0]?.status || 'new')
                : (statusObj?.status || 'new')

            const notes_count = Array.isArray(notesObj)
                ? (notesObj[0]?.count || 0)
                : (notesObj?.count || 0)

            return {
                ...leadData,
                id: row.id,
                created_at: row.created_at,
                crm_status,
                notes_count
            }
        })

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

/**
 * DELETE /api/leads
 * Deletes multiple leads by ID.
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or empty IDs array provided.' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('results')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('[API] Failed to delete leads:', error)
            return NextResponse.json(
                { error: 'Failed to delete leads.', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, count: ids.length })
    } catch (error) {
        console.error('[API] Unexpected error during delete:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}
