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
    doesNotHaveEmail?: boolean
    websiteType?: 'all' | 'proper' | 'social' | 'none'
    hasPhotos?: boolean
    hasReviews?: boolean
    noReviews?: boolean
    minReviewCount?: number
    maxReviewCount?: number
    category?: string
    sortBy?: 'title' | 'review_rating' | 'review_count' | 'created_at' | 'category' | 'city' | 'input_id'
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
    if (options.doesNotHaveEmail) params.set('doesNotHaveEmail', 'true')
    if (options.websiteType && options.websiteType !== 'all') params.set('websiteType', options.websiteType)
    if (options.hasPhotos) params.set('hasPhotos', 'true')
    if (options.hasReviews) params.set('hasReviews', 'true')
    if (options.noReviews) params.set('noReviews', 'true')
    if (options.minReviewCount !== undefined) params.set('minReviewCount', options.minReviewCount.toString())
    if (options.maxReviewCount !== undefined) params.set('maxReviewCount', options.maxReviewCount.toString())
    if (options.category) params.set('category', options.category)
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
 * Hook to manage lead notes
 */
export function useLeadNotes(cid: string) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: [...leadsKeys.detail(cid), 'notes'],
        queryFn: async () => {
            const response = await fetch(`/api/leads/${encodeURIComponent(cid)}/notes`)
            if (!response.ok) throw new Error('Failed to fetch notes')
            const { notes } = await response.json()
            return notes as LeadNote[]
        },
        enabled: !!cid,
    })

    const addNote = useMutation({
        mutationFn: async (content: string) => {
            const response = await fetch(`/api/leads/${encodeURIComponent(cid)}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })
            if (!response.ok) throw new Error('Failed to add note')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...leadsKeys.detail(cid), 'notes'] })
        },
    })

    return { ...query, addNote }
}

/**
 * Hook to manage lead status
 */
export function useLeadStatus(cid: string) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: [...leadsKeys.detail(cid), 'status'],
        queryFn: async () => {
            const response = await fetch(`/api/leads/${encodeURIComponent(cid)}/status`)
            if (!response.ok) throw new Error('Failed to fetch status')
            const { status } = await response.json()
            return status as LeadStatus | null
        },
        enabled: !!cid,
    })

    const updateStatus = useMutation({
        mutationFn: async (status: string) => {
            const response = await fetch(`/api/leads/${encodeURIComponent(cid)}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            if (!response.ok) throw new Error('Failed to update status')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...leadsKeys.detail(cid), 'status'] })
            // Also invalidate the list to show status changes if needed
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() })
        },
    })

    return { ...query, updateStatus }
}

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
