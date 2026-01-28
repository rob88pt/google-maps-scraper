'use client'

import * as React from 'react'
import { Trash2 } from 'lucide-react'
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
import { useDeleteLeads } from '@/lib/hooks/use-leads'

interface DeleteLeadsButtonProps {
    selectedIds: Set<number>
    onSuccess?: () => void
}

export function DeleteLeadsButton({ selectedIds, onSuccess }: DeleteLeadsButtonProps) {
    const { mutate: deleteLeads, isPending } = useDeleteLeads()
    const [isOpen, setIsOpen] = React.useState(false)

    const handleDelete = () => {
        const ids = Array.from(selectedIds)
        deleteLeads(ids, {
            onSuccess: (data) => {
                toast.success(`Successfully deleted ${data.count} results`)
                setIsOpen(false)
                onSuccess?.()
            },
            onError: (error) => {
                toast.error(error instanceof Error ? error.message : 'Failed to delete results')
            }
        })
    }

    if (selectedIds.size === 0) return null

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 border-red-900/50 hover:bg-red-900/20 text-red-400 hover:text-red-300 bg-transparent"
                >
                    <Trash2 className="h-4 w-4" />
                    {selectedIds.size > 0 && `(${selectedIds.size})`}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        This action cannot be undone. This will permanently delete
                        <span className="font-bold text-white px-1">{selectedIds.size}</span>
                        {selectedIds.size === 1 ? 'result' : 'results'} from your database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                    >
                        {isPending ? 'Deleting...' : 'Delete Permanently'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
