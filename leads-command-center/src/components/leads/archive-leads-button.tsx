'use client'

import * as React from 'react'
import { Archive } from 'lucide-react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useArchiveLeads } from '@/lib/hooks/use-leads'

interface ArchiveLeadsButtonProps {
    selectedIds: Set<number>
    onSuccess?: () => void
}

export function ArchiveLeadsButton({ selectedIds, onSuccess }: ArchiveLeadsButtonProps) {
    const { mutate: archiveLeads, isPending } = useArchiveLeads()
    const [isOpen, setIsOpen] = React.useState(false)

    const handleArchive = () => {
        const ids = Array.from(selectedIds)
        archiveLeads(ids, {
            onSuccess: (data) => {
                toast.success(`Successfully archived ${data.count} results`)
                setIsOpen(false)
                onSuccess?.()
            },
            onError: (error) => {
                toast.error(error instanceof Error ? error.message : 'Failed to archive results')
            }
        })
    }

    if (selectedIds.size === 0) return null

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    title="Archive Selected"
                    className="gap-2 border-amber-900/50 hover:bg-amber-900/20 text-amber-400 hover:text-amber-300 bg-transparent"
                >
                    <Archive className="h-4 w-4" />
                    {selectedIds.size > 0 && `(${selectedIds.size})`}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Archive Results?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        This will move
                        <span className="font-bold text-white px-1">{selectedIds.size}</span>
                        {selectedIds.size === 1 ? 'result' : 'results'} to the archive.
                        They will be hidden from the main list but can be recovered later.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleArchive()
                        }}
                        disabled={isPending}
                        className="bg-amber-600 hover:bg-amber-700 text-white border-none"
                    >
                        {isPending ? 'Archiving...' : 'Archive Results'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
