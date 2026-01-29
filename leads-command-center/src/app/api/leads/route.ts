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
        const archivedOnly = searchParams.get('archivedOnly') === 'true'
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

        // Calculate offset
        const offset = (page - 1) * pageSize

        // Get the current user for status/notes filtering
        const { data: { user } } = await supabase.auth.getUser()
        const currentUserId = user?.id || '00000000-0000-0000-0000-000000000000'

        // Build the query using the view that properly joins status
        // The view allows us to filter by status at the row level
        let query = supabase
            .from('leads_with_status')
            .select(`
                id, data, created_at, cid, crm_status, status_user_id,
                lead_notes(count)
            `, { count: 'exact' })

        // Filter to only show status for the current user (or null for leads without status)
        if (user) {
            query = query.or(`status_user_id.eq.${user.id},status_user_id.is.null`)
        }

        // Apply archived filter - this now works because crm_status is a column in the view
        if (archivedOnly) {
            query = query.eq('crm_status', 'archived')
        } else if (!includeArchived) {
            query = query.neq('crm_status', 'archived')
        }

        // Search logic
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

        // Rating filter
        if (minRating > 0) query = query.gte('data->review_rating', minRating)
        if (maxRating < 5) query = query.lte('data->review_rating', maxRating)

        // Email filters
        if (hasEmail) {
            query = query.not('data->>emails', 'is', 'null').neq('data->>emails', '[]')
        }
        if (doesNotHaveEmail) {
            query = query.or('data->>emails.is.null,data->>emails.eq.[]')
        }

        // Review filters
        if (hasReviews) query = query.gt('data->review_count', 0)
        if (noReviews) query = query.or('data->review_count.eq.0,data->review_count.is.null')

        if (minReviewCount !== null) query = query.gte('data->review_count', minReviewCount)
        if (maxReviewCount !== null) query = query.lte('data->review_count', maxReviewCount)

        // Website Type filter
        if (websiteType === 'proper') {
            query = query.neq('data->>web_site', '').not('data->>web_site', 'is', null)
                .not('data->>web_site', 'ilike', '%facebook.com%')
                .not('data->>web_site', 'ilike', '%fb.com%')
                .not('data->>web_site', 'ilike', '%fb.watch%')
                .not('data->>web_site', 'ilike', '%instagram.com%')
                .not('data->>web_site', 'ilike', '%instagr.am%')
                .not('data->>web_site', 'ilike', '%twitter.com%')
                .not('data->>web_site', 'ilike', '%x.com%')
        } else if (websiteType === 'social') {
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
            query = query.or('data->>web_site.is.null,data->>web_site.eq.""')
        }

        // Photos filter
        if (hasPhotos) {
            query = query.not('data->>images', 'is', 'null').neq('data->>images', '[]')
        }

        // Sorting
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

        // Pagination
        query = query.range(offset, offset + pageSize - 1)

        const { data: results, error, count } = await query

        if (error) {
            console.error('[API] Failed to fetch leads:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Transform and enrich
        const leads = (results as any[] || []).map(row => {
            const leadData = row.data as Lead
            const notesObj = row.lead_notes as { count: number } | { count: number }[] | null

            // Status now comes directly from the view
            const crm_status = row.crm_status || 'new'

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


        return NextResponse.json({ leads, total: count || 0, page, pageSize })

    } catch (error) {
        console.error('[API] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/leads
 * This endpoint now performs a batch ARCHIVE instead of permanent deletion.
 * (Keeping the method as DELETE for compatibility with existing hooks, but logic is "soft-archive")
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty IDs array.' }, { status: 400 })
        }

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 1. Get the CIDs for these IDs (since lead_status uses CID)
        const { data: leads, error: fetchError } = await supabase
            .from('results')
            .select('cid')
            .in('id', ids)

        if (fetchError || !leads) {
            throw new Error(fetchError?.message || 'Failed to fetch lead CIDs')
        }

        const cids = leads.map(l => l.cid)

        // 2. Perform upsert into lead_status for each CID
        // This marks them as 'archived' for this specific user
        const archivePayload = cids.map(cid => ({
            user_id: user.id,
            lead_cid: cid,
            status: 'archived'
        }))

        const { error: archiveError } = await supabase
            .from('lead_status')
            .upsert(archivePayload, { onConflict: 'user_id,lead_cid' })

        if (archiveError) {
            console.error('[API] Failed to archive leads:', archiveError)
            return NextResponse.json({ error: 'Failed to archive leads.', details: archiveError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, count: ids.length, action: 'archived' })
    } catch (error) {
        console.error('[API] Unexpected error during archive:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


