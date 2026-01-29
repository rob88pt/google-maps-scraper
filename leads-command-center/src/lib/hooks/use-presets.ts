import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { VisibilityState, SortingState } from '@tanstack/react-table'
import type { LeadsFilters } from '@/components/leads/leads-filters'
import type { JobPreset } from '@/lib/supabase/types'

// Re-export SearchTemplate for compatibility with components using that name
export type SearchTemplate = JobPreset;

export const presetKeys = {
    all: ['search-templates'] as const,
    lists: () => [...presetKeys.all, 'list'] as const,
}

/**
 * Individual hooks for specific actions (used by JobForm, etc.)
 */
export function useCreatePreset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (template: Partial<JobPreset>) => {
            const response = await fetch('/api/search-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template),
            })
            if (!response.ok) throw new Error('Failed to save template')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: presetKeys.all })
        }
    })
}

export function useUpdatePreset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, params }: { id: string; params: any }) => {
            const response = await fetch(`/api/search-templates`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, params }),
            })
            if (!response.ok) throw new Error('Failed to update template')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: presetKeys.all })
        }
    })
}

export function useDeletePreset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/search-templates?id=${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete template')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: presetKeys.all })
        }
    })
}

/**
 * Combined hook used by SearchPresetManager
 */
export function usePresets() {
    const query = useQuery({
        queryKey: presetKeys.lists(),
        queryFn: async () => {
            const response = await fetch('/api/search-templates')
            if (!response.ok) throw new Error('Failed to fetch templates')
            const result = await response.json()
            return result.templates as JobPreset[]
        }
    })

    const savePreset = useCreatePreset()
    const deletePreset = useDeletePreset()

    return {
        presets: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        savePreset,
        deletePreset,
        data: query.data // Add .data for components that destructure directly from the query
    }
}
