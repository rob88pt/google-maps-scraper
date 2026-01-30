import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/leads/[cid]/notes
 * Fetches all notes for a specific lead.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cid: string }> }
) {
    try {
        const { cid } = await params
        if (!cid) {
            console.error('[API] Missing cid in notes GET params')
            return NextResponse.json({ error: 'Missing cid' }, { status: 400 })
        }

        const supabase = await createClient()

        const { data: notes, error } = await supabase
            .from('lead_notes')
            .select('*')
            .eq('lead_cid', cid)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[API] notes GET DB error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ notes })
    } catch (error) {
        console.error('[API] notes GET error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * POST /api/leads/[cid]/notes
 * Creates a new note for a specific lead.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ cid: string }> }
) {
    try {
        const { cid } = await params
        if (!cid) {
            console.error('[API] Missing cid in notes POST params')
            return NextResponse.json({ error: 'Missing cid' }, { status: 400 })
        }

        const { content } = await request.json()
        const supabase = await createClient()

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: note, error } = await supabase
            .from('lead_notes')
            .insert({
                lead_cid: cid,
                content,
                user_id: user.id
            })
            .select()
            .single()

        if (error) {
            console.error('[API] notes POST DB error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ note })
    } catch (error) {
        console.error('[API] notes POST error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * PUT /api/leads/[cid]/notes
 * Updates an existing note.
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ cid: string }> }
) {
    try {
        const { cid } = await params
        const { id, content } = await request.json()

        if (!id || !content) {
            return NextResponse.json({ error: 'Missing id or content' }, { status: 400 })
        }

        const supabase = await createClient()

        const { data: note, error } = await supabase
            .from('lead_notes')
            .update({ content })
            .eq('id', id)
            .eq('lead_cid', cid) // Extra safety check
            .select()
            .single()

        if (error) {
            console.error('[API] notes PUT DB error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ note })
    } catch (error) {
        console.error('[API] notes PUT error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * DELETE /api/leads/[cid]/notes
 * Deletes a note by ID.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ cid: string }> }
) {
    try {
        const { cid } = await params
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing note id' }, { status: 400 })
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('lead_notes')
            .delete()
            .eq('id', id)
            .eq('lead_cid', cid) // Extra safety check

        if (error) {
            console.error('[API] notes DELETE DB error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[API] notes DELETE error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
