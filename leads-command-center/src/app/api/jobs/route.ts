import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jobFormSchema, type JobFormValues } from '@/lib/schemas'
import { spawnScraperContainer, isDockerAvailable, isScraperImageAvailable, getContainerStatus, processJobResults, cleanupJobFiles, type ScraperJobParams } from '@/lib/docker'

/**
 * POST /api/jobs
 * Creates a new scraping job, saves to database, and spawns Docker container.
 */
export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json()
        const parsed = jobFormSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid job parameters', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const values: JobFormValues = parsed.data

        // Check Docker availability
        const dockerAvailable = await isDockerAvailable()
        if (!dockerAvailable) {
            return NextResponse.json(
                { error: 'Docker is not available. Please ensure Docker is running.' },
                { status: 503 }
            )
        }

        // Check if scraper image exists
        const imageAvailable = await isScraperImageAvailable()
        if (!imageAvailable) {
            return NextResponse.json(
                { error: 'Scraper image (google-maps-scraper:custom) not found. Please build the image first.' },
                { status: 503 }
            )
        }

        // Get Supabase client and DSN
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const dsn = process.env.SUPABASE_DSN

        if (!dsn) {
            return NextResponse.json(
                { error: 'SUPABASE_DSN environment variable not configured.' },
                { status: 500 }
            )
        }

        // Parse queries from textarea
        const queries = values.queries
            .split('\n')
            .map(q => q.trim())
            .filter(q => q.length > 0)

        if (queries.length === 0) {
            return NextResponse.json(
                { error: 'At least one query is required.' },
                { status: 400 }
            )
        }

        // Build job params for database
        const jobParams = {
            depth: values.depth,
            concurrency: values.concurrency,
            email: values.extractEmail,
            extraReviews: values.extraReviews,
            lang: values.lang,
            geo: values.geo,
            zoom: values.zoom,
            radius: values.radius,
            proxies: values.proxies ? values.proxies.split('\n').filter(p => p.trim()) : [],
            fastMode: values.fastMode,
            exitOnInactivity: values.exitOnInactivity,
            debug: values.debug,
            outputJson: values.outputJson,
        }

        // Insert job record into database
        const { data: job, error: insertError } = await supabase
            .from('jobs')
            .insert({
                status: 'pending',
                user_id: user.id,
                params: jobParams,
                queries: queries,
                preset_id: values.presetId || null,
            })
            .select()
            .single()

        if (insertError || !job) {
            console.error('[API] Failed to insert job:', insertError)
            return NextResponse.json(
                { error: 'Failed to create job record.', details: insertError?.message },
                { status: 500 }
            )
        }

        // Prepare container spawn parameters
        const scraperParams: ScraperJobParams = {
            jobId: job.id,
            queries: queries,
            depth: values.depth,
            concurrency: values.concurrency,
            outputJson: values.outputJson,
            extractEmail: values.extractEmail,
            extraReviews: values.extraReviews,
            lang: values.lang,
            geo: values.geo,
            zoom: values.zoom,
            radius: values.radius,
            proxies: values.proxies,
            fastMode: values.fastMode,
            exitOnInactivity: values.exitOnInactivity,
            debug: values.debug,
            dsn: dsn,
            userId: user.id,
        }

        // Spawn the Docker container
        const spawnResult = await spawnScraperContainer(scraperParams)

        if (!spawnResult.success) {
            // Update job status to failed
            await supabase
                .from('jobs')
                .update({ status: 'failed', error: spawnResult.error })
                .eq('id', job.id)

            return NextResponse.json(
                { error: 'Failed to spawn scraper container.', details: spawnResult.error },
                { status: 500 }
            )
        }

        // Update job to running status
        await supabase
            .from('jobs')
            .update({
                status: 'running',
                started_at: new Date().toISOString(),
            })
            .eq('id', job.id)

        return NextResponse.json({
            success: true,
            jobId: job.id,
            containerId: spawnResult.containerId,
            queryCount: queries.length,
        })

    } catch (error) {
        console.error('[API] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/jobs
 * Fetches all jobs, ordered by creation date descending.
 * Also auto-syncs running jobs whose containers have exited.
 */
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('[API] Failed to fetch jobs:', error)
            return NextResponse.json(
                { error: 'Failed to fetch jobs.', details: error.message },
                { status: 500 }
            )
        }

        // Auto-sync: Check running jobs for completed containers
        const runningJobs = jobs?.filter(j => j.status === 'running') || []

        for (const job of runningJobs) {
            try {
                const containerName = `lcc-job-${job.id.slice(0, 8)}`
                const containerStatus = await getContainerStatus(containerName)

                console.log(`[API] Container ${containerName} status: ${containerStatus}`)

                // Container has exited - trigger sync
                if (containerStatus === 'exited' || containerStatus === 'not_found') {
                    console.log(`[API] Auto-syncing job ${job.id}...`)

                    // Process results
                    const result = await processJobResults(job.id)

                    if (result.success && result.leads.length > 0) {
                        console.log(`[API] Processing ${result.leads.length} leads for job ${job.id}`)

                        // Insert leads
                        const leadsToInsert = result.leads.map(lead => ({
                            job_id: job.id,
                            user_id: job.user_id,
                            cid: lead.cid,
                            data: lead,
                        }))

                        // Upsert in batches to handle duplicate leads (e.g. repeat jobs)
                        const batchSize = 100
                        let insertedCount = 0
                        for (let i = 0; i < leadsToInsert.length; i += batchSize) {
                            const batch = leadsToInsert.slice(i, i + batchSize)
                            const { data: inserted, error: insertError } = await supabase
                                .from('results')
                                .upsert(batch, {
                                    onConflict: 'user_id,cid',
                                    ignoreDuplicates: false // Overwrite with newest data (including reviews)
                                })
                                .select()

                            if (insertError) {
                                console.error(`[API] Batch upsert error for job ${job.id}:`, insertError)
                            } else if (inserted) {
                                insertedCount += inserted.length
                            }
                        }

                        // Update job to completed
                        await supabase
                            .from('jobs')
                            .update({
                                status: 'completed',
                                completed_at: new Date().toISOString(),
                                result_count: insertedCount,
                            })
                            .eq('id', job.id)

                        // Update local job object for response
                        job.status = 'completed'
                        job.result_count = insertedCount

                        console.log(`[API] Job ${job.id} completed with ${insertedCount} leads`)

                        // Clean up temp files
                        await cleanupJobFiles(job.id)

                    } else if (!result.success) {
                        // Mark as failed if no results
                        console.log(`[API] Job ${job.id} failed: ${result.error}`)

                        await supabase
                            .from('jobs')
                            .update({
                                status: 'failed',
                                completed_at: new Date().toISOString(),
                                error_message: result.error || 'No results found',
                            })
                            .eq('id', job.id)

                        job.status = 'failed'
                        job.error_message = result.error || 'No results found'

                        // Clean up temp files
                        await cleanupJobFiles(job.id)

                    } else {
                        // Container exited but no leads - completed with 0
                        await supabase
                            .from('jobs')
                            .update({
                                status: 'completed',
                                completed_at: new Date().toISOString(),
                                result_count: 0,
                            })
                            .eq('id', job.id)

                        job.status = 'completed'
                        job.result_count = 0

                        // Clean up temp files
                        await cleanupJobFiles(job.id)
                    }
                }
            } catch (syncError) {
                console.error(`[API] Error auto-syncing job ${job.id}:`, syncError)
                // Don't fail the whole request, just log the error
            }
        }

        return NextResponse.json({ jobs })

    } catch (error) {
        console.error('[API] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
