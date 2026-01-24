import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { writeFile, mkdir, readFile, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync, statSync } from 'fs'

const execAsync = promisify(exec)

// Docker image to use - custom image with UTF-8 BOM fix
const DOCKER_IMAGE = 'google-maps-scraper:custom'

// FIX: Use project-local directory instead of Windows temp
// WSL2 bind mounts fail with Windows temp paths due to 9p filesystem sync issues
// Project-local paths (on D: drive) are more reliably accessible to Docker Desktop
const getJobsBaseDir = () => join(process.cwd(), '.jobs')

export interface ScraperJobParams {
    jobId: string
    queries: string[]
    depth: number
    concurrency: number
    outputJson: boolean
    extractEmail: boolean
    extraReviews: number  // 0 = disabled, >0 = max reviews to collect
    lang: string
    geo: string
    zoom: number
    radius: number
    proxies: string
    fastMode: boolean
    exitOnInactivity: string
    debug: boolean
    dsn: string // Supabase DSN for database output
    userId: string
}

export interface SpawnResult {
    success: boolean
    containerId?: string
    error?: string
}

/**
 * Spawns a Docker container to run the Google Maps scraper.
 * Uses spawn() with array arguments to prevent shell injection.
 * The scraper writes directly to Supabase via the DSN env var.
 */
export async function spawnScraperContainer(params: ScraperJobParams): Promise<SpawnResult> {
    try {
        // Get job directory for local file storage
        const jobDir = getJobDir(params.jobId)
        await mkdir(jobDir, { recursive: true })
        console.log(`[Docker] Job directory: ${jobDir}`)

        // Write queries to a local file (will be copied into container)
        const queriesPath = join(jobDir, 'queries.txt')
        await writeFile(queriesPath, params.queries.join('\n'), 'utf-8')

        // Verify file was created
        const queriesStat = await stat(queriesPath)
        console.log(`[Docker] queries.txt created - size: ${queriesStat.size}`)

        // Build container name and Docker command arguments
        // FIX: NO BIND MOUNTS - WSL2 bind mounts are broken on this system
        // Instead, we use docker cp to transfer files after container creation
        const containerName = `lcc-job-${params.jobId.slice(0, 8)}`
        const dockerArgs = buildDockerArgs(params, containerName)

        // Log command for debugging (sanitized)
        const sanitizedArgs = dockerArgs.filter(arg => !arg.includes('postgresql://') && !arg.includes('DSN='))
        console.log('[Docker] Creating container:', 'docker', sanitizedArgs.join(' '))

        // FIX: Use docker create + docker cp + docker start pattern
        // This avoids the race condition where the scraper starts before the queries file is copied in

        // Step 1: CREATE the container (don't start it yet)
        const containerId = await createDockerContainer(dockerArgs)
        console.log(`[Docker] Container created: ${containerId}`)

        // Step 2: Copy queries file into the container BEFORE starting
        console.log(`[Docker] Copying queries file into container...`)
        try {
            await execAsync(`docker cp "${queriesPath}" ${containerName}:/queries.txt`)
            console.log(`[Docker] Queries file copied successfully`)
        } catch (cpError) {
            console.error(`[Docker] Failed to copy queries file:`, cpError)
            // Clean up the container if copy fails
            await execAsync(`docker rm -f ${containerName}`).catch(() => { })
            throw cpError
        }

        // Step 3: START the container now that the file is in place
        console.log(`[Docker] Starting container...`)
        try {
            await execAsync(`docker start ${containerName}`)
            console.log(`[Docker] Container started successfully`)
        } catch (startError) {
            console.error(`[Docker] Failed to start container:`, startError)
            await execAsync(`docker rm -f ${containerName}`).catch(() => { })
            throw startError
        }

        return {
            success: true,
            containerId,
        }
    } catch (error) {
        console.error('[Docker] Error spawning container:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Executes docker create command using spawn with array args (shell-injection safe).
 * Returns the container ID from stdout.
 * NOTE: docker create does not start the container - use docker start after copying files.
 */
function createDockerContainer(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn('docker', args, { shell: false })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
            stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
            stderr += data.toString()
        })

        proc.on('close', (code) => {
            if (code === 0) {
                resolve(stdout.trim())
            } else {
                // Filter out "image not found" warnings which are informational
                if (stderr && !stderr.includes('Unable to find image')) {
                    console.error('[Docker] stderr:', stderr)
                }
                reject(new Error(`Docker exited with code ${code}: ${stderr || stdout}`))
            }
        })

        proc.on('error', (err) => {
            reject(err)
        })
    })
}

/**
 * Builds the Docker create arguments array.
 * 
 * FIX: NO BIND MOUNTS - WSL2 bind mounts are fundamentally broken.
 * The container reads /queries.txt (copied in via docker cp after create)
 * and writes to /results.json (extracted via docker cp after exit).
 */
function buildDockerArgs(params: ScraperJobParams, containerName: string): string[] {
    const args: string[] = [
        'create', // Use 'create' not 'run' - we start manually after copying files
        '--name', containerName,
        // NO --rm flag: we need the container to persist after exit so we can docker cp results out
        // Container is removed programmatically by removeContainer() after result extraction
        '--dns', '8.8.8.8', // Use Google DNS to ensure external DNS resolution
        '--dns', '8.8.4.4', // Fallback DNS
        // NO VOLUME MOUNTS - using docker cp instead
    ]

    // Add the image name
    args.push(DOCKER_IMAGE)

    // Add scraper CLI flags - paths are inside the container (no mounts)
    args.push('-input', '/queries.txt')
    args.push('-results', '/results.json')
    args.push('-json') // Always JSON for full data

    // Depth and concurrency
    args.push('-depth', String(params.depth))
    args.push('-c', String(params.concurrency))

    // Email extraction
    if (params.extractEmail) {
        args.push('-email')
    }

    // Extra reviews - now takes a count (0 = disabled)
    if (params.extraReviews > 0) {
        args.push('-extra-reviews', String(params.extraReviews))
    }

    // Language
    if (params.lang && params.lang !== 'en') {
        args.push('-lang', params.lang)
    }

    // Geo coordinates
    if (params.geo) {
        args.push('-geo', params.geo)
    }

    // Zoom level
    if (params.zoom !== 15) {
        args.push('-zoom', String(params.zoom))
    }

    // Radius
    if (params.radius !== 10000) {
        args.push('-radius', String(params.radius))
    }

    // Proxies
    if (params.proxies) {
        args.push('-proxies', params.proxies)
    }

    // Fast mode - REQUIRE geo coordinates
    if (params.fastMode && params.geo) {
        args.push('-fast-mode')
    } else if (params.fastMode && !params.geo) {
        console.warn('[Docker] Fast mode requested but no geo coordinates provided. Disabling fast mode.')
    }

    // Exit on inactivity
    if (params.exitOnInactivity) {
        args.push('-exit-on-inactivity', params.exitOnInactivity)
    }

    // Debug mode (shows browser)
    if (params.debug) {
        args.push('-debug')
    }

    // NOTE: We do NOT pass -dsn to the scraper because:
    // 1. The upstream scraper expects its own schema (gmaps_jobs table) which we don't have
    // 2. It doesn't support our job_id/user_id tracking requirements
    // Instead, the scraper writes to results.csv and we post-process it into Supabase
    // See: processJobResults() for the post-processing logic

    return args
}

/**
 * Gets the status of a running container.
 */
export async function getContainerStatus(containerId: string): Promise<'running' | 'exited' | 'not_found'> {
    try {
        const { stdout } = await execAsync(`docker inspect -f "{{.State.Status}}" ${containerId}`)
        const status = stdout.trim()

        if (status === 'running') return 'running'
        if (status === 'exited') return 'exited'
        return 'not_found'
    } catch {
        return 'not_found'
    }
}

/**
 * Gets container logs.
 */
export async function getContainerLogs(containerId: string, tail: number = 50): Promise<string> {
    try {
        const { stdout } = await execAsync(`docker logs --tail ${tail} ${containerId}`)
        return stdout
    } catch {
        return ''
    }
}

/**
 * Stops a running container.
 */
export async function stopContainer(containerId: string): Promise<boolean> {
    try {
        await execAsync(`docker stop ${containerId}`)
        return true
    } catch {
        return false
    }
}

/**
 * Removes a container (force remove).
 */
export async function removeContainer(containerName: string): Promise<boolean> {
    try {
        await execAsync(`docker rm -f ${containerName}`)
        console.log(`[Docker] Removed container: ${containerName}`)
        return true
    } catch {
        return false
    }
}

/**
 * Checks if Docker is available.
 */
export async function isDockerAvailable(): Promise<boolean> {
    try {
        await execAsync('docker info')
        return true
    } catch {
        return false
    }
}

/**
 * Checks if the custom scraper image exists.
 */
export async function isScraperImageAvailable(): Promise<boolean> {
    try {
        const { stdout } = await execAsync(`docker images -q ${DOCKER_IMAGE}`)
        return stdout.trim().length > 0
    } catch {
        return false
    }
}

/**
 * Gets the path to the results file for a job.
 */
export function getJobResultsPath(jobId: string): string {
    return join(getJobsBaseDir(), jobId, 'results.json')
}

/**
 * Gets the job directory path.
 */
export function getJobDir(jobId: string): string {
    return join(getJobsBaseDir(), jobId)
}

/**
 * Represents a scraped lead from Google Maps.
 */
export interface ScrapedLead {
    input_id: string
    link: string
    title: string
    category: string
    categories: string[]
    address: string
    open_hours: Record<string, unknown>
    popular_times: Record<string, unknown>
    website: string
    phone: string
    plus_code: string
    review_count: number
    review_rating: number
    reviews_per_rating: Record<string, number>
    latitude: number
    longitude: number
    cid: string
    status: string
    descriptions: string
    reviews_link: string
    thumbnail: string
    timezone: string
    price_range: string
    data_id: string
    images: string[]
    reservations: string[]
    order_online: string[]
    menu: string
    owner: Record<string, unknown>
    complete_address: Record<string, unknown>
    about: Record<string, unknown>
    user_reviews: Array<{
        name: string
        profile_picture: string
        rating: number
        description: string
        images: string[]
        when: string
    }>
    user_reviews_extended: Array<{
        name: string
        profile_picture: string
        rating: number
        description: string
        images: string[]
        when: string
    }>
    emails: string[]
    [key: string]: unknown // Allow additional fields
}

export interface ProcessJobResultsResponse {
    success: boolean
    leads: ScrapedLead[]
    count: number
    error?: string
}

/**
 * Processes the JSON results file from a completed scraper job.
 * Uses docker cp to extract results from the container (bind mounts are broken).
 * Parses the NDJSON (newline-delimited JSON) format and returns structured lead data.
 */
export async function processJobResults(jobId: string): Promise<ProcessJobResultsResponse> {
    const containerName = `lcc-job-${jobId.slice(0, 8)}`
    const resultsPath = getJobResultsPath(jobId)

    try {
        // Ensure job directory exists
        const jobDir = getJobDir(jobId)
        await mkdir(jobDir, { recursive: true })

        // Check if results file already exists locally (from previous extraction or manual placement)
        if (existsSync(resultsPath)) {
            console.log(`[ProcessResults] Results file already exists locally: ${resultsPath}`)
        } else {
            // Extract results file from container using docker cp
            console.log(`[ProcessResults] Extracting results from container ${containerName}...`)
            try {
                await execAsync(`docker cp ${containerName}:/results.json "${resultsPath}"`)
                console.log(`[ProcessResults] Results extracted to: ${resultsPath}`)
            } catch (cpError) {
                // Check if container exists
                try {
                    const { stdout: containerStatus } = await execAsync(`docker inspect -f "{{.State.Status}}" ${containerName}`)
                    console.error(`[ProcessResults] Container ${containerName} status: ${containerStatus.trim()}, but docker cp failed:`, cpError)
                } catch {
                    console.error(`[ProcessResults] Container ${containerName} not found - may have been removed`)
                }
                return {
                    success: false,
                    leads: [],
                    count: 0,
                    error: `Failed to extract results from container: ${cpError instanceof Error ? cpError.message : 'docker cp failed'}`
                }
            }
        }

        // Check if extracted file exists
        if (!existsSync(resultsPath)) {
            return {
                success: false,
                leads: [],
                count: 0,
                error: `Results file not found after extraction: ${resultsPath}`
            }
        }

        // Check file stats
        const pathStat = statSync(resultsPath)
        console.log(`[ProcessResults] ${resultsPath} - isFile: ${pathStat.isFile()}, size: ${pathStat.size}`)

        // Read the file
        const content = await readFile(resultsPath, 'utf-8')

        if (!content.trim()) {
            return {
                success: true,
                leads: [],
                count: 0,
                error: 'Results file is empty'
            }
        }

        // Parse NDJSON (newline-delimited JSON) - each line is a separate JSON object
        const lines = content.trim().split('\n')
        const leads: ScrapedLead[] = []
        const errors: string[] = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            try {
                const lead = JSON.parse(line) as ScrapedLead
                leads.push(lead)
            } catch (parseError) {
                const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error'
                const linePreview = line.slice(0, 100)
                console.error(`[ProcessResults] Failed to parse line ${i + 1}: ${errorMessage}`)
                console.error(`[ProcessResults] Line preview: "${linePreview}..."`)
                errors.push(`Line ${i + 1}: ${errorMessage}`)
            }
        }

        if (errors.length > 0) {
            console.error(`[ProcessResults] Total parse errors for job ${jobId}: ${errors.length}/${lines.length}`)
        }

        console.log(`[ProcessResults] Successfully parsed ${leads.length} leads from job ${jobId}`)

        // Clean up the container now that we've extracted results
        /*
        console.log(`[ProcessResults] Removing container ${containerName}...`)
        try {
            await execAsync(`docker rm -f ${containerName}`)
            console.log(`[ProcessResults] Container ${containerName} removed`)
        } catch (rmError) {
            // Container might already be removed, that's fine
            console.log(`[ProcessResults] Container cleanup: ${rmError instanceof Error ? rmError.message : 'already removed'}`)
        }
        */

        return {
            success: true,
            leads,
            count: leads.length,
            error: errors.length > 0 ? `${errors.length} parse errors` : undefined
        }
    } catch (error) {
        console.error(`[ProcessResults] Error processing job ${jobId}:`, error)
        return {
            success: false,
            leads: [],
            count: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Cleans up job files after processing or on failure.
 */
export async function cleanupJobFiles(jobId: string): Promise<boolean> {
    try {
        const jobDir = getJobDir(jobId)
        /*
        if (existsSync(jobDir)) {
            const { rm } = await import('fs/promises')
            await rm(jobDir, { recursive: true, force: true })
            console.log(`[Cleanup] Removed job directory: ${jobDir}`)
        }
        */
        console.log(`[Cleanup DEBUG] Skipping cleanup for job: ${jobId}, check directory: ${jobDir}`)
        return true
    } catch (error) {
        console.error(`[Cleanup] Failed to clean up job ${jobId}:`, error)
        return false
    }
}
