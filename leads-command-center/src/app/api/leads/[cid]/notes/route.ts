import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/leads/[cid]/notes
 * Fetches all notes for a specific lead.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { cid: string } }
) {
    try {
        const { cid } = params
        const supabase = await createClient()

        const { data: notes, error } = await supabase
            .from('lead_notes')
            .select('*')
            .eq('lead_cid', cid)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ notes })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * POST /api/leads/[cid]/notes
 * Creates a new note for a specific lead.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { cid: string } }
) {
    try {
        const { cid } = params
        const { content } = await request.json()
        const supabase = await createClient()

        const { data: note, error } = await supabase
            .from('lead_notes')
            .insert({
                lead_cid: cid,
                content
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ note })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
