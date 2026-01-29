import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/leads/unarchive
 * Restores archived leads to 'new' status.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty IDs array.' }, { status: 400 })
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Get CIDs
        const { data: leads, error: fetchError } = await supabase
            .from('results')
            .select('cid')
            .in('id', ids)

        if (fetchError || !leads) throw new Error('Failed to fetch lead CIDs: ' + fetchError?.message)

        const cids = leads.map(l => l.cid)

        // Reset status to 'new'
        const unarchivePayload = cids.map(cid => ({
            user_id: user.id,
            lead_cid: cid,
            status: 'new'
        }))

        const { error: unarchiveError } = await supabase
            .from('lead_status')
            .upsert(unarchivePayload, { onConflict: 'user_id,lead_cid' })

        if (unarchiveError) {
            console.error('[API] Failed to unarchive leads:', unarchiveError)
            return NextResponse.json({ error: 'Failed to unarchive leads.', details: unarchiveError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, count: ids.length, action: 'unarchived' })
    } catch (error) {
        console.error('[API] Unexpected error during unarchive:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
