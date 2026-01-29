import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { VisibilityState, SortingState } from '@tanstack/react-table'
import type { LeadsFilters } from '@/components/leads/leads-filters'

export interface SearchTemplate {
    id: string
    name: string
    description: string | null
    filters: LeadsFilters
    column_visibility: VisibilityState
    column_order: string[]
    column_sizing: Record<string, number>
    sorting: SortingState
    category: string | null
    search_query: string
    created_at: string
    updated_at: string
}

export const presetKeys = {
    all: ['search-templates'] as const,
    lists: () => [...presetKeys.all, 'list'] as const,
}

export function usePresets() {
    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery({
        queryKey: presetKeys.lists(),
        queryFn: async () => {
            const response = await fetch('/api/search-templates')
            if (!response.ok) throw new Error('Failed to fetch templates')
            const result = await response.json()
            return result.templates as SearchTemplate[]
        }
    })

    const savePreset = useMutation({
        mutationFn: async (template: Partial<SearchTemplate>) => {
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

    const deletePreset = useMutation({
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

    return {
        presets: data || [],
        isLoading,
        error,
        savePreset,
        deletePreset
    }
}
