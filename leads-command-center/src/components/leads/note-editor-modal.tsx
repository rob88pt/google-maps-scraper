'use client'

import * as React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Trash2 } from 'lucide-react'
import type { LeadNote } from '@/lib/supabase/types'

interface NoteEditorModalProps {
    note: LeadNote | null
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, content: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
    isSaving?: boolean
    isDeleting?: boolean
}

export function NoteEditorModal({
    note,
    isOpen,
    onClose,
    onSave,
    onDelete,
    isSaving = false,
    isDeleting = false
}: NoteEditorModalProps) {
    const [content, setContent] = React.useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

    // Sync content with note when it opens
    React.useEffect(() => {
        if (note) {
            setContent(note.content)
        } else {
            setContent('')
        }
    }, [note, isOpen])

    const handleSave = async () => {
        if (!note || !content.trim() || content === note.content) return
        await onSave(note.id, content.trim())
        onClose()
    }

    const handleDelete = async () => {
        if (!note) return
        await onDelete(note.id)
        setShowDeleteConfirm(false)
        onClose()
    }

    if (!note) return null

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-slate-200">Edit Note</DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[300px] bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-blue-500/50 resize-none"
                            placeholder="Note content..."
                            autoFocus
                        />
                        <div className="mt-2 text-[10px] text-slate-500 font-mono flex justify-between">
                            <span>Last updated: {new Date(note.created_at).toLocaleString()}</span>
                            <span>{content.length} characters</span>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-9"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSaving || isDeleting}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Note
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={isSaving || isDeleting}
                                className="text-slate-400 hover:text-slate-300 h-9"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={!content.trim() || content === note.content || isSaving || isDeleting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9"
                            >
                                {isSaving && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete this note? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
                        >
                            {isDeleting && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                            Delete Note
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
