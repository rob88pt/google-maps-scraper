import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/leads/[cid]/status
 * Fetches the current status of a lead.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cid: string }> }
) {
    try {
        const { cid } = await params
        if (!cid) {
            console.error('[API] Missing cid in status GET params')
            return NextResponse.json({ error: 'Missing cid' }, { status: 400 })
        }

        const supabase = await createClient()

        const { data: status, error } = await supabase
            .from('lead_status')
            .select('*')
            .eq('lead_cid', cid)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is code for no rows found
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ status: status || null })
    } catch (error) {
        console.error('[API] status GET error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * PATCH /api/leads/[cid]/status
 * Updates the status of a specific lead.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ cid: string }> }
) {
    try {
        const { cid } = await params
        if (!cid) {
            console.error('[API] Missing cid in status PATCH params')
            return NextResponse.json({ error: 'Missing cid' }, { status: 400 })
        }

        const { status, follow_up_date } = await request.json()
        const supabase = await createClient()

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('lead_status')
            .upsert({
                lead_cid: cid,
                status,
                follow_up_date,
                user_id: user.id,
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('[API] status PATCH DB error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ status: data })
    } catch (error) {
        console.error('[API] status PATCH error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
