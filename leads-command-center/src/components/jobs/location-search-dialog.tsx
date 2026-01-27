'use client'

import * as React from 'react'
import { Search, MapPin, Loader2, Target } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface LocationResult {
    display_name: string
    lat: string
    lon: string
}

interface LocationSearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (lat: number, lng: number) => void
}

export function LocationSearchDialog({ open, onOpenChange, onSelect }: LocationSearchDialogProps) {
    const [query, setQuery] = React.useState('')
    const [results, setResults] = React.useState<LocationResult[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!query.trim()) return

        setIsLoading(true)
        try {
            // Use Nominatim OpenStreetMap API
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                {
                    headers: {
                        'Accept-Language': 'en'
                    }
                }
            )
            const data = await response.json()
            setResults(data)
        } catch (error) {
            console.error('Location search failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelect = (result: LocationResult) => {
        onSelect(parseFloat(result.lat), parseFloat(result.lon))
        onOpenChange(false)
        setQuery('')
        setResults([])
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        Search Location
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Search for a city or address to get coordinates.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSearch} className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="e.g. Lisbon, Portugal"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9 bg-slate-950 border-slate-800 ring-offset-slate-900 focus-visible:ring-blue-500"
                            autoFocus
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                    </Button>
                </form>

                <ScrollArea className="mt-4 max-h-[300px]">
                    <div className="space-y-1">
                        {results.length > 0 ? (
                            results.map((result, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(result)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700 group flex items-start gap-3"
                                >
                                    <Target className="h-4 w-4 mt-1 text-slate-500 group-hover:text-blue-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-slate-200">{result.display_name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                                            {result.lat}, {result.lon}
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : query && !isLoading ? (
                            <div className="text-center py-8 text-slate-500 text-sm italic">
                                No locations found.
                            </div>
                        ) : !query && !isLoading ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                Enter a location above to find coordinates.
                            </div>
                        ) : null}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
