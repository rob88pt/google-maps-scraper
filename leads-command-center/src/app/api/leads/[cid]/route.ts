import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ResultRow, Lead, LeadNote, LeadTag, LeadStatus } from '@/lib/supabase/types'

export interface LeadDetailResponse {
    lead: Lead & { id: number; created_at: string }
    notes: LeadNote[]
    tags: LeadTag[]
    status: LeadStatus | null
}

/**
 * GET /api/leads/[cid]
 * Fetches a single lead by CID with its notes, tags, and status.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cid: string }> }
) {
    try {
        const { cid } = await params
        const supabase = await createClient()

        if (!cid) {
            return NextResponse.json(
                { error: 'CID is required.' },
                { status: 400 }
            )
        }

        // Fetch lead by CID from JSONB data column
        const { data: result, error: leadError } = await supabase
            .from('results')
            .select('id, data, created_at')
            .eq('data->>cid', cid)
            .single()

        if (leadError || !result) {
            if (leadError?.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Lead not found.' },
                    { status: 404 }
                )
            }
            console.error('[API] Failed to fetch lead:', leadError)
            return NextResponse.json(
                { error: 'Failed to fetch lead.', details: leadError?.message },
                { status: 500 }
            )
        }

        const row = result as ResultRow

        // Fetch notes for this lead
        const { data: notes } = await supabase
            .from('lead_notes')
            .select('*')
            .eq('lead_cid', cid)
            .order('created_at', { ascending: false })

        // Fetch tags for this lead
        const { data: tags } = await supabase
            .from('lead_tags')
            .select('*')
            .eq('lead_cid', cid)

        // Fetch status for this lead
        const { data: status } = await supabase
            .from('lead_status')
            .select('*')
            .eq('lead_cid', cid)
            .single()

        const response: LeadDetailResponse = {
            lead: {
                ...row.data,
                id: row.id,
                created_at: row.created_at
            },
            notes: notes || [],
            tags: tags || [],
            status: status || null
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
