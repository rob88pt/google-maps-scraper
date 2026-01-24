import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
    params: Promise<{ id: string }>
}

/**
 * GET /api/presets/[id]
 * Get a single preset by ID.
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: preset, error } = await supabase
            .from('job_presets')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !preset) {
            return NextResponse.json(
                { error: 'Preset not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ preset })

    } catch (error) {
        console.error('[API] Error fetching preset:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/presets/[id]
 * Delete a preset.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase
            .from('job_presets')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('[API] Failed to delete preset:', error)
            return NextResponse.json(
                { error: 'Failed to delete preset', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('[API] Error deleting preset:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
/**
 * PATCH /api/presets/[id]
 * Update a preset's name or parameters.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json()
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Validate that the preset belongs to the user
        const { data: existing, error: fetchError } = await supabase
            .from('job_presets')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !existing) {
            return NextResponse.json({ error: 'Preset not found or unauthorized' }, { status: 404 })
        }

        const { error: updateError } = await supabase
            .from('job_presets')
            .update({
                ...(body.name && { name: body.name }),
                ...(body.params && { params: body.params }),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)

        if (updateError) {
            console.error('[API] Failed to update preset:', updateError)
            return NextResponse.json(
                { error: 'Failed to update preset', details: updateError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('[API] Error updating preset:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
