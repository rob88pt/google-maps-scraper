'use client'

import * as React from 'react'
import { X, Globe, Mail, Camera, Star, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface LeadsFilters {
    minRating: number
    maxRating: number
    hasEmail: boolean
    doesNotHaveEmail: boolean
    websiteType: 'all' | 'proper' | 'social' | 'none'
    hasPhotos: boolean
    hasReviews: boolean
    noReviews: boolean
    minReviewCount: number | undefined
    maxReviewCount: number | undefined
}

interface LeadsFiltersProps {
    filters: LeadsFilters
    onFiltersChange: (filters: LeadsFilters) => void
}

const defaultFilters: LeadsFilters = {
    minRating: 0,
    maxRating: 5,
    hasEmail: false,
    doesNotHaveEmail: false,
    websiteType: 'all',
    hasPhotos: false,
    hasReviews: false,
    noReviews: false,
    minReviewCount: undefined,
    maxReviewCount: undefined,
}

export function LeadsFilters({ filters, onFiltersChange }: LeadsFiltersProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const [searchQuery, setSearchQuery] = React.useState('')

    const activeFilterCount = [
        filters.minRating > 0,
        filters.maxRating < 5,
        filters.hasEmail,
        filters.doesNotHaveEmail,
        filters.websiteType !== 'all',
        filters.hasPhotos,
        filters.hasReviews,
        filters.noReviews,
        filters.minReviewCount !== undefined,
        filters.maxReviewCount !== undefined,
    ].filter(Boolean).length

    const handleReset = () => {
        onFiltersChange(defaultFilters)
        setSearchQuery('')
    }

    const updateFilter = <K extends keyof LeadsFilters>(key: K, value: LeadsFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value })
    }

    // Filter visibility logic
    const showSection = (label: string, fields: string[]) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        return label.toLowerCase().includes(query) || fields.some(f => f.toLowerCase().includes(query))
    }

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) setSearchQuery('')
        }}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 border-slate-700 bg-transparent">
                    Filters
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 bg-blue-600 text-white text-xs px-1.5">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-slate-900 border-slate-700 p-0 overflow-hidden shadow-xl" align="start">
                <div className="flex flex-col max-h-[600px]">
                    {/* Header & Search */}
                    <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">Filter Leads</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="h-8 px-2 text-slate-400 hover:text-white"
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                Reset
                            </Button>
                        </div>
                        <div className="relative group/filter-search">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within/filter-search:text-blue-400 transition-colors" />
                            <Input
                                placeholder="Find a filter..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 pr-8 bg-slate-950 border-slate-800 text-xs text-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 overflow-y-auto overscroll-contain">
                        <div className="p-4 space-y-6">
                            {/* 1. WEB PRESENCE - Priority Section */}
                            {showSection('Web Presence', ['website', 'social', 'proper', 'facebook', 'instagram', 'twitter', 'x']) && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Web Presence</Label>
                                        <Separator className="flex-1 bg-slate-800" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant={filters.websiteType === 'all' ? 'default' : 'outline'}
                                            size="sm"
                                            className={`h-8 text-xs ${filters.websiteType === 'all' ? 'bg-blue-600 hover:bg-blue-500' : 'border-slate-800 bg-transparent hover:bg-slate-800'}`}
                                            onClick={() => updateFilter('websiteType', 'all')}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            variant={filters.websiteType === 'proper' ? 'default' : 'outline'}
                                            size="sm"
                                            className={`h-8 text-xs ${filters.websiteType === 'proper' ? 'bg-blue-600 hover:bg-blue-500' : 'border-slate-800 bg-transparent hover:bg-slate-800'}`}
                                            onClick={() => updateFilter('websiteType', 'proper')}
                                            title="Excludes social media pages"
                                        >
                                            Proper Site
                                        </Button>
                                        <Button
                                            variant={filters.websiteType === 'social' ? 'default' : 'outline'}
                                            size="sm"
                                            className={`h-8 text-xs ${filters.websiteType === 'social' ? 'bg-blue-600 hover:bg-blue-500' : 'border-slate-800 bg-transparent hover:bg-slate-800'}`}
                                            onClick={() => updateFilter('websiteType', 'social')}
                                            title="Only Facebook, Instagram, Twitter/X"
                                        >
                                            Social Only
                                        </Button>
                                        <Button
                                            variant={filters.websiteType === 'none' ? 'default' : 'outline'}
                                            size="sm"
                                            className={`h-8 text-xs ${filters.websiteType === 'none' ? 'bg-blue-600 hover:bg-blue-500' : 'border-slate-800 bg-transparent hover:bg-slate-800'}`}
                                            onClick={() => updateFilter('websiteType', 'none')}
                                        >
                                            No Website
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* 2. QUALITY */}
                            {showSection('Quality & Reviews', ['rating', 'stars', 'reviews', 'count']) && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quality & Reviews</Label>
                                        <Separator className="flex-1 bg-slate-800" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Label className="text-xs text-slate-400">Star rating</Label>
                                                <Star className="h-3 w-3 text-yellow-500/70" />
                                            </div>
                                            <div className="flex items-center gap-1.5 pt-0.5">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={5}
                                                    step={0.5}
                                                    value={filters.minRating}
                                                    onChange={(e) => updateFilter('minRating', parseFloat(e.target.value) || 0)}
                                                    className="h-8 bg-slate-950 border-slate-800 text-xs text-slate-200 px-2 w-14"
                                                    placeholder="0"
                                                    aria-label="Minimum star rating"
                                                />
                                                <span className="text-slate-700">-</span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={5}
                                                    step={0.5}
                                                    value={filters.maxRating}
                                                    onChange={(e) => updateFilter('maxRating', parseFloat(e.target.value) || 5)}
                                                    className="h-8 bg-slate-950 border-slate-800 text-xs text-slate-200 w-14 px-2"
                                                    placeholder="5"
                                                    aria-label="Maximum star rating"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs text-slate-400">Number of reviews</Label>
                                            </div>
                                            <div className="flex items-center gap-1.5 pt-0.5">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="0"
                                                    value={filters.minReviewCount ?? ''}
                                                    onChange={(e) => updateFilter('minReviewCount', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                                    className="h-8 bg-slate-950 border-slate-800 text-xs text-slate-200 flex-1 px-2"
                                                    aria-label="Minimum number of reviews"
                                                />
                                                <span className="text-slate-700">-</span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="50+"
                                                    value={filters.maxReviewCount ?? ''}
                                                    onChange={(e) => updateFilter('maxReviewCount', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                                    className="h-8 bg-slate-950 border-slate-800 text-xs text-slate-200 flex-1 px-2"
                                                    aria-label="Maximum number of reviews"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-1">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="hasReviews"
                                                checked={filters.hasReviews}
                                                onCheckedChange={(checked) => onFiltersChange({
                                                    ...filters,
                                                    hasReviews: !!checked,
                                                    noReviews: checked ? false : filters.noReviews
                                                })}
                                                className="border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <label htmlFor="hasReviews" className="text-xs text-slate-300 cursor-pointer select-none">Has reviews</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="noReviews"
                                                checked={filters.noReviews}
                                                onCheckedChange={(checked) => onFiltersChange({
                                                    ...filters,
                                                    noReviews: !!checked,
                                                    hasReviews: checked ? false : filters.hasReviews
                                                })}
                                                className="border-slate-700 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                            />
                                            <label htmlFor="noReviews" className="text-xs text-slate-300 cursor-pointer select-none">No reviews</label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. CONTACT INFO */}
                            {showSection('Contact Setup', ['email', 'mail', 'contact']) && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Setup</Label>
                                        <Separator className="flex-1 bg-slate-800" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="hasEmail"
                                                checked={filters.hasEmail}
                                                onCheckedChange={(checked) => onFiltersChange({
                                                    ...filters,
                                                    hasEmail: !!checked,
                                                    doesNotHaveEmail: checked ? false : filters.doesNotHaveEmail
                                                })}
                                                className="border-slate-700 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                            />
                                            <label htmlFor="hasEmail" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
                                                <Mail className="h-3 w-3 text-green-500/70" /> Has email
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="doesNotHaveEmail"
                                                checked={filters.doesNotHaveEmail}
                                                onCheckedChange={(checked) => onFiltersChange({
                                                    ...filters,
                                                    doesNotHaveEmail: !!checked,
                                                    hasEmail: checked ? false : filters.hasEmail
                                                })}
                                                className="border-slate-700 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                            />
                                            <label htmlFor="doesNotHaveEmail" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
                                                <X className="h-3 w-3 text-red-500/70" /> No email
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. MEDIA */}
                            {showSection('Assets', ['photos', 'media', 'images']) && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assets</Label>
                                        <Separator className="flex-1 bg-slate-800" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="hasPhotos"
                                            checked={filters.hasPhotos}
                                            onCheckedChange={(checked) => updateFilter('hasPhotos', !!checked)}
                                            className="border-slate-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                        <label htmlFor="hasPhotos" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
                                            <Camera className="h-3 w-3 text-purple-500/70" /> Has photos
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20"
                            onClick={() => setIsOpen(false)}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export { defaultFilters }
