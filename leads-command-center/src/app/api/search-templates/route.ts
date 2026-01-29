import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/search-templates
 * Fetches all search templates for the current user.
 */
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: templates, error } = await supabase
            .from('search_templates')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('[API] Failed to fetch search templates:', error)
            return NextResponse.json(
                { error: 'Failed to fetch search templates.', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ templates })
    } catch (error) {
        console.error('[API] Unexpected error in templates GET:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/search-templates
 * Creates or updates a search template.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { id, name, description, filters, column_visibility, column_order, column_sizing, sorting, category, search_query } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        // Get current user to ensure user_id is set
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const templateData = {
            name,
            description,
            filters,
            column_visibility,
            column_order,
            column_sizing,
            sorting,
            category,
            search_query,
            user_id: user.id
        }

        console.log(`[API] Saving template: "${name}" for user: ${user.id} (${id ? `Update ID: ${id}` : 'New Insert'})`)

        let result;
        if (id) {
            // Update
            result = await supabase
                .from('search_templates')
                .update(templateData)
                .eq('id', id)
                .select()
                .single()
        } else {
            // Insert
            result = await supabase
                .from('search_templates')
                .insert(templateData)
                .select()
                .single()
        }

        if (result.error) {
            console.error('[API] Failed to save search template:', result.error)
            return NextResponse.json(
                { error: 'Failed to save search template.', details: result.error.message },
                { status: 500 }
            )
        }

        console.log(`[API] Successfully saved template: "${name}" (ID: ${result.data.id})`)
        return NextResponse.json({ template: result.data })
    } catch (error) {
        console.error('[API] Unexpected error in templates POST:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/search-templates?id=...
 * Deletes a search template by ID.
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // Get current user for logging
        const { data: { user } } = await supabase.auth.getUser()
        console.log(`[API] Deleting template ID: ${id} requested by user: ${user?.id || 'Unknown'}`)

        const { error, count } = await supabase
            .from('search_templates')
            .delete()
            .eq('id', id)
            .select()

        if (error) {
            console.error('[API] Failed to delete search template:', error)
            return NextResponse.json(
                { error: 'Failed to delete search template.', details: error.message },
                { status: 500 }
            )
        }

        console.log(`[API] Deleted template ID: ${id}. Rows affected: ${count || 0}`)
        return NextResponse.json({ success: true, deletedCount: count || 0 })
    } catch (error) {
        console.error('[API] Unexpected error in templates DELETE:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
