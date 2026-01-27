'use client'

import * as React from 'react'
import { AppHeader } from "@/components/layout/app-header"
import { MapBase, type MapLead } from "@/components/ui/map-base"
import { LeadDetailPanel } from "@/components/leads/lead-detail-panel"
import { useLeads } from "@/lib/hooks/use-leads"

export default function MapPage() {
    const [selectedLead, setSelectedLead] = React.useState<MapLead | null>(null)

    // Fetch leads - using a large page size for the map
    const { data } = useLeads({
        page: 1,
        pageSize: 100, // Load initial 100 leads for map
        sortBy: 'created_at',
        sortOrder: 'desc',
    })

    const leads = (data?.leads || []) as MapLead[]

    // Calculate center based on the first lead (most recent)
    const initialCenter = React.useMemo<[number, number]>(() => {
        if (leads.length > 0) {
            const first = leads[0]
            return [first.longtitude, first.latitude]
        }
        return [-9.1393, 38.7223] // Default to Lisbon center
    }, [leads])

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <AppHeader />

            <main className="flex-1 flex overflow-hidden">
                {/* Main Map Area */}
                <div className="flex-1 relative p-6">
                    <div className="flex flex-col h-full space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Map View</h2>
                                <p className="text-slate-400">Visualize leads by geographic location</p>
                            </div>
                        </div>

                        <div className="flex-1">
                            <MapBase
                                leads={leads}
                                onLeadClick={setSelectedLead}
                                center={initialCenter}
                            />
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                {selectedLead && (
                    <div className="w-[400px] border-l border-slate-800 flex-shrink-0">
                        <LeadDetailPanel
                            lead={selectedLead}
                            onClose={() => setSelectedLead(null)}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}
