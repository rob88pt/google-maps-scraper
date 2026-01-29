'use client'

import * as React from 'react'
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, Globe, Mail, Camera, UtensilsCrossed, ShoppingCart, Calendar, Star, MoreHorizontal, ExternalLink, Copy, Phone, GripVertical, Check, Facebook, Instagram, Twitter, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import type { Lead } from '@/lib/supabase/types'
import { LazyImage } from './lazy-image'

// Extended Lead type with row metadata
export type LeadRow = Lead & { id: number; created_at: string }

interface LeadsTableProps {
    data: LeadRow[]
    isLoading?: boolean
    onRowClick?: (lead: LeadRow) => void
    selectedIds?: Set<number>
    onSelectionChange?: (ids: Set<number>) => void
    columnVisibility?: VisibilityState
    onColumnVisibilityChange?: (visibility: VisibilityState) => void
    sorting?: SortingState
    onSortingChange?: (sorting: SortingState) => void
    columnOrder?: string[]
    onColumnOrderChange?: (order: string[]) => void
    columnSizing?: Record<string, number>
    onColumnSizingChange?: (sizing: Record<string, number>) => void
    hasNextPage?: boolean
    isFetchingNextPage?: boolean
    onFetchNextPage?: () => void
}

// Helper for column labels
export function getColumnLabel(id: string): string {
    switch (id) {
        case 'web_site': return 'Website'
        case 'category': return 'Category'
        case 'input_id': return 'Query'
        case 'complete_address': return 'Location'
        case 'review_rating': return 'Rating'
        default: return id.replace(/_/g, ' ')
    }
}

// Visual indicator badges for lead data availability
export function DataIndicators({ lead }: { lead: Lead }) {
    return (
        <div className="flex items-center gap-1">
            {lead.web_site && (
                <span title="Has website">
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                </span>
            )}
            {lead.emails && lead.emails.length > 0 && (
                <span title="Has email">
                    <Mail className="h-3.5 w-3.5 text-green-400" />
                </span>
            )}
            {lead.images && lead.images.length > 0 && (
                <span title="Has photos">
                    <Camera className="h-3.5 w-3.5 text-purple-400" />
                </span>
            )}
            {lead.menu?.link && (
                <span title="Has menu">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-orange-400" />
                </span>
            )}
            {lead.order_online && lead.order_online.length > 0 && (
                <span title="Order online">
                    <ShoppingCart className="h-3.5 w-3.5 text-pink-400" />
                </span>
            )}
            {lead.reservations && lead.reservations.length > 0 && (
                <span title="Reservations">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                </span>
            )}
            {lead.review_rating >= 4.5 && (
                <span title="High rated">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                </span>
            )}
        </div>
    )
}

// Rating stars display
function RatingDisplay({ rating, count }: { rating: number; count: number }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                <Star className={`h-3.5 w-3.5 ${rating >= 1 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-500">({count})</span>
        </div>
    )
}

// Helper to detect social media platforms from URL
function getSocialPlatform(url: string) {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('fb.watch')) {
        return { icon: Facebook, label: 'Facebook Page', color: 'text-blue-500' };
    }
    if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
        return { icon: Instagram, label: 'Instagram Profile', color: 'text-pink-500' };
    }
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
        return { icon: Twitter, label: 'Twitter Profile', color: 'text-sky-400' };
    }
    return null;
}

// CRM Status colors and styles
function getStatusStyles(status: string = 'new', isChecked: boolean = false) {
    switch (status) {
        case 'contacted':
            return isChecked ? 'bg-blue-600 border-blue-500' : 'bg-blue-500/20 border-blue-500'
        case 'qualified':
            return isChecked ? 'bg-emerald-600 border-emerald-500' : 'bg-emerald-500/20 border-emerald-500'
        case 'closed':
            return isChecked ? 'bg-rose-600 border-rose-500' : 'bg-rose-500/20 border-rose-500'
        case 'archived':
            return isChecked ? 'bg-amber-600 border-amber-500' : 'bg-amber-500/20 border-amber-500'
        default: // 'new'
            return isChecked ? 'bg-primary border-primary' : 'bg-slate-700/20 border-slate-500'
    }
}

// Cell Copy Button component
function CellCopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(`${label} copied to clipboard`)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
            onClick={handleCopy}
            title={`Copy ${label}`}
        >
            {copied ? (
                <Check className="h-3 w-3 text-green-500" />
            ) : (
                <Copy className="h-3 w-3 text-slate-500" />
            )}
        </Button>
    )
}

// Column definitions
export const columns: ColumnDef<LeadRow>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div
                className="flex items-center justify-center h-full w-full cursor-pointer"
                style={{ minHeight: '44px' }}
                onClick={(e) => {
                    e.stopPropagation()
                    table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected())
                }}
            >
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="border-slate-600"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        ),
        cell: ({ row }) => {
            const isSelected = row.getIsSelected()
            const status = row.original.crm_status || 'new'
            const statusStyles = getStatusStyles(status, isSelected)

            return (
                <div
                    className="flex items-center justify-center h-full w-full cursor-pointer"
                    style={{ minHeight: '48px' }}
                    onClick={(e) => {
                        e.stopPropagation()
                        row.toggleSelected(!isSelected)
                    }}
                >
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className={cn(
                            "transition-colors",
                            statusStyles,
                            // Override default shadcn checked classes to use our status colors
                            isSelected && statusStyles
                        )}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 44,
        meta: { reorderable: false },
    },
    {
        accessorKey: 'thumbnail',
        header: '',
        cell: ({ row }) => {
            const thumbnail = row.getValue('thumbnail') as string
            return thumbnail ? (
                <LazyImage
                    src={thumbnail}
                    alt=""
                    className="w-10 h-10 rounded-md"
                />
            ) : (
                <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center">
                    <span className="text-lg">🏢</span>
                </div>
            )
        },
        enableSorting: false,
        size: 50,
        id: 'thumbnail',
    },
    {
        accessorKey: 'title',
        header: 'Name',
        cell: ({ row }) => {
            const notesCount = row.original.notes_count || 0
            return (
                <div className="font-medium text-white whitespace-normal break-words flex items-center gap-1.5 group">
                    <span className="flex-1">{row.getValue('title')}</span>
                    {notesCount > 0 && (
                        <div title={`${notesCount} note${notesCount > 1 ? 's' : ''}`} className="shrink-0 text-blue-400">
                            <MessageSquare className="h-3 w-3 fill-blue-400/20" />
                        </div>
                    )}
                    <CellCopyButton text={row.getValue('title')} label="Name" />
                </div>
            )
        },
        size: 250,
    },
    {
        accessorKey: 'review_rating',
        header: 'Rating',
        cell: ({ row }) => (
            <RatingDisplay
                rating={row.getValue('review_rating') as number}
                count={row.original.review_count}
            />
        ),
        size: 120,
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
            const category = row.getValue('category') as string || '—'
            return (
                <div className="text-sm text-slate-300 whitespace-normal break-words flex items-center group">
                    <span className="flex-1">{category}</span>
                    {category !== '—' && <CellCopyButton text={category} label="Category" />}
                </div>
            )
        },
        size: 180,
    },
    {
        accessorKey: 'web_site',
        header: 'Website',
        cell: ({ row }) => {
            const website = row.getValue('web_site') as string
            if (!website) return <span className="text-slate-600">—</span>

            const social = getSocialPlatform(website);

            if (social) {
                const Icon = social.icon;
                return (
                    <a
                        href={website}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-sm ${social.color} hover:opacity-80 flex items-center gap-1.5 overflow-hidden`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate font-medium">{social.label}</span>
                    </a>
                )
            }

            // Clean display URL (remove protocol)
            const displayUrl = website.replace(/^https?:\/\//, '').replace(/\/$/, '')

            return (
                <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Globe className="h-3 w-3 shrink-0" />
                    <span className="truncate">{displayUrl}</span>
                </a>
            )
        },
        size: 200,
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => {
            const phone = row.getValue('phone') as string
            return phone ? (
                <a
                    href={`tel:${phone}`}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Phone className="h-3 w-3" />
                    {phone}
                </a>
            ) : (
                <span className="text-slate-600">—</span>
            )
        },
        size: 150,
    },
    {
        accessorKey: 'complete_address',
        header: 'Location',
        cell: ({ row }) => {
            const addr = row.original.complete_address
            const fullAddress = row.original.address
            if (!fullAddress) return <span className="text-slate-600">—</span>

            const city = addr?.city
            const state = addr?.state

            // Construct secondary line from components, excluding city/state to avoid redundancy
            const secondaryLine = [
                addr?.street,
                addr?.borough,
                addr?.postal_code
            ].filter(Boolean).join(', ')

            return (
                <div className="text-sm text-slate-300 whitespace-normal break-words flex items-center group">
                    <div className="flex-1">
                        {(city || state) ? (
                            <>
                                <span className="font-semibold text-slate-200">
                                    {city}{city && state ? ', ' : ''}{state}
                                </span>
                                {secondaryLine && (
                                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                        {secondaryLine}
                                    </div>
                                )}
                            </>
                        ) : (
                            fullAddress
                        )}
                    </div>
                    <CellCopyButton text={fullAddress} label="Location" />
                </div>
            )
        },
        size: 200,
    },
    {
        id: 'indicators',
        header: 'Data',
        cell: ({ row }) => <DataIndicators lead={row.original} />,
        enableSorting: false,
        size: 150,
    },
    {
        id: 'input_id',
        accessorKey: 'input_id',
        header: 'Query',
        cell: ({ row }) => {
            const query = row.getValue('input_id') as string
            return (
                <div className="text-sm text-slate-400 flex items-center group">
                    <span className="flex-1 truncate">{query}</span>
                    <CellCopyButton text={query} label="Query" />
                </div>
            )
        },
        size: 150,
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const lead = row.original

            const copyToClipboard = (text: string, label: string) => {
                navigator.clipboard.writeText(text)
                // You could add a toast notification here
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        {lead.link && (
                            <DropdownMenuItem
                                onClick={() => window.open(lead.link, '_blank')}
                                className="cursor-pointer"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open in Google Maps
                            </DropdownMenuItem>
                        )}
                        {lead.web_site && (
                            <DropdownMenuItem
                                onClick={() => window.open(lead.web_site, '_blank')}
                                className="cursor-pointer"
                            >
                                <Globe className="mr-2 h-4 w-4" />
                                Visit Website
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-slate-700" />
                        {lead.phone && (
                            <DropdownMenuItem
                                onClick={() => copyToClipboard(lead.phone, 'Phone')}
                                className="cursor-pointer"
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Phone
                            </DropdownMenuItem>
                        )}
                        {lead.emails?.[0] && (
                            <DropdownMenuItem
                                onClick={() => copyToClipboard(lead.emails[0], 'Email')}
                                className="cursor-pointer"
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Email
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={() => copyToClipboard(JSON.stringify(lead, null, 2), 'Lead data')}
                            className="cursor-pointer"
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy as JSON
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
        size: 50,
        meta: { reorderable: false },
    },
]

// Shared source of truth for column IDs
export const defaultColumnOrder = columns.map(c => c.id || (c as any).accessorKey)

export function LeadsTable({
    data,
    isLoading = false,
    onRowClick,
    selectedIds,
    onSelectionChange,
    columnVisibility: columnVisibilityProp,
    onColumnVisibilityChange: onColumnVisibilityChangeProp,
    sorting: sortingProp,
    onSortingChange: onSortingChangeProp,
    columnOrder: columnOrderProp,
    onColumnOrderChange: onColumnOrderChangeProp,
    columnSizing: columnSizingProp,
    onColumnSizingChange: onColumnSizingChangeProp,
    hasNextPage,
    isFetchingNextPage,
    onFetchNextPage,
}: LeadsTableProps) {
    const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({})
    const [internalColumnOrder, setInternalColumnOrder] = React.useState<string[]>(defaultColumnOrder)
    const [internalColumnSizing, setInternalColumnSizing] = React.useState<Record<string, number>>({})
    const [isDragging, setIsDragging] = React.useState(false)

    const sorting = sortingProp ?? internalSorting
    const setSorting = (updaterOrValue: any) => {
        if (onSortingChangeProp) {
            const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue
            onSortingChangeProp(newValue)
        } else {
            setInternalSorting(updaterOrValue)
        }
    }

    const columnVisibility = columnVisibilityProp ?? internalColumnVisibility
    const setColumnVisibility = (updaterOrValue: any) => {
        if (onColumnVisibilityChangeProp) {
            const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(columnVisibility as VisibilityState) : updaterOrValue
            onColumnVisibilityChangeProp(newValue)
        } else {
            setInternalColumnVisibility(updaterOrValue)
        }
    }

    const columnOrder = columnOrderProp ?? internalColumnOrder
    const setColumnOrder = (updaterOrValue: any) => {
        if (onColumnOrderChangeProp) {
            const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(columnOrder) : updaterOrValue
            onColumnOrderChangeProp(newValue)
        } else {
            setInternalColumnOrder(updaterOrValue)
        }
    }

    const columnSizing = columnSizingProp ?? internalColumnSizing
    const setColumnSizing = (updaterOrValue: any) => {
        if (onColumnSizingChangeProp) {
            const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(columnSizing) : updaterOrValue
            onColumnSizingChangeProp(newValue)
        } else {
            setInternalColumnSizing(updaterOrValue)
        }
    }

    const isDesktop = useMediaQuery("(min-width: 1280px)")

    // Convert Set<number> to Record<string, boolean> for React Table
    const rowSelection = React.useMemo(() => {
        const selection: Record<string, boolean> = {}
        selectedIds?.forEach(id => {
            selection[id.toString()] = true
        })
        return selection
    }, [selectedIds])

    const setRowSelection = (updaterOrValue: any) => {
        if (!onSelectionChange) return

        const nextSelection = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue
        const nextIds = new Set<number>()
        Object.keys(nextSelection).forEach(id => {
            if (nextSelection[id]) {
                nextIds.add(parseInt(id))
            }
        })
        onSelectionChange(nextIds)
    }

    const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.id.toString(),
        columnResizeMode: 'onChange',
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onColumnOrderChange: setColumnOrder,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            columnOrder,
            columnSizing,
        },
        onColumnSizingChange: setColumnSizing,
        enableRowSelection: true,
    })

    // DND Handlers
    const onDragStart = (columnId: string) => {
        setIsDragging(true)
    }

    const onDragEnd = () => {
        // Delay clearing isDragging to prevent immediate row click
        setTimeout(() => setIsDragging(false), 100)
    }

    const onDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault()
    }

    const onDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault()
        const draggedId = e.dataTransfer.getData('columnId')
        if (draggedId && draggedId !== targetId) {
            const newOrder = [...columnOrder]
            const oldIndex = newOrder.indexOf(draggedId)
            const newIndex = newOrder.indexOf(targetId)
            newOrder.splice(oldIndex, 1)
            newOrder.splice(newIndex, 0, draggedId)
            setColumnOrder(newOrder)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-900 rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 w-full">

            {/* Table wrapper with vertical and horizontal scroll */}
            <div className="flex-1 rounded-lg border border-slate-800 overflow-auto min-h-0">
                <Table style={{ minWidth: '100%', width: table.getCenterTotalSize(), tableLayout: 'fixed' }}>
                    <TableHeader className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-slate-800 hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    const isReorderable = (header.column.columnDef.meta as any)?.reorderable !== false && !header.isPlaceholder
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                "text-slate-400 relative group/header bg-slate-900 z-20 sticky top-0",
                                                header.id === 'select' ? "p-0" : "px-1",
                                                isDragging && "select-none"
                                            )}
                                            style={{ width: header.getSize() }}
                                            onDragOver={(e) => isReorderable && onDragOver(e, header.id)}
                                            onDrop={(e) => isReorderable && onDrop(e, header.id)}
                                        >
                                            {header.id === 'select' ? (
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            ) : (
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-1 overflow-hidden">
                                                        {isReorderable && (
                                                            <div
                                                                draggable
                                                                onDragStart={(e) => {
                                                                    e.dataTransfer.setData('columnId', header.id)
                                                                    onDragStart(header.id)
                                                                }}
                                                                onDragEnd={onDragEnd}
                                                                className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors shrink-0"
                                                            >
                                                                <GripVertical className="h-3.5 w-3.5" />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={cn(
                                                                "truncate select-none",
                                                                header.column.getCanSort() && "cursor-pointer hover:text-white transition-colors"
                                                            )}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                        </div>
                                                    </div>
                                                    {header.column.getCanSort() && (
                                                        <div
                                                            className="cursor-pointer hover:text-white transition-colors shrink-0 p-0.5 ml-1"
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            <ArrowUpDown className={cn(
                                                                "h-3 w-3",
                                                                header.column.getIsSorted() ? "text-blue-400" : "text-slate-600"
                                                            )} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Resize Handle */}
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={`absolute right-0 top-0 h-full w-5 cursor-col-resize select-none touch-none flex justify-center group/resizer translate-x-1/2 z-10`}
                                            >
                                                <div className={`w-[2px] h-full transition-colors group-hover/resizer:bg-blue-500/50 ${header.column.getIsResizing() ? 'bg-blue-500' : 'bg-slate-700'
                                                    }`} />
                                            </div>
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                                    onClick={(e) => {
                                        // Ignore clicks on buttons, links, or checkboxes to allow their own handlers to run
                                        const target = e.target as HTMLElement
                                        if (
                                            target.closest('button') ||
                                            target.closest('a') ||
                                            target.closest('[role="checkbox"]') ||
                                            target.closest('[data-slot="checkbox"]')
                                        ) {
                                            return
                                        }

                                        if (!isDragging) {
                                            onRowClick?.(row.original)
                                        }
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{ width: cell.column.getSize() }}
                                            className={cn(
                                                "overflow-hidden align-top py-3 px-1",
                                                cell.column.id === 'select' && "p-0 align-middle"
                                            )}
                                        >
                                            <div className="whitespace-normal break-words">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-slate-500"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination / Sentinel */}
            {hasNextPage && (
                <div
                    ref={(el) => {
                        if (el) {
                            const observer = new IntersectionObserver(
                                (entries) => {
                                    if (entries[0].isIntersecting && !isFetchingNextPage && onFetchNextPage) {
                                        onFetchNextPage()
                                    }
                                },
                                { threshold: 0.1 }
                            )
                            observer.observe(el)
                        }
                    }}
                    className="flex justify-center p-4"
                >
                    {isFetchingNextPage ? (
                        <div className="flex items-center gap-2 text-slate-400">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
                            <span>Loading more...</span>
                        </div>
                    ) : (
                        <div className="h-4 w-4" /> // Sentinel spacer
                    )}
                </div>
            )}
        </div>
    )
}
