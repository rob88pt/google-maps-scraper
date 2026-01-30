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
    Loader2,
    Archive,
    RotateCcw,
    Plus,
    ChevronDown,
    ChevronUp
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
import type { Lead, LeadNote } from '@/lib/supabase/types'
import { useLeadNotes, useLeadStatus, useArchiveLeads, useUnarchiveLeads } from '@/lib/hooks/use-leads'
import { LazyImage } from './lazy-image'
import { NoteEditorModal } from './note-editor-modal'

export type LeadRow = Lead & { id: number; created_at: string }

interface LeadDetailPanelProps {
    lead: LeadRow | null
    onClose: () => void
    showCloseButton?: boolean
}

const STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: 'bg-slate-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-emerald-500' },
    { value: 'closed', label: 'Closed', color: 'bg-rose-500' },
    { value: 'archived', label: 'Archived', color: 'bg-amber-500' },
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
    if (!url) return ''
    if (url.includes('googleusercontent.com')) {
        return url.split('=')[0] + '=s1600'
    }
    return url
}

function RatingDistribution({ reviews }: { reviews: Lead['user_reviews'] }) {
    if (!reviews || reviews.length === 0) return null

    const distribution = reviews.reduce((acc, r) => {
        const rating = Math.floor(r.Rating)
        if (rating >= 1 && rating <= 5) acc[rating] = (acc[rating] || 0) + 1
        return acc
    }, {} as Record<number, number>)

    const maxCount = Math.max(...Object.values(distribution), 1)

    return (
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-2 mb-4">
            {[5, 4, 3, 2, 1].map(star => {
                const count = distribution[star] || 0
                const percent = (count / maxCount) * 100
                return (
                    <div key={star} className="flex items-center gap-2 text-[10px]">
                        <div className="flex items-center gap-1 w-8 shrink-0">
                            <span className="text-slate-400">{star}</span>
                            <Star className="h-2 w-2 text-yellow-500 fill-yellow-500" />
                        </div>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-4 text-slate-500 text-right">{count}</span>
                    </div>
                )
            })}
        </div>
    )
}

/**
 * Helper to normalize lead for JSON export (deduplicates & sorts reviews)
 */
function normalizeLeadForExport(lead: Lead): Lead {
    const reviews = (lead.user_reviews_extended?.length
        ? lead.user_reviews_extended
        : lead.user_reviews || [])
        .sort((a, b) => {
            const aHasText = !!(a.Description && a.Description.trim())
            const bHasText = !!(b.Description && b.Description.trim())
            if (aHasText && !bHasText) return -1
            if (!aHasText && bHasText) return 1
            return 0
        })

    return {
        ...lead,
        user_reviews: reviews,
        user_reviews_extended: undefined, // Clear to avoid duplicates/confusion
    }
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
    const [isAddingNote, setIsAddingNote] = React.useState(false)

    // CRM hooks
    const {
        data: statusData,
        isLoading: statusLoading,
        updateStatus
    } = useLeadStatus(lead?.cid || '')

    const { mutate: archiveLead, isPending: isArchiving } = useArchiveLeads()
    const { mutate: unarchiveLead, isPending: isUnarchiving } = useUnarchiveLeads()

    const [selectedNote, setSelectedNote] = React.useState<LeadNote | null>(null)
    const [isNoteEditorOpen, setIsNoteEditorOpen] = React.useState(false)

    const {
        data: notes = [],
        isLoading: notesLoading,
        addNote,
        updateNote,
        deleteNote
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

    const handleUpdateNote = async (id: string, content: string) => {
        try {
            await updateNote.mutateAsync({ id, content })
            toast.success('Note updated')
        } catch (err) {
            toast.error('Failed to update note')
        }
    }

    const handleDeleteNote = async (id: string) => {
        try {
            await deleteNote.mutateAsync(id)
            toast.success('Note deleted')
        } catch (err) {
            toast.error('Failed to delete note')
        }
    }

    const exportAsJson = () => {
        const normalized = normalizeLeadForExport(lead)
        const blob = new Blob([JSON.stringify(normalized, null, 2)], { type: 'application/json' })
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
                <div className="flex items-center gap-2 truncate flex-1">
                    <h3 className="font-semibold text-white truncate">Lead Details</h3>
                    {currentStatus === 'archived' && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-500 bg-amber-500/10 uppercase">Archived</Badge>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Copy JSON"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        onClick={() => {
                            const normalized = normalizeLeadForExport(lead)
                            copy(JSON.stringify(normalized, null, 2), 'JSON')
                        }}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Export JSON"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        onClick={exportAsJson}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-4 bg-slate-800 mx-1" />
                    {currentStatus === 'archived' ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Restore from Archive"
                            className="h-8 w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                            disabled={isUnarchiving}
                            onClick={() => {
                                unarchiveLead([lead.id], {
                                    onSuccess: () => toast.success('Lead restored from archive'),
                                    onError: () => toast.error('Failed to restore lead')
                                })
                            }}
                        >
                            {isUnarchiving ? <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> : <RotateCcw className="h-4 w-4" />}
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Archive"
                            className="h-8 w-8 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10"
                            disabled={isArchiving}
                            onClick={() => {
                                archiveLead([lead.id], {
                                    onSuccess: () => toast.success('Lead moved to archive'),
                                    onError: () => toast.error('Failed to archive lead')
                                })
                            }}
                        >
                            {isArchiving ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <Archive className="h-4 w-4" />}
                        </Button>
                    )}
                    {showCloseButton && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
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
                        <div className="space-y-1">
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="text-xl font-bold text-white leading-tight">{lead.title}</h2>
                                {lead.status && (
                                    <Badge
                                        variant={lead.status.toLowerCase().includes('open') ? 'default' : 'secondary'}
                                        className={`${lead.status.toLowerCase().includes('open') ? 'bg-green-600' : 'bg-slate-700'} shrink-0 text-[10px] h-5`}
                                    >
                                        {lead.status}
                                    </Badge>
                                )}
                            </div>
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-800">
                                {lead.category}
                            </Badge>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <RatingStars rating={lead.review_rating} />
                            <span className="text-sm text-white font-medium">{lead.review_rating.toFixed(1)}</span>
                            <span className="text-xs text-slate-500">({lead.review_count} reviews)</span>
                        </div>
                    </div>

                    {/* CRM Section: Status & Notes */}
                    <div className="space-y-3 bg-slate-800/20 p-3 rounded-lg border border-slate-800/50">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lead Management</h4>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${STATUS_OPTIONS.find(o => o.value === currentStatus)?.color || 'bg-slate-500'}`} />
                                <span className="text-[10px] font-medium text-slate-400 uppercase">{currentStatus}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-slate-500 uppercase">Change Status</label>
                                <Select
                                    value={currentStatus}
                                    onValueChange={handleUpdateStatus}
                                    disabled={updateStatus.isPending}
                                >
                                    <SelectTrigger className="h-8 bg-slate-900 border-slate-700 text-xs text-slate-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        {STATUS_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${opt.color}`} />
                                                    {opt.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
                                        <StickyNote className="h-3 w-3" />
                                        Notes ({notes.length})
                                    </label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                        onClick={() => setIsAddingNote(!isAddingNote)}
                                    >
                                        {isAddingNote ? (
                                            <><ChevronUp className="h-3 w-3 mr-1" /> Close</>
                                        ) : (
                                            <><Plus className="h-3 w-3 mr-1" /> Add Note</>
                                        )}
                                    </Button>
                                </div>

                                {isAddingNote && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Textarea
                                            placeholder="Write a note..."
                                            className="bg-slate-900 border-slate-700 min-h-[60px] text-xs text-slate-300"
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 text-[10px] text-slate-500"
                                                onClick={() => {
                                                    setIsAddingNote(false)
                                                    setNoteContent('')
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 bg-blue-600 hover:bg-blue-700 text-[10px] px-3"
                                                disabled={!noteContent.trim() || addNote.isPending}
                                                onClick={async () => {
                                                    await handleAddNote()
                                                    setIsAddingNote(false)
                                                }}
                                            >
                                                {addNote.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                                Save Note
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {notesLoading ? (
                                    <div className="flex justify-center py-2">
                                        <Loader2 className="h-3 w-3 animate-spin text-slate-600" />
                                    </div>
                                ) : notes.length > 0 ? (
                                    <div className="space-y-2">
                                        {notes.map((note) => (
                                            <div
                                                key={note.id}
                                                className="text-xs bg-slate-900/40 p-2.5 rounded border border-slate-800/50 hover:bg-slate-800/60 transition-colors cursor-pointer group/note"
                                                onClick={() => {
                                                    setSelectedNote(note)
                                                    setIsNoteEditorOpen(true)
                                                }}
                                            >
                                                <p className="text-slate-300 leading-relaxed line-clamp-2">
                                                    {note.content}
                                                </p>
                                                <div className="mt-1.5 text-[9px] text-slate-500 font-mono flex items-center justify-between">
                                                    <span>{new Date(note.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                    <span className="opacity-0 group-hover/note:opacity-100 text-blue-400">Edit</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : !isAddingNote && (
                                    <p className="text-[10px] text-slate-600 text-center py-1">No notes recorded.</p>
                                )}

                                <NoteEditorModal
                                    note={selectedNote}
                                    isOpen={isNoteEditorOpen}
                                    onClose={() => {
                                        setIsNoteEditorOpen(false)
                                        setSelectedNote(null)
                                    }}
                                    onSave={handleUpdateNote}
                                    onDelete={handleDeleteNote}
                                    isSaving={updateNote.isPending}
                                    isDeleting={deleteNote.isPending}
                                />
                            </div>
                        </div>
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


                    {/* Reviews Section at bottom */}
                    {((lead.user_reviews && lead.user_reviews.length > 0) ||
                        (lead.user_reviews_extended && lead.user_reviews_extended.length > 0)) && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            Reviews
                                            {lead.review_rating !== undefined && lead.review_rating > 0 && (
                                                <span className="ml-1 text-white normal-case">
                                                    {lead.review_rating.toFixed(1)} ({lead.review_count})
                                                </span>
                                            )}
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-slate-500 hover:text-white"
                                            title="Copy Reviews as JSON"
                                            onClick={() => {
                                                const normalized = normalizeLeadForExport(lead)
                                                copy(JSON.stringify(normalized.user_reviews, null, 2), 'Reviews JSON')
                                            }}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(() => {
                                            const normalized = normalizeLeadForExport(lead)
                                            const reviews = normalized.user_reviews || []

                                            if (reviews.length === 0) {
                                                return <p className="text-xs text-slate-500 italic">No reviews available.</p>
                                            }

                                            return (
                                                <>
                                                    <RatingDistribution reviews={reviews} />
                                                    {reviews.map((review, i) => (
                                                        <div key={i} className="bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-800">
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
                                                </>
                                            )
                                        })()}
                                    </div>
                                </div>
                            </>
                        )}

                    {/* Metadata Section (Now at bottom) */}
                    <Separator className="bg-slate-800/50" />
                    <div className="space-y-2 p-3 bg-slate-800/5 rounded-lg border border-slate-800/30">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Info</h4>
                            {lead.description && (
                                <Badge variant="outline" className="text-[8px] h-4 border-slate-700 text-slate-500">About Available</Badge>
                            )}
                        </div>

                        {lead.description && (
                            <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-2">
                                {lead.description}
                            </p>
                        )}

                        <div className="grid grid-cols-1 gap-1 text-[9px] text-slate-500 font-mono">
                            <div className="flex justify-between border-b border-slate-800/50 pb-1">
                                <span className="text-slate-600">CID</span>
                                <span className="text-slate-400 uppercase">{lead.cid}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/50 pb-1">
                                <span className="text-slate-600">Place ID</span>
                                <span className="text-slate-400 uppercase">{lead.place_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Scraped</span>
                                <span className="text-slate-400">{new Date(lead.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
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
