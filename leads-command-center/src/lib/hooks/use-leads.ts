import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Lead, LeadNote, LeadTag, LeadStatus } from '@/lib/supabase/types'

// Types
export interface LeadsQueryOptions {
    page?: number
    pageSize?: number
    search?: string
    minRating?: number
    maxRating?: number
    hasEmail?: boolean
    hasWebsite?: boolean
    hasPhotos?: boolean
    sortBy?: 'title' | 'rating' | 'review_count' | 'created_at' | 'category' | 'city'
    sortOrder?: 'asc' | 'desc'
}

export interface LeadsResponse {
    leads: (Lead & { id: number; created_at: string })[]
    total: number
    page: number
    pageSize: number
}

export interface LeadDetailResponse {
    lead: Lead & { id: number; created_at: string }
    notes: LeadNote[]
    tags: LeadTag[]
    status: LeadStatus | null
}

// Query keys
export const leadsKeys = {
    all: ['leads'] as const,
    lists: () => [...leadsKeys.all, 'list'] as const,
    list: (options: LeadsQueryOptions) => [...leadsKeys.lists(), options] as const,
    details: () => [...leadsKeys.all, 'detail'] as const,
    detail: (cid: string) => [...leadsKeys.details(), cid] as const,
}

/**
 * Fetch paginated leads with search, filter, and sort
 */
async function fetchLeads(options: LeadsQueryOptions): Promise<LeadsResponse> {
    const params = new URLSearchParams()

    if (options.page) params.set('page', options.page.toString())
    if (options.pageSize) params.set('pageSize', options.pageSize.toString())
    if (options.search) params.set('search', options.search)
    if (options.minRating) params.set('minRating', options.minRating.toString())
    if (options.maxRating) params.set('maxRating', options.maxRating.toString())
    if (options.hasEmail) params.set('hasEmail', 'true')
    if (options.hasWebsite) params.set('hasWebsite', 'true')
    if (options.hasPhotos) params.set('hasPhotos', 'true')
    if (options.sortBy) params.set('sortBy', options.sortBy)
    if (options.sortOrder) params.set('sortOrder', options.sortOrder)

    const response = await fetch(`/api/leads?${params}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch leads')
    }

    return response.json()
}

/**
 * Fetch a single lead by CID
 */
async function fetchLead(cid: string): Promise<LeadDetailResponse> {
    const response = await fetch(`/api/leads/${encodeURIComponent(cid)}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch lead')
    }

    return response.json()
}

/**
 * Hook to fetch paginated leads
 */
export function useLeads(options: LeadsQueryOptions = {}) {
    return useQuery({
        queryKey: leadsKeys.list(options),
        queryFn: () => fetchLeads(options),
        staleTime: 30 * 1000, // 30 seconds
    })
}

/**
 * Hook to fetch a single lead by CID
 */
export function useLead(cid: string | null) {
    return useQuery({
        queryKey: leadsKeys.detail(cid || ''),
        queryFn: () => fetchLead(cid!),
        enabled: !!cid,
        staleTime: 60 * 1000, // 1 minute
    })
}

// Note mutation hooks will be added when we implement the notes API

/**
 * Hook to invalidate leads queries (useful after mutations)
 */
export function useInvalidateLeads() {
    const queryClient = useQueryClient()

    return {
        invalidateList: () => queryClient.invalidateQueries({ queryKey: leadsKeys.lists() }),
        invalidateDetail: (cid: string) => queryClient.invalidateQueries({ queryKey: leadsKeys.detail(cid) }),
        invalidateAll: () => queryClient.invalidateQueries({ queryKey: leadsKeys.all }),
    }
}
