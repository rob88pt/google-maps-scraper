'use client'

import * as React from 'react'
import { X, Globe, Mail, Camera, Star, RotateCcw } from 'lucide-react'
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

export interface LeadsFilters {
    minRating: number
    maxRating: number
    hasEmail: boolean
    doesNotHaveEmail: boolean
    hasWebsite: boolean
    doesNotHaveWebsite: boolean
    hasPhotos: boolean
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
    hasWebsite: false,
    doesNotHaveWebsite: false,
    hasPhotos: false,
}

export function LeadsFilters({ filters, onFiltersChange }: LeadsFiltersProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const activeFilterCount = [
        filters.minRating > 0,
        filters.maxRating < 5,
        filters.hasEmail,
        filters.doesNotHaveEmail,
        filters.hasWebsite,
        filters.doesNotHaveWebsite,
        filters.hasPhotos,
    ].filter(Boolean).length

    const handleReset = () => {
        onFiltersChange(defaultFilters)
    }

    const updateFilter = <K extends keyof LeadsFilters>(key: K, value: LeadsFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value })
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
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
            <PopoverContent className="w-80 bg-slate-900 border-slate-700" align="start">
                <div className="space-y-4">
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

                    <Separator className="bg-slate-700" />

                    {/* Rating Range */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Rating Range</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <Input
                                    type="number"
                                    min={0}
                                    max={5}
                                    step={0.5}
                                    value={filters.minRating}
                                    onChange={(e) => updateFilter('minRating', parseFloat(e.target.value) || 0)}
                                    className="w-16 h-8 bg-slate-800 border-slate-700"
                                />
                            </div>
                            <span className="text-slate-500">to</span>
                            <Input
                                type="number"
                                min={0}
                                max={5}
                                step={0.5}
                                value={filters.maxRating}
                                onChange={(e) => updateFilter('maxRating', parseFloat(e.target.value) || 5)}
                                className="w-16 h-8 bg-slate-800 border-slate-700"
                            />
                        </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    {/* Data Availability */}
                    <div className="space-y-3">
                        <Label className="text-slate-300">Data Availability</Label>


                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hasEmail"
                                checked={filters.hasEmail}
                                onCheckedChange={(checked) => onFiltersChange({
                                    ...filters,
                                    hasEmail: !!checked,
                                    doesNotHaveEmail: checked ? false : filters.doesNotHaveEmail
                                })}
                                className="border-slate-600"
                            />
                            <label
                                htmlFor="hasEmail"
                                className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer"
                            >
                                <Mail className="h-4 w-4 text-green-400" />
                                Has email
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
                                className="border-slate-600"
                            />
                            <label
                                htmlFor="doesNotHaveEmail"
                                className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer"
                            >
                                <X className="h-4 w-4 text-red-400" />
                                No email
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hasWebsite"
                                checked={filters.hasWebsite}
                                onCheckedChange={(checked) => onFiltersChange({
                                    ...filters,
                                    hasWebsite: !!checked,
                                    doesNotHaveWebsite: checked ? false : filters.doesNotHaveWebsite
                                })}
                                className="border-slate-600"
                            />
                            <label
                                htmlFor="hasWebsite"
                                className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer"
                            >
                                <Globe className="h-4 w-4 text-blue-400" />
                                Has website
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="doesNotHaveWebsite"
                                checked={filters.doesNotHaveWebsite}
                                onCheckedChange={(checked) => onFiltersChange({
                                    ...filters,
                                    doesNotHaveWebsite: !!checked,
                                    hasWebsite: checked ? false : filters.hasWebsite
                                })}
                                className="border-slate-600"
                            />
                            <label
                                htmlFor="doesNotHaveWebsite"
                                className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer"
                            >
                                <X className="h-4 w-4 text-red-400" />
                                No website
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hasPhotos"
                                checked={filters.hasPhotos}
                                onCheckedChange={(checked) => updateFilter('hasPhotos', !!checked)}
                                className="border-slate-600"
                            />
                            <label
                                htmlFor="hasPhotos"
                                className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer"
                            >
                                <Camera className="h-4 w-4 text-purple-400" />
                                Has photos
                            </label>
                        </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    {/* Apply button */}
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => setIsOpen(false)}
                    >
                        Apply Filters
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export { defaultFilters }
