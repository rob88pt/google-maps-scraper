import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/leads/[cid]/status
 * Fetches the current status of a lead.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { cid: string } }
) {
    try {
        const { cid } = params
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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * PATCH /api/leads/[cid]/status
 * Updates the status of a specific lead.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { cid: string } }
) {
    try {
        const { cid } = params
        const { status, follow_up_date } = await request.json()
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('lead_status')
            .upsert({
                lead_cid: cid,
                status,
                follow_up_date,
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ status: data })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
