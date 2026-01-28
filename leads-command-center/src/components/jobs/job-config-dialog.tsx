'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Save, Copy, Check, Info, RefreshCw } from "lucide-react"
import { toast } from 'sonner'
import { useCreatePreset } from '@/lib/hooks/use-presets'
import type { Job } from '@/lib/supabase/types'

interface JobConfigDialogProps {
    job: Job | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onResend?: (job: Job) => Promise<void>
}

export function JobConfigDialog({ job, open, onOpenChange, onResend }: JobConfigDialogProps) {
    const [isSavingPreset, setIsSavingPreset] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [presetName, setPresetName] = useState('')
    const [copied, setCopied] = useState(false)
    const createPreset = useCreatePreset()

    if (!job) return null

    const handleResend = async () => {
        if (!onResend || !job) return
        setIsResending(true)
        try {
            await onResend(job)
            onOpenChange(false)
        } catch (error) {
            // Error handling is managed in onResend
        } finally {
            setIsResending(false)
        }
    }

    const handleCopyQueries = () => {
        const queryText = job.queries.join('\n')
        navigator.clipboard.writeText(queryText)
        setCopied(true)
        toast.success('Queries copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
    }
    // ... [rest of the component structure with the button] ...

    const handleSaveAsPreset = async () => {
        if (!presetName.trim()) {
            toast.error('Please enter a name for the preset')
            return
        }

        try {
            await createPreset.mutateAsync({
                name: presetName.trim(),
                params: {
                    ...job.params,
                    queries: job.queries
                }
            })
            toast.success('Preset saved successfully!')
            setIsSavingPreset(false)
            setPresetName('')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save preset')
        }
    }

    const ParamItem = ({ label, value, badge = false }: { label: string; value: string | number | boolean; badge?: boolean }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-400">{label}</span>
            {badge ? (
                <Badge variant="secondary" className="bg-slate-800 text-slate-200 border-slate-700">
                    {String(value)}
                </Badge>
            ) : (
                <span className="text-sm font-medium text-slate-200">{String(value)}</span>
            )}
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto glass-scrollbar bg-slate-950 border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        Job Configuration
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Configuration used for this scraping job.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 my-4">
                    {/* Queries Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-slate-300">Keywords / Queries</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                                onClick={handleCopyQueries}
                            >
                                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                Copy All
                            </Button>
                        </div>
                        <ScrollArea className="h-24 w-full rounded-md border border-slate-800 bg-slate-900/50 p-2">
                            <div className="flex flex-wrap gap-1.5 p-1">
                                {job.queries.map((q, i) => (
                                    <Badge key={i} variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-300">
                                        {q}
                                    </Badge>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <Separator className="bg-slate-800" />

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-1 gap-1">
                        <ParamItem label="Depth" value={job.params.depth} badge />
                        <ParamItem label="Concurrency" value={job.params.concurrency} />
                        <ParamItem label="Email Extraction" value={job.params.email ? "Enabled" : "Disabled"} />
                        <ParamItem label="Extra Reviews" value={job.params.extraReviews} />
                        <ParamItem label="Language" value={job.params.lang} />
                        <ParamItem label="Fast Mode" value={job.params.fastMode ? "Enabled" : "Disabled"} />
                        <ParamItem label="Geocode" value={job.params.geo || "Automatic"} />
                        <ParamItem label="Zoom Level" value={job.params.zoom} />
                        <ParamItem label="Radius" value={`${job.params.radius}km`} />
                    </div>

                    {onResend && (
                        <Button
                            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white mb-2"
                            onClick={handleResend}
                            disabled={isResending}
                        >
                            <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                            {isResending ? 'Resending...' : 'Resend This Job'}
                        </Button>
                    )}

                    {isSavingPreset ? (
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <div className="space-y-2">
                                <Label htmlFor="preset-name" className="text-slate-300">Preset Name</Label>
                                <Input
                                    id="preset-name"
                                    placeholder="e.g., HVAC Denver - High Depth"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleSaveAsPreset}
                                    disabled={createPreset.isPending}
                                >
                                    {createPreset.isPending ? 'Saving...' : 'Save Preset'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    onClick={() => {
                                        setIsSavingPreset(false)
                                        setPresetName('')
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            className="w-full gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                            onClick={() => setIsSavingPreset(true)}
                        >
                            <Save className="h-4 w-4" />
                            Save as Preset
                        </Button>
                    )}
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
