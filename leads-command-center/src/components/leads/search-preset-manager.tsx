'use client'

import * as React from 'react'
import { Save, FolderOpen, Trash2, Plus, Check, Loader2, Info, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,

    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { usePresets, type SearchTemplate } from '@/lib/hooks/use-presets'
import type { VisibilityState, SortingState } from '@tanstack/react-table'
import type { LeadsFilters as FilterType } from '@/components/leads/leads-filters'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SearchPresetManagerProps {
    currentState: {
        filters: FilterType
        columnVisibility: VisibilityState
        columnOrder: string[]
        columnSizing: Record<string, number>
        sorting: SortingState
        category: string | null
        searchQuery: string
    }
    activePresetName: string | null
    onApplyPreset: (preset: SearchTemplate) => void
    onPresetDeleted: (preset: SearchTemplate) => void
}

export function SearchPresetManager({ currentState, activePresetName, onApplyPreset, onPresetDeleted }: SearchPresetManagerProps) {
    const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false)
    const [newPresetName, setNewPresetName] = React.useState('')
    const [newPresetDesc, setNewPresetDesc] = React.useState('')
    const [presetToDelete, setPresetToDelete] = React.useState<string | null>(null)
    const [searchQuery, setSearchQuery] = React.useState('')

    const { presets, isLoading, savePreset, deletePreset } = usePresets()

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPresetName.trim()) return

        try {
            await savePreset.mutateAsync({
                name: newPresetName,
                description: newPresetDesc,
                filters: currentState.filters,
                column_visibility: currentState.columnVisibility,
                column_order: currentState.columnOrder,
                column_sizing: currentState.columnSizing,
                sorting: currentState.sorting,
                category: currentState.category,
                search_query: currentState.searchQuery
            })
            toast.success('Search template saved')
            setIsSaveDialogOpen(false)
            setNewPresetName('')
            setNewPresetDesc('')
        } catch (error) {
            toast.error('Failed to save template')
        }
    }

    const handleDelete = async () => {
        if (!presetToDelete) return
        const target = presets.find(p => p.id === presetToDelete)
        try {
            await deletePreset.mutateAsync(presetToDelete)
            toast.success('Template deleted')
            if (target) onPresetDeleted(target)
            setPresetToDelete(null)
        } catch (error) {
            toast.error('Failed to delete template')
        }
    }

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className={`gap-2 border-slate-700 bg-transparent transition-all duration-200 ${activePresetName
                            ? 'border-blue-500/50 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500'
                            : 'hover:border-slate-600'
                            }`}
                    >
                        <FolderOpen className={`h-4 w-4 ${activePresetName ? 'text-blue-400' : 'text-slate-400'}`} />
                        <span className="max-w-[120px] truncate">
                            {activePresetName || 'Presets'}
                        </span>
                        {activePresetName && (
                            <Badge variant="secondary" className="ml-0.5 bg-blue-600 hover:bg-blue-600 text-white text-[10px] w-4 h-4 p-0 flex items-center justify-center rounded-full border-none shadow-sm shadow-blue-900/40 shrink-0">
                                <Check className="h-2.5 w-2.5" />
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-slate-900 border-slate-700 p-0 shadow-xl overflow-hidden">
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Saved Templates
                    </DropdownMenuLabel>
                    <div className="px-3 pb-2" onClick={(e) => e.stopPropagation()}>
                        <div className="relative group">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <Input
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="h-8 pl-8 pr-8 bg-slate-950 border-slate-800 text-xs text-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                                autoFocus
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
                    <DropdownMenuSeparator className="bg-slate-800 m-0" />

                    <ScrollArea className="max-h-[300px]">
                        <div className="p-1">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                </div>
                            ) : presets.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <div className="text-sm text-slate-400 font-medium mb-1">
                                        {presets.length === 0 ? 'No saved presets' : 'No matching templates'}
                                    </div>
                                    {presets.length === 0 && (
                                        <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                            Presets allow you to save your current filters, column layout, and search query to quickly recall them later.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                presets
                                    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((preset) => (
                                        <DropdownMenuItem
                                            key={preset.id}
                                            className={`cursor-pointer flex items-center justify-between gap-2 px-3 py-2.5 rounded-sm focus:bg-slate-800 focus:text-slate-100 group ${activePresetName === preset.name ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                                                }`}
                                            onClick={() => onApplyPreset(preset)}
                                        >
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className={`text-sm font-medium truncate ${activePresetName === preset.name ? 'text-blue-400' : 'text-slate-200'
                                                    }`}>
                                                    {preset.name}
                                                </div>
                                                {preset.description && (
                                                    <div className="text-[10px] text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                                                        {preset.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {activePresetName === preset.name && (
                                                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setPresetToDelete(preset.id)
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </DropdownMenuItem>
                                    ))
                            )}
                        </div>
                    </ScrollArea>

                    <DropdownMenuSeparator className="bg-slate-800 m-0" />
                    <div className="p-1">
                        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 h-9 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Plus className="h-4 w-4" />
                                    Save Current as Preset
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-950 border-slate-800 sm:max-w-[425px]">
                                <form onSubmit={handleSave}>
                                    <DialogHeader>
                                        <DialogTitle className="text-white">Save Search Template</DialogTitle>
                                        <DialogDescription className="text-slate-400">
                                            Save your current filters, column layout, and sorting preferences.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-slate-200">Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g., SEO Agencies with Emails"
                                                value={newPresetName}
                                                onChange={(e) => setNewPresetName(e.target.value)}
                                                className="bg-slate-900 border-slate-800 text-slate-200"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="desc" className="text-slate-200">Description (optional)</Label>
                                            <Input
                                                id="desc"
                                                placeholder="Quick description for this layout"
                                                value={newPresetDesc}
                                                onChange={(e) => setNewPresetDesc(e.target.value)}
                                                className="bg-slate-900 border-slate-800 text-slate-200"
                                            />
                                        </div>
                                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 flex gap-3 mt-2">
                                            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                                This will capture your current search query, category, all filters, column visibility, and ordering.
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsSaveDialogOpen(false)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={!newPresetName.trim() || savePreset.isPending}
                                        >
                                            {savePreset.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            Save Template
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={!!presetToDelete} onOpenChange={(open) => !open && setPresetToDelete(null)}>
                <AlertDialogContent className="bg-slate-950 border-slate-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This action cannot be undone. This will permanently delete the search template
                            "{presets.find(p => p.id === presetToDelete)?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-400 hover:bg-slate-900 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                        >
                            {deletePreset.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Template'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
