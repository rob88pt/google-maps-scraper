import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { JobPreset, JobParams } from '@/lib/supabase/types'

// Types for API responses
interface PresetsResponse {
    presets: JobPreset[]
}

interface CreatePresetParams {
    name: string
    params: JobParams & { outputJson?: boolean }
}

// Fetch all presets
async function fetchPresets(): Promise<JobPreset[]> {
    const response = await fetch('/api/presets')
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch presets')
    }
    const data: PresetsResponse = await response.json()
    return data.presets
}

// Create a new preset
async function createPreset(params: CreatePresetParams): Promise<JobPreset> {
    const response = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create preset')
    }
    const data = await response.json()
    return data.preset
}

// Delete a preset
async function deletePreset(presetId: string): Promise<void> {
    const response = await fetch(`/api/presets/${presetId}`, {
        method: 'DELETE',
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete preset')
    }
}

/**
 * Hook to fetch all presets.
 */
export function usePresets() {
    return useQuery({
        queryKey: ['presets'],
        queryFn: fetchPresets,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to create a new preset.
 */
export function useCreatePreset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createPreset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presets'] })
        },
    })
}

/**
 * Hook to delete a preset.
 */
export function useDeletePreset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deletePreset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presets'] })
        },
    })
}

// Update a preset
async function updatePreset(params: { id: string; name?: string; params?: JobParams }): Promise<void> {
    const { id, ...data } = params
    const response = await fetch(`/api/presets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update preset')
    }
}

/**
 * Hook to update an existing preset.
 */
export function useUpdatePreset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updatePreset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presets'] })
        },
    })
}
