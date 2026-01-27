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
import { ArrowUpDown, ChevronDown, Globe, Mail, Camera, UtensilsCrossed, ShoppingCart, Calendar, Star, MoreHorizontal, ExternalLink, Copy, Phone } from 'lucide-react'

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

// Extended Lead type with row metadata
export type LeadRow = Lead & { id: number; created_at: string }

interface LeadsTableProps {
    data: LeadRow[]
    isLoading?: boolean
    onRowClick?: (lead: LeadRow) => void
    selectedIds?: Set<number>
    onSelectionChange?: (ids: Set<number>) => void
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

// Column definitions
export const columns: ColumnDef<LeadRow>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="border-slate-600"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="border-slate-600"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    },
    {
        accessorKey: 'thumbnail',
        header: '',
        cell: ({ row }) => {
            const thumbnail = row.getValue('thumbnail') as string
            return thumbnail ? (
                <img
                    src={thumbnail}
                    alt=""
                    className="w-10 h-10 rounded-md object-cover bg-slate-800"
                />
            ) : (
                <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center">
                    <span className="text-lg">🏢</span>
                </div>
            )
        },
        enableSorting: false,
        size: 50,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="text-slate-400 hover:text-white -ml-4"
            >
                Name
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <div className="font-medium text-white">{row.getValue('title')}</div>
                <div className="text-xs text-slate-500">{row.original.category}</div>
            </div>
        ),
        size: 250,
    },
    {
        id: 'input_id',
        accessorKey: 'input_id',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="text-slate-400 hover:text-white -ml-4"
            >
                Query
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="text-sm text-slate-400">
                {row.getValue('input_id')}
            </div>
        ),
        size: 150,
    },
    {
        accessorKey: 'complete_address',
        header: 'Location',
        cell: ({ row }) => {
            const addr = row.original.complete_address
            const city = addr?.city || ''
            const state = addr?.state || ''
            return (
                <div className="text-sm text-slate-300">
                    {city}{city && state ? ', ' : ''}{state}
                </div>
            )
        },
        size: 200,
    },
    {
        accessorKey: 'web_site',
        header: 'Website',
        cell: ({ row }) => {
            const website = row.getValue('web_site') as string
            if (!website) return <span className="text-slate-600">—</span>

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
        accessorKey: 'review_rating',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="text-slate-400 hover:text-white -ml-4"
            >
                Rating
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => (
            <RatingDisplay
                rating={row.getValue('review_rating') as number}
                count={row.original.review_count}
            />
        ),
        size: 120,
    },
    {
        id: 'indicators',
        header: 'Data',
        cell: ({ row }) => <DataIndicators lead={row.original} />,
        enableSorting: false,
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
    },
]

export function LeadsTable({
    data,
    isLoading = false,
    onRowClick,
    selectedIds,
    onSelectionChange,
}: LeadsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const isDesktop = useMediaQuery("(min-width: 1280px)")
    const hasInitializedVisibility = React.useRef(false)

    // Set responsive column defaults on mount
    React.useEffect(() => {
        if (!hasInitializedVisibility.current && !isLoading) {
            if (!isDesktop) {
                setColumnVisibility((prev) => ({
                    ...prev,
                    input_id: false,
                    indicators: false,
                }))
            }
            hasInitializedVisibility.current = true
        }
    }, [isDesktop, isLoading])

    const table = useReactTable({
        data,
        columns,
        columnResizeMode: 'onChange',
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // Sync selection with parent
    React.useEffect(() => {
        if (onSelectionChange) {
            const selectedRows = table.getSelectedRowModel().rows
            const ids = new Set(selectedRows.map(row => row.original.id))
            onSelectionChange(ids)
        }
    }, [rowSelection, table, onSelectionChange])

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
        <div className="w-full">
            {/* Column visibility toggle */}
            <div className="flex items-center justify-end mb-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-slate-700 bg-transparent">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                >
                                    {column.id === 'web_site' ? 'Website' :
                                        column.id === 'input_id' ? 'Query' :
                                            column.id === 'complete_address' ? 'Location' :
                                                column.id === 'review_rating' ? 'Rating' :
                                                    column.id.replace(/_/g, ' ')}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-slate-800 overflow-hidden overflow-x-auto">
                <Table style={{ minWidth: '100%', width: table.getCenterTotalSize(), tableLayout: 'fixed' }}>
                    <TableHeader className="bg-slate-900/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-slate-800 hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-slate-400 relative group/header"
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
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
                                ))}
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
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{ width: cell.column.getSize() }}
                                            className="overflow-hidden"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
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
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
