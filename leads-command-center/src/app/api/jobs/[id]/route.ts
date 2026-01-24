import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stopContainer, getContainerStatus, getContainerLogs } from '@/lib/docker'

interface Params {
    params: Promise<{ id: string }>
}

/**
 * GET /api/jobs/[id]
 * Get a single job by ID with optional status check.
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: job, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ job })

    } catch (error) {
        console.error('[API] Error fetching job:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/jobs/[id]
 * Update job status (e.g., cancel a running job).
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json()
        const { action } = body as { action: 'cancel' }

        if (action !== 'cancel') {
            return NextResponse.json(
                { error: 'Invalid action. Supported: cancel' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get job to check current status
        const { data: job, error: fetchError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        if (job.status !== 'running' && job.status !== 'pending') {
            return NextResponse.json(
                { error: `Cannot cancel job with status: ${job.status}` },
                { status: 400 }
            )
        }

        // Try to stop the Docker container
        const containerName = `lcc-job-${id.slice(0, 8)}`
        const stopped = await stopContainer(containerName)

        // Update job status in database
        const { error: updateError } = await supabase
            .from('jobs')
            .update({
                status: 'cancelled',
                completed_at: new Date().toISOString(),
            })
            .eq('id', id)

        if (updateError) {
            console.error('[API] Failed to update job status:', updateError)
            return NextResponse.json(
                { error: 'Failed to update job status' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            containerStopped: stopped,
        })

    } catch (error) {
        console.error('[API] Error cancelling job:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/jobs/[id]
 * Delete a job record (only if completed/failed/cancelled).
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        // Check job status first
        const { data: job, error: fetchError } = await supabase
            .from('jobs')
            .select('status')
            .eq('id', id)
            .single()

        if (fetchError || !job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        if (job.status === 'running' || job.status === 'pending') {
            return NextResponse.json(
                { error: 'Cannot delete a running or pending job. Cancel it first.' },
                { status: 400 }
            )
        }

        // Delete the job
        const { error: deleteError } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)

        if (deleteError) {
            console.error('[API] Failed to delete job:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete job' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('[API] Error deleting job:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
