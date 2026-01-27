'use client'

import * as React from 'react'
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Search, SlidersHorizontal, FileJson, FileSpreadsheet, Users } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { LeadsTable, type LeadRow } from "@/components/leads/leads-table"
import { LeadsFilters, defaultFilters, type LeadsFilters as FilterType } from "@/components/leads/leads-filters"
import { LeadDetailPanel } from "@/components/leads/lead-detail-panel"
import { useLeads, type LeadsQueryOptions } from "@/lib/hooks/use-leads"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export default function LeadsPage() {
    // State
    const [search, setSearch] = React.useState('')
    const [filters, setFilters] = React.useState<FilterType>(defaultFilters)
    const [selectedLead, setSelectedLead] = React.useState<LeadRow | null>(null)
    const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set())
    const [page, setPage] = React.useState(1)

    // Breakpoint for overlay: 1280px (xl)
    const isDesktop = useMediaQuery("(min-width: 1280px)")

    // Debounce search input
    const debouncedSearch = useDebounce(search, 300)
    // Build query options
    const queryOptions: LeadsQueryOptions = React.useMemo(() => ({
        page,
        pageSize: 25,
        search: debouncedSearch || undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        maxRating: filters.maxRating < 5 ? filters.maxRating : undefined,
        hasEmail: filters.hasEmail || undefined,
        doesNotHaveEmail: filters.doesNotHaveEmail || undefined,
        hasWebsite: filters.hasWebsite || undefined,
        doesNotHaveWebsite: filters.doesNotHaveWebsite || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
    }), [page, debouncedSearch, filters])

    // Fetch leads
    const { data, isLoading, error } = useLeads(queryOptions)

    // Export handlers
    const handleExport = async (format: 'csv' | 'json' | 'google-contacts') => {
        if (selectedIds.size === 0) {
            alert('Please select leads to export')
            return
        }

        // Find CIDs for selected leads
        const selectedCids = data?.leads
            .filter(lead => selectedIds.has(lead.id))
            .map(lead => lead.cid) || []

        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ format, leadCids: selectedCids }),
            })

            if (!response.ok) {
                throw new Error('Export failed')
            }

            // Trigger download
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `leads-export.${format === 'google-contacts' ? 'csv' : format}`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export error:', err)
            alert('Failed to export leads')
        }
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
            <AppHeader />

            <main className="flex-1 flex overflow-hidden">
                {/* Main content area */}
                <div className={`flex-1 flex flex-col p-6 min-w-0 ${selectedLead && isDesktop ? 'pr-0' : ''}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Leads</h2>
                            <p className="text-slate-400">
                                {data?.total ?? 0} leads found
                                {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
                            </p>
                        </div>
                    </div>

                    {/* Search and filter bar */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search leads by name, category, location..."
                                className="pl-10 bg-slate-900 border-slate-700"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <LeadsFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2 border-slate-700 bg-transparent"
                                    disabled={selectedIds.size === 0}
                                >
                                    <Download className="h-4 w-4" />
                                    Export {selectedIds.size > 0 && `(${selectedIds.size})`}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => handleExport('csv')}
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Export as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => handleExport('json')}
                                >
                                    <FileJson className="mr-2 h-4 w-4" />
                                    Export as JSON
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => handleExport('google-contacts')}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Export to Google Contacts
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Error state */}
                    {error && (
                        <Card className="bg-red-950/50 border-red-800 mb-6">
                            <CardContent className="pt-6">
                                <p className="text-red-400">Failed to load leads: {error.message}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Leads table */}
                    <div className="flex-1 overflow-hidden min-h-0">
                        <LeadsTable
                            data={data?.leads ?? []}
                            isLoading={isLoading}
                            onRowClick={setSelectedLead}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                        />
                    </div>

                    {/* Pagination */}
                    {data && data.total > data.pageSize && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4">
                            <p className="text-sm text-slate-500">
                                Page {data.page} of {Math.ceil(data.total / data.pageSize)}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="border-slate-700"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil(data.total / data.pageSize)}
                                    className="border-slate-700"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail panel - SIDECAR for desktop (xl+) */}
                {selectedLead && isDesktop && (
                    <div className="w-[400px] border-l border-slate-800 flex-shrink-0">
                        <LeadDetailPanel
                            lead={selectedLead}
                            onClose={() => setSelectedLead(null)}
                        />
                    </div>
                )}

                {/* Detail panel - OVERLAY for medium/small screens (< xl) */}
                <Sheet open={!!selectedLead && !isDesktop} onOpenChange={(open) => !open && setSelectedLead(null)}>
                    <SheetContent side="right" className="w-full sm:max-w-[400px] p-0 bg-slate-950 border-slate-800">
                        <SheetTitle className="sr-only">Lead Details</SheetTitle>
                        {selectedLead && (
                            <LeadDetailPanel
                                lead={selectedLead}
                                onClose={() => setSelectedLead(null)}
                                showCloseButton={false}
                            />
                        )}
                    </SheetContent>
                </Sheet>
            </main>
        </div>
    )
}
