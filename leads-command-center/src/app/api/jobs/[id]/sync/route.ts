import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processJobResults, getContainerStatus, cleanupJobFiles } from '@/lib/docker'
import { join } from 'path'
import { existsSync } from 'fs'

interface Params {
    params: Promise<{ id: string }>
}

/**
 * POST /api/jobs/[id]/sync
 * Process the scraper results and insert leads into Supabase.
 * Call this after the scraper container has exited.
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { id: jobId } = await params
        const supabase = await createClient()

        // Get job to verify it exists and get user_id
        const { data: job, error: fetchError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single()

        if (fetchError || !job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        // Check container status
        const containerName = `lcc-job-${jobId.slice(0, 8)}`
        const containerStatus = await getContainerStatus(containerName)

        // Only process if container has exited
        if (containerStatus === 'running') {
            return NextResponse.json(
                { error: 'Job is still running. Wait for completion.' },
                { status: 400 }
            )
        }

        // Process the results file
        console.log(`[Sync] Processing results for job ${jobId}...`)
        const result = await processJobResults(jobId)

        if (!result.success) {
            // Update job status to failed
            await supabase
                .from('jobs')
                .update({
                    status: 'failed',
                    completed_at: new Date().toISOString(),
                    error_message: result.error || 'Failed to process results',
                })
                .eq('id', jobId)

            return NextResponse.json(
                { error: result.error || 'Failed to process results', count: 0 },
                { status: 500 }
            )
        }

        // Insert leads into Supabase
        let insertedCount = 0
        const debugLogPath = join(process.cwd(), 'sync_debug.log')
        const log = async (msg: string) => {
            const entry = `${new Date().toISOString()} ${msg}\n`
            console.log(msg)
            try {
                const { appendFile } = await import('fs/promises')
                await appendFile(debugLogPath, entry)
            } catch (e) {
                console.error('Failed to write to debug log:', e)
            }
        }

        if (result.leads.length > 0) {
            await log(`[Sync] Inserting ${result.leads.length} leads into Supabase...`)

            // Debug: Check auth state to diagnose RLS issues
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            await log(`[Sync] Auth state - user: ${user?.id}, job.user_id: ${job.user_id}, match: ${user?.id === job.user_id}`)
            if (authError) {
                await log(`[Sync] Auth error: ${JSON.stringify(authError)}`)
            }

            // Prepare leads for insertion
            const leadsToInsert = result.leads.map(lead => ({
                job_id: jobId,
                user_id: job.user_id,
                cid: lead.cid || null,
                data: lead,
            }))

            // Log first lead structure
            const firstLead = result.leads[0] as any
            await log(`[Sync DEBUG] First lead keys: ${Object.keys(firstLead).join(', ')}`)
            await log(`[Sync DEBUG] user_reviews count: ${Array.isArray(firstLead.user_reviews) ? firstLead.user_reviews.length : 'NOT ARRAY'}`)
            await log(`[Sync DEBUG] user_reviews_extended present: ${'user_reviews_extended' in firstLead}`)

            if ('user_reviews_extended' in firstLead && Array.isArray(firstLead.user_reviews_extended)) {
                await log(`[Sync DEBUG] user_reviews_extended count: ${firstLead.user_reviews_extended.length}`)
                if (firstLead.user_reviews_extended.length > 0) {
                    await log(`[Sync DEBUG] first extended review sample: ${JSON.stringify(firstLead.user_reviews_extended[0]).slice(0, 200)}`)
                }
            }

            // Upsert leads
            const batchSize = 50 // Smaller batch for clearer debugging
            for (let i = 0; i < leadsToInsert.length; i += batchSize) {
                const batch = leadsToInsert.slice(i, i + batchSize)
                const { error: insertError, data: inserted, status, statusText } = await supabase
                    .from('results')
                    .upsert(batch, {
                        onConflict: 'user_id,cid',
                        ignoreDuplicates: false
                    })
                    .select()

                if (insertError) {
                    await log(`[Sync] Error upserting batch ${i / batchSize + 1}: ${JSON.stringify(insertError)} (Status: ${status} ${statusText})`)
                } else if (inserted) {
                    insertedCount += inserted.length
                    await log(`[Sync] Batch ${i / batchSize + 1}: upserted ${inserted.length} leads (Status: ${status})`)
                } else {
                    await log(`[Sync] Batch ${i / batchSize + 1}: No data returned, no error (Status: ${status} ${statusText})`)
                }
            }

            await log(`[Sync] Total inserted: ${insertedCount} for job ${jobId}`)
        }

        // Update job status
        const { error: updateError, status: updateStatus } = await supabase
            .from('jobs')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                result_count: insertedCount,
            })
            .eq('id', jobId)

        if (updateError) {
            await log(`[Sync] Failed to update job status: ${JSON.stringify(updateError)} (Status: ${updateStatus})`)
        }

        // Clean up
        await cleanupJobFiles(jobId)

        return NextResponse.json({
            success: true,
            leadsProcessed: result.count,
            leadsInserted: insertedCount,
            jobId,
        })

    } catch (error) {
        console.error('[API] Error syncing job results:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/jobs/[id]/sync
 * Check if results are ready to sync (container exited).
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id: jobId } = await params
        const supabase = await createClient()

        // Verify job exists
        const { data: job, error: fetchError } = await supabase
            .from('jobs')
            .select('status')
            .eq('id', jobId)
            .single()

        if (fetchError || !job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        // Check container status
        const containerName = `lcc-job-${jobId.slice(0, 8)}`
        const containerStatus = await getContainerStatus(containerName)

        return NextResponse.json({
            jobId,
            jobStatus: job.status,
            containerStatus,
            readyToSync: containerStatus === 'exited' && job.status === 'running',
        })

    } catch (error) {
        console.error('[API] Error checking sync status:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
