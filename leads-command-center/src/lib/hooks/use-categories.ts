import { useQuery } from '@tanstack/react-query'
import type { LeadsQueryOptions } from './use-leads'

export interface CategoryCount {
    category: string
    count: number
}

export interface CategoriesResponse {
    categories: CategoryCount[]
}

/**
 * Fetch unique categories and their counts based on filters
 */
async function fetchCategories(options: LeadsQueryOptions): Promise<CategoriesResponse> {
    const params = new URLSearchParams()

    // Apply same filters as leads query (excluding page/pageSize/sortBy/sortOrder/category filter itself)
    if (options.search) params.set('search', options.search)
    if (options.minRating) params.set('minRating', options.minRating.toString())
    if (options.maxRating) params.set('maxRating', options.maxRating.toString())
    if (options.hasEmail) params.set('hasEmail', 'true')
    if (options.doesNotHaveEmail) params.set('doesNotHaveEmail', 'true')
    if (options.hasWebsite) params.set('hasWebsite', 'true')
    if (options.doesNotHaveWebsite) params.set('doesNotHaveWebsite', 'true')
    if (options.hasPhotos) params.set('hasPhotos', 'true')

    const response = await fetch(`/api/categories?${params}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch categories')
    }

    return response.json()
}

/**
 * Hook to fetch categories with counts
 */
export function useCategories(options: LeadsQueryOptions = {}) {
    return useQuery({
        queryKey: ['categories', { search: options.search, filters: options }],
        queryFn: () => fetchCategories(options),
        staleTime: 30 * 1000, // 30 seconds
    })
}
