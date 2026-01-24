import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for creating/updating a preset
const presetSchema = z.object({
    name: z.string().min(1).max(50),
    params: z.object({
        depth: z.number(),
        concurrency: z.number(),
        email: z.boolean(),
        extraReviews: z.number().min(0).default(0), // 0 = disabled, >0 = max reviews to collect
        lang: z.string(),
        geo: z.string(),
        zoom: z.number(),
        radius: z.number(),
        proxies: z.array(z.string()),
        fastMode: z.boolean(),
        exitOnInactivity: z.string(),
        debug: z.boolean(),
        outputJson: z.boolean().optional(),
        queries: z.array(z.string()).optional(),
    }),
})

/**
 * GET /api/presets
 * Fetch all presets, ordered by name.
 */
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: presets, error } = await supabase
            .from('job_presets')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('[API] Failed to fetch presets:', error)
            return NextResponse.json(
                { error: 'Failed to fetch presets', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ presets })

    } catch (error) {
        console.error('[API] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/presets
 * Create a new preset.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const parsed = presetSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid preset data', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { name, params } = parsed.data
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if name already exists for this user
        const { data: existing } = await supabase
            .from('job_presets')
            .select('id')
            .eq('name', name)
            .eq('user_id', user.id)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'A preset with this name already exists.' },
                { status: 409 }
            )
        }

        // Insert new preset with user_id
        const { data: preset, error } = await supabase
            .from('job_presets')
            .insert({ name, params, user_id: user.id })
            .select()
            .single()

        if (error) {
            console.error('[API] Failed to create preset:', error)
            return NextResponse.json(
                { error: 'Failed to create preset', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ preset }, { status: 201 })

    } catch (error) {
        console.error('[API] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
