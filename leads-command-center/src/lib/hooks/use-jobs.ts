import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Job } from '@/lib/supabase/types'
import type { JobFormValues } from '@/lib/schemas'

// Types for API responses
interface JobsResponse {
    jobs: Job[]
}

interface CreateJobResponse {
    success: boolean
    jobId: string
    containerId: string
    queryCount: number
}

interface CancelJobResponse {
    success: boolean
    containerStopped: boolean
}

// Fetch all jobs
async function fetchJobs(): Promise<Job[]> {
    const response = await fetch('/api/jobs')
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch jobs')
    }
    const data: JobsResponse = await response.json()
    return data.jobs
}

// Create a new job
async function createJob(values: JobFormValues): Promise<CreateJobResponse> {
    const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create job')
    }
    return response.json()
}

// Cancel a job
async function cancelJob(jobId: string): Promise<CancelJobResponse> {
    const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel job')
    }
    return response.json()
}

// Delete a job
async function deleteJob(jobId: string): Promise<void> {
    const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete job')
    }
}

/**
 * Hook to fetch all jobs with auto-refresh for running jobs.
 */
export function useJobs() {
    return useQuery({
        queryKey: ['jobs'],
        queryFn: fetchJobs,
        refetchInterval: (query) => {
            // Refresh every 5 seconds if any jobs are running
            const jobs = query.state.data
            if (jobs?.some(j => j.status === 'running' || j.status === 'pending')) {
                return 5000
            }
            return false
        },
    })
}

/**
 * Hook to create a new scraping job.
 */
export function useCreateJob() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createJob,
        onSuccess: () => {
            // Invalidate jobs list to refetch
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
        },
    })
}

/**
 * Hook to cancel a running job.
 */
export function useCancelJob() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: cancelJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
        },
    })
}

/**
 * Hook to delete a job.
 */
export function useDeleteJob() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
        },
    })
}
