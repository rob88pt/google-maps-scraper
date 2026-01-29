'use client'

import * as React from 'react'
import {
    X,
    Globe,
    Mail,
    Phone,
    MapPin,
    Star,
    Clock,
    Copy,
    ExternalLink,
    Download,
    ChevronLeft,
    ChevronRight,
    Tag,
    StickyNote,
    Loader2
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Lead } from '@/lib/supabase/types'
import { useLeadNotes, useLeadStatus } from '@/lib/hooks/use-leads'
import { LazyImage } from './lazy-image'

export type LeadRow = Lead & { id: number; created_at: string }

interface LeadDetailPanelProps {
    lead: LeadRow | null
    onClose: () => void
    showCloseButton?: boolean
}

const STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-green-500' },
    { value: 'closed', label: 'Closed', color: 'bg-slate-500' },
]

// Copy to clipboard helper
function useCopyToClipboard() {
    const [copied, setCopied] = React.useState<string | null>(null)

    const copy = React.useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text)
        setCopied(label)
        setTimeout(() => setCopied(null), 2000)
    }, [])

    return { copy, copied }
}

// Rating display
function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : star - 0.5 <= rating
                            ? 'text-yellow-400 fill-yellow-400/50'
                            : 'text-slate-600'
                        }`}
                />
            ))}
        </div>
    )
}

/**
 * Transforms a Google Maps image URL to its highest resolution version.
 */
function getHighResUrl(url?: string) {
    if (!url) return '';
    if (url.includes('googleusercontent.com')) {
        // Strip existing parameters and add =s0 for original resolution
        const baseUrl = url.split('=')[0];
        return `${baseUrl}=s0`;
    }
    return url;
}

// Image gallery component
function ImageGallery({ images }: { images: Lead['images'] }) {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isOpen, setIsOpen] = React.useState(false)

    if (!images || images.length === 0) return null

    const nextImage = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1))
    const prevImage = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1))

    // Keyboard support for navigation
    React.useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextImage()
            if (e.key === 'ArrowLeft') prevImage()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, images.length])

    return (
        <div className="relative">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-800 cursor-zoom-in group/image">
                        <LazyImage
                            src={images[currentIndex]?.image}
                            alt={images[currentIndex]?.title || 'Business image'}
                            className="w-full h-full"
                            imgClassName="transition-transform duration-300 group-hover/image:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors" />
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                    <DialogTitle className="sr-only">Image Preview</DialogTitle>

                    <div className="relative flex items-center justify-center w-full h-full group/preview">
                        <LazyImage
                            src={getHighResUrl(images[currentIndex]?.image)}
                            alt={images[currentIndex]?.title || 'Business image'}
                            className="max-w-full max-h-[90vh] rounded-md"
                            imgClassName="object-contain"
                            priority={true}
                        />

                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-6 top-1/2 -translate-y-1/2 h-16 w-10 rounded-md bg-black/50 hover:bg-black/70 text-white border-none transition-opacity opacity-0 group-hover/preview:opacity-100"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        prevImage()
                                    }}
                                >
                                    <ChevronLeft className="h-10 w-10" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-6 top-1/2 -translate-y-1/2 h-16 w-10 rounded-md bg-black/50 hover:bg-black/70 text-white border-none transition-opacity opacity-0 group-hover/preview:opacity-100"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        nextImage()
                                    }}
                                >
                                    <ChevronRight className="h-10 w-10" />
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            {images.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
                        onClick={prevImage}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
                        onClick={nextImage}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'
                                    }`}
                                onClick={() => setCurrentIndex(i)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export function LeadDetailPanel({ lead, onClose, showCloseButton = true }: LeadDetailPanelProps) {
    const { copy, copied } = useCopyToClipboard()
    const [noteContent, setNoteContent] = React.useState('')

    // CRM hooks
    const {
        data: statusData,
        isLoading: statusLoading,
        updateStatus
    } = useLeadStatus(lead?.cid || '')

    const {
        data: notes = [],
        isLoading: notesLoading,
        addNote
    } = useLeadNotes(lead?.cid || '')

    if (!lead) return null

    const hasOpenHours = lead.open_hours && Object.keys(lead.open_hours).length > 0

    const currentStatus = statusData?.status || 'new'

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await updateStatus.mutateAsync(newStatus)
            toast.success(`Status updated to ${newStatus}`)
        } catch (err) {
            toast.error('Failed to update status')
        }
    }

    const handleAddNote = async () => {
        if (!noteContent.trim()) return
        try {
            await addNote.mutateAsync(noteContent.trim())
            setNoteContent('')
            toast.success('Note added')
        } catch (err) {
            toast.error('Failed to add note')
        }
    }

    const exportAsJson = () => {
        const blob = new Blob([JSON.stringify(lead, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${lead.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 border-l border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between py-3 px-4 border-b border-slate-800">
                <h3 className="font-semibold text-white truncate">Lead Details</h3>
                {showCloseButton && (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-3">
                    {/* Quick Actions */}
                    <div className="space-y-2 bg-slate-800/20 p-3 rounded-lg border border-slate-800/50">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quick Actions</h4>
                            <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-500 uppercase">Tools</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-700 bg-slate-900/50 hover:bg-slate-800"
                                onClick={() => copy(JSON.stringify(lead, null, 2), 'JSON')}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy JSON
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-700 bg-slate-900/50 hover:bg-slate-800"
                                onClick={exportAsJson}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* No separator between distinct blocks */}

                    {/* CRM Section: Status & Notes */}
                    <div className="space-y-3 bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Lead Status</label>
                            <Select
                                value={currentStatus}
                                onValueChange={handleUpdateStatus}
                                disabled={updateStatus.isPending}
                            >
                                <SelectTrigger className="w-full bg-slate-900 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                                                {opt.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator className="bg-slate-800" />

                        <div className="space-y-3">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <StickyNote className="h-3 w-3" />
                                Notes
                            </label>

                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Add a note about this lead..."
                                    className="bg-slate-900 border-slate-700 min-h-[80px] text-sm"
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        className="h-8 bg-blue-600 hover:bg-blue-700"
                                        disabled={!noteContent.trim() || addNote.isPending}
                                        onClick={handleAddNote}
                                    >
                                        {addNote.isPending && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                                        Save Note
                                    </Button>
                                </div>
                            </div>

                            {notesLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                </div>
                            ) : notes.length > 0 ? (
                                <div className="space-y-3 pt-2">
                                    {notes.map((note) => (
                                        <div key={note.id} className="text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                            <p className="text-slate-300 leading-relaxed">{note.content}</p>
                                            <div className="mt-2 text-[10px] text-slate-500">
                                                {new Date(note.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 text-center py-2">No notes yet.</p>
                            )}
                        </div>
                    </div>


                    {/* Hero Section */}
                    <div className="space-y-3">
                        {/* Thumbnail or Gallery */}
                        {lead.images && lead.images.length > 0 ? (
                            <ImageGallery images={lead.images} />
                        ) : lead.thumbnail ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-800 cursor-zoom-in group/image">
                                        <LazyImage
                                            src={lead.thumbnail}
                                            alt={lead.title}
                                            className="w-full h-full"
                                            imgClassName="transition-transform duration-300 group-hover/image:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors" />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                                    <DialogTitle className="sr-only">Image Preview</DialogTitle>
                                    <LazyImage
                                        src={getHighResUrl(lead.thumbnail)}
                                        alt={lead.title}
                                        className="max-w-full max-h-[90vh] rounded-md"
                                        imgClassName="object-contain"
                                        priority={true}
                                    />
                                </DialogContent>
                            </Dialog>
                        ) : null}

                        {/* Title and Category */}
                        <div>
                            <h2 className="text-xl font-bold text-white">{lead.title}</h2>
                            <Badge variant="secondary" className="mt-1 bg-slate-800 text-slate-300">
                                {lead.category}
                            </Badge>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                            <RatingStars rating={lead.review_rating} />
                            <span className="text-white font-medium">{lead.review_rating.toFixed(1)}</span>
                            <span className="text-slate-500">({lead.review_count} reviews)</span>
                        </div>

                        {/* Status (Business Status like "Open") */}
                        {lead.status && (
                            <Badge
                                variant={lead.status.toLowerCase().includes('open') ? 'default' : 'secondary'}
                                className={lead.status.toLowerCase().includes('open') ? 'bg-green-600' : 'bg-slate-700'}
                            >
                                {lead.status}
                            </Badge>
                        )}
                    </div>

                    <Separator className="bg-slate-800/50" />

                    {/* Contact Section */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Contact</h4>

                        {lead.phone && (
                            <div className="flex items-center justify-between group">
                                <a
                                    href={`tel:${lead.phone}`}
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                                >
                                    <Phone className="h-4 w-4" />
                                    {lead.phone}
                                </a>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                    onClick={() => copy(lead.phone, 'Phone')}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}

                        {lead.emails && lead.emails.length > 0 && (
                            <div className="space-y-1.5">
                                {lead.emails.map((email, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <a
                                            href={`mailto:${email}`}
                                            className="flex items-center gap-2 text-green-400 hover:text-green-300"
                                        >
                                            <Mail className="h-4 w-4" />
                                            {email}
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                            onClick={() => copy(email, 'Email')}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {lead.web_site && (
                            <div className="flex items-center justify-between group">
                                <a
                                    href={lead.web_site}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 truncate max-w-[200px]"
                                >
                                    <Globe className="h-4 w-4 flex-shrink-0" />
                                    {new URL(lead.web_site).hostname}
                                </a>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                        onClick={() => copy(lead.web_site, 'Website')}
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => window.open(lead.web_site, '_blank')}
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator className="bg-slate-800/50" />

                    {/* Location Section */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Location</h4>

                        <div className="flex items-start justify-between group">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-slate-500" />
                                <div className="text-slate-300">
                                    {lead.address || (
                                        <>
                                            {lead.complete_address?.street && <div>{lead.complete_address.street}</div>}
                                            <div>
                                                {[
                                                    lead.complete_address?.city,
                                                    lead.complete_address?.state,
                                                    lead.complete_address?.postal_code
                                                ].filter(Boolean).join(', ')}
                                            </div>
                                            {lead.complete_address?.country && (
                                                <div className="text-slate-500">{lead.complete_address.country}</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                onClick={() => copy(lead.address || JSON.stringify(lead.complete_address), 'Address')}
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {/* Coordinates with fixed label */}
                        <div className="flex flex-col gap-1 pl-6">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Coordinates (Lat, Long)</div>
                            <div className="text-xs text-slate-400 font-mono">
                                {lead.latitude.toFixed(6)}, {lead.longtitude.toFixed(6)}
                            </div>
                        </div>

                        {lead.link && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-slate-700 bg-transparent"
                                onClick={() => window.open(lead.link, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open in Google Maps
                            </Button>
                        )}
                    </div>

                    {/* Open Hours */}
                    {hasOpenHours && (
                        <>
                            <Separator className="bg-slate-800/50" />
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Hours
                                </h4>
                                <div className="space-y-1.5 text-sm">
                                    {Object.entries(lead.open_hours).map(([day, times]) => (
                                        <div key={day} className="flex justify-between">
                                            <span className="text-slate-400 capitalize">{day}</span>
                                            <span className="text-slate-300">
                                                {Array.isArray(times) ? times.join(', ') : times}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {lead.description && (
                        <>
                            <Separator className="bg-slate-800/50" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">About</h4>
                                <p className="text-slate-300 text-sm">{lead.description}</p>
                            </div>
                        </>
                    )}

                    <Separator className="bg-slate-800/50" />

                    {/* Metadata */}
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Traceability</h4>
                        <div className="text-xs text-slate-500 space-y-1 font-mono">
                            <div className="flex justify-between">
                                <span>CID</span>
                                <span>{lead.cid}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Place ID</span>
                                <span>{lead.place_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Scraped</span>
                                <span>{new Date(lead.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section at bottom */}
                    {((lead.user_reviews && lead.user_reviews.length > 0) ||
                        (lead.user_reviews_extended && lead.user_reviews_extended.length > 0)) && (
                            <>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Star className="h-4 w-4" />
                                        Reviews ({(lead.user_reviews?.length || 0) + (lead.user_reviews_extended?.length || 0)})
                                    </h4>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {/* Extended reviews first (from extra reviews extraction) */}
                                        {lead.user_reviews_extended?.map((review, i) => (
                                            <div key={`ext-${i}`} className="bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-800">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {review.ProfilePicture && (
                                                            <LazyImage
                                                                src={review.ProfilePicture}
                                                                alt=""
                                                                className="w-6 h-6 rounded-full"
                                                            />
                                                        )}
                                                        <span className="text-sm font-medium text-white">{review.Name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <RatingStars rating={review.Rating} />
                                                        <span className="text-[10px] text-slate-500">{review.When}</span>
                                                    </div>
                                                </div>
                                                {review.Description && (
                                                    <p className="text-sm text-slate-300 leading-relaxed italic">"{review.Description}"</p>
                                                )}
                                                {review.Images && review.Images.length > 0 && (
                                                    <div className="flex gap-1 flex-wrap">
                                                        {review.Images.slice(0, 3).map((img, idx) => (
                                                            <Dialog key={idx}>
                                                                <DialogTrigger asChild>
                                                                    <div className="w-16 h-16 rounded cursor-zoom-in overflow-hidden border border-slate-700">
                                                                        <LazyImage
                                                                            src={img}
                                                                            alt=""
                                                                            className="w-full h-full"
                                                                        />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                                                                    <DialogTitle className="sr-only">Review Image Preview</DialogTitle>
                                                                    <LazyImage
                                                                        src={getHighResUrl(img)}
                                                                        alt=""
                                                                        className="max-w-full max-h-[90vh] rounded-md"
                                                                        imgClassName="object-contain"
                                                                        priority={true}
                                                                    />
                                                                </DialogContent>
                                                            </Dialog>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {/* Regular reviews */}
                                        {lead.user_reviews?.map((review, i) => (
                                            <div key={`reg-${i}`} className="bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-800">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {review.ProfilePicture && (
                                                            <LazyImage
                                                                src={review.ProfilePicture}
                                                                alt=""
                                                                className="w-6 h-6 rounded-full"
                                                            />
                                                        )}
                                                        <span className="text-sm font-medium text-white">{review.Name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <RatingStars rating={review.Rating} />
                                                        <span className="text-[10px] text-slate-500">{review.When}</span>
                                                    </div>
                                                </div>
                                                {review.Description && (
                                                    <p className="text-sm text-slate-300 leading-relaxed italic">"{review.Description}"</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                </div>
            </ScrollArea>

            {/* Copy feedback toast */}
            {copied && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm">
                    {copied} copied!
                </div>
            )}
        </div>
    )
}
