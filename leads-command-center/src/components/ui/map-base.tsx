'use client'

import * as React from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Card } from '@/components/ui/card'
import { Star, ExternalLink } from 'lucide-react'
import { DataIndicators } from '../leads/leads-table'
import type { Lead } from '@/lib/supabase/types'
import { createRoot } from 'react-dom/client'

// Extended Lead type with mandatory ID for map markers
export type MapLead = Lead & { id: number; created_at: string }

interface MapBaseProps {
    leads: MapLead[]
    onLeadClick?: (lead: MapLead) => void
    center?: [number, number]
    zoom?: number
}

export function MapBase({ leads, onLeadClick, center = [-9.1393, 38.7223], zoom = 12 }: MapBaseProps) {
    const mapContainer = React.useRef<HTMLDivElement>(null)
    const map = React.useRef<maplibregl.Map | null>(null)
    const markers = React.useRef<maplibregl.Marker[]>([])

    // Initialize map
    React.useEffect(() => {
        if (!mapContainer.current || map.current) return

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'cartodb-dark': {
                        type: 'raster',
                        tiles: [
                            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
                        ],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors, &copy; CARTO',
                        maxzoom: 20
                    }
                },
                layers: [
                    {
                        id: 'cartodb-dark',
                        type: 'raster',
                        source: 'cartodb-dark',
                        paint: { 'raster-opacity': 1 }
                    }
                ]
            },
            center: center,
            zoom: zoom
        })

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

        return () => {
            map.current?.remove()
            map.current = null
        }
    }, [])

    // Update center and zoom when props change
    React.useEffect(() => {
        if (!map.current) return

        map.current.flyTo({
            center: center,
            zoom: zoom,
            speed: 1.2,
            curve: 1.42,
            essential: true
        })
    }, [center, zoom])

    // Update markers when leads change
    React.useEffect(() => {
        if (!map.current) return

        // Clear existing markers
        markers.current.forEach(m => m.remove())
        markers.current = []

        leads.forEach((lead) => {
            const lat = lead.latitude
            const lng = lead.longtitude

            if (isNaN(lat) || isNaN(lng)) return

            // Create marker element
            const el = document.createElement('div')
            el.className = 'group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95'

            // Marker content: Thumbnail or Circle
            if (lead.thumbnail) {
                const imgContainer = document.createElement('div')
                imgContainer.className = 'w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-xl bg-slate-800 flex-shrink-0 group-hover:border-blue-500 transition-colors'

                const img = document.createElement('img')
                img.src = lead.thumbnail
                img.className = 'w-full h-full object-cover'
                img.loading = 'lazy'

                imgContainer.appendChild(img)
                el.appendChild(imgContainer)

                // Add a small label that shows on hover
                const label = document.createElement('div')
                label.className = 'absolute bottom-full mb-2 bg-slate-900 border border-slate-700 rounded px-2 py-1 shadow-lg text-[10px] font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'
                label.textContent = lead.title
                el.appendChild(label)
            } else {
                const content = document.createElement('div')
                content.className = 'bg-slate-900 border border-slate-700 rounded px-2 py-1 shadow-lg text-xs font-medium text-white whitespace-nowrap group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors'
                content.innerHTML = `
                    <div class="font-bold">${lead.title}</div>
                    <div class="text-[10px] text-slate-400 group-hover:text-blue-100">${lead.category}</div>
                `
                const pin = document.createElement('div')
                pin.className = 'w-2 h-2 bg-blue-500 rounded-full border border-white mt-1 shadow-sm'
                el.appendChild(content)
                el.appendChild(pin)
            }

            // Popup content
            const popupNode = document.createElement('div')
            const root = createRoot(popupNode)

            root.render(
                <div className="p-2 min-w-[200px] bg-slate-900 text-white rounded-lg shadow-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-sm truncate">{lead.title}</div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{lead.review_rating.toFixed(1)}</span>
                        </div>
                        <span className="text-slate-500">({lead.review_count})</span>
                    </div>

                    <div className="flex gap-2">
                        <DataIndicators lead={lead} />
                    </div>

                    {lead.link && (
                        <a
                            href={lead.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 pt-1 border-t border-slate-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-3 w-3" />
                            View on Google Maps
                        </a>
                    )}
                </div>
            )

            // Create popup with interaction enabled
            const popup = new maplibregl.Popup({
                offset: lead.thumbnail ? [0, -10] : 25,
                closeButton: false,
                closeOnClick: false,
                className: 'custom-map-popup'
            }).setDOMContent(popupNode)

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map.current!)

            // Improved hover logic: keep popup open if mouse is over popup itself
            let hoverTimeout: NodeJS.Timeout | null = null;

            const showPopup = () => {
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }
                marker.getPopup().addTo(map.current!);
            };

            const hidePopup = () => {
                hoverTimeout = setTimeout(() => {
                    marker.getPopup().remove();
                }, 100);
            };

            el.addEventListener('mouseenter', showPopup);
            el.addEventListener('mouseleave', hidePopup);

            // Add listener to popup content to prevent hiding when hovering over it
            popupNode.addEventListener('mouseenter', showPopup);
            popupNode.addEventListener('mouseleave', hidePopup);

            // Handle click
            el.addEventListener('click', () => {
                onLeadClick?.(lead)
            })

            markers.current.push(marker)
        })
    }, [leads])

    return (
        <div className="w-full h-full relative border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Custom Global Styles for the Popup */}
            <style jsx global>{`
                .maplibregl-popup {
                    pointer-events: auto !important;
                }
                .maplibregl-popup-content {
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    border: none !important;
                }
                .maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color: #1e293b; }
                .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: #1e293b; }
                .maplibregl-popup-anchor-left .maplibregl-popup-tip { border-right-color: #1e293b; }
                .maplibregl-popup-anchor-right .maplibregl-popup-tip { border-left-color: #1e293b; }
            `}</style>
        </div>
    )
}
