'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobFormSchema, JobFormValues, type JobFormInput, defaultJobFormValues, languageOptions } from '@/lib/schemas'
import { usePresets, useCreatePreset, useDeletePreset, useUpdatePreset } from '@/lib/hooks/use-presets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Rocket, Save, Trash2, Settings2, MapPin, Mail, Zap, Loader2, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import type { JobPreset } from '@/lib/supabase/types'

interface JobFormProps {
    onSubmit: (values: JobFormValues) => Promise<void>
    isSubmitting?: boolean
}

export function JobForm({ onSubmit, isSubmitting = false }: JobFormProps) {
    const [selectedPresetId, setSelectedPresetId] = useState<string>('')
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [presetName, setPresetName] = useState('')

    // Preset hooks
    const { data: presets = [], isLoading: presetsLoading } = usePresets()
    const createPreset = useCreatePreset()
    const updatePreset = useUpdatePreset()
    const deletePreset = useDeletePreset()

    const form = useForm<JobFormInput, any, JobFormValues>({
        resolver: zodResolver(jobFormSchema),
        defaultValues: defaultJobFormValues,
    })

    const handleSubmit = form.handleSubmit(async (values) => {
        try {
            await onSubmit(values)
        } catch (error) {
            console.error(error)
        }
    })

    // Load preset into form
    const handleLoadPreset = (presetId: string) => {
        setSelectedPresetId(presetId)
        if (presetId === 'none') return

        const preset = presets.find(p => p.id === presetId)
        if (!preset) return

        const params = preset.params
        form.reset({
            ...defaultJobFormValues,
            queries: params.queries?.join('\n') || '',
            depth: params.depth,
            concurrency: params.concurrency,
            extractEmail: params.email,
            extraReviews: params.extraReviews ?? 0,
            lang: params.lang,
            geo: params.geo,
            zoom: params.zoom,
            radius: params.radius,
            proxies: params.proxies?.join('\n') || '',
            fastMode: params.fastMode,
            exitOnInactivity: params.exitOnInactivity,
            debug: params.debug,
        })
        toast.success(`Loaded preset: ${preset.name}`)
    }

    // Save current form as preset
    const handleSavePreset = async () => {
        if (!presetName.trim()) {
            toast.error('Please enter a preset name')
            return
        }

        const values = form.getValues()
        try {
            await createPreset.mutateAsync({
                name: presetName.trim(),
                params: {
                    depth: Number(values.depth) || 10,
                    concurrency: Number(values.concurrency) || 4,
                    email: Boolean(values.extractEmail),
                    extraReviews: Number(values.extraReviews) || 0,
                    lang: values.lang || 'en',
                    geo: values.geo || '',
                    zoom: Number(values.zoom) || 15,
                    radius: Number(values.radius) || 10000,
                    proxies: values.proxies ? values.proxies.split('\n').filter(p => p.trim()) : [],
                    fastMode: Boolean(values.fastMode),
                    exitOnInactivity: values.exitOnInactivity || '3m',
                    debug: Boolean(values.debug),
                    queries: values.queries.split('\n').filter(q => q.trim()),
                },
            })
            toast.success(`Preset "${presetName}" saved!`)
            setPresetName('')
            setSaveDialogOpen(false)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save preset')
        }
    }

    // Overwrite existing preset
    const handleOverwritePreset = async () => {
        if (!selectedPresetId || selectedPresetId === 'none') return

        const preset = presets.find(p => p.id === selectedPresetId)
        if (!preset) return

        const values = form.getValues()
        try {
            await updatePreset.mutateAsync({
                id: selectedPresetId,
                params: {
                    depth: Number(values.depth) || 10,
                    concurrency: Number(values.concurrency) || 4,
                    email: Boolean(values.extractEmail),
                    extraReviews: Number(values.extraReviews) || 0,
                    lang: values.lang || 'en',
                    geo: values.geo || '',
                    zoom: Number(values.zoom) || 15,
                    radius: Number(values.radius) || 10000,
                    proxies: values.proxies ? values.proxies.split('\n').filter(p => p.trim()) : [],
                    fastMode: Boolean(values.fastMode),
                    exitOnInactivity: values.exitOnInactivity || '3m',
                    debug: Boolean(values.debug),
                    queries: values.queries.split('\n').filter(q => q.trim()),
                },
            })
            toast.success(`Preset "${preset.name}" updated!`)
            setOverwriteDialogOpen(false)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update preset')
        }
    }

    // Delete a preset
    const handleDeletePreset = async () => {
        if (!selectedPresetId || selectedPresetId === 'none') return

        const preset = presets.find(p => p.id === selectedPresetId)
        if (!preset) return

        try {
            await deletePreset.mutateAsync(preset.id)
            setSelectedPresetId('')
            toast.success(`Preset "${preset.name}" deleted`)
            setDeleteDialogOpen(false)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete preset')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Preset Controls */}
            <div className="flex items-center gap-2">
                <Select value={selectedPresetId} onValueChange={handleLoadPreset}>
                    <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700">
                        <SelectValue placeholder={presetsLoading ? 'Loading...' : 'Load preset...'} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="none">No preset</SelectItem>
                        {presets.map((preset) => (
                            <div key={preset.id} className="flex items-center justify-between group">
                                <SelectItem value={preset.id} className="flex-1">
                                    {preset.name}
                                </SelectItem>
                            </div>
                        ))}
                    </SelectContent>
                </Select>

                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" className="border-slate-700" title="Save as new preset">
                            <Save className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-white">Save as New Preset</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="presetName">Preset Name</Label>
                                <Input
                                    id="presetName"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    placeholder="e.g., Lisbon Electricians"
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={handleSavePreset}
                                disabled={createPreset.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {createPreset.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Save Preset
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {selectedPresetId && selectedPresetId !== 'none' && (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="border-blue-500/50 text-blue-500 hover:bg-blue-500/20 hover:text-blue-400"
                            title="Overwrite existing preset"
                            onClick={() => setOverwriteDialogOpen(true)}
                        >
                            <RefreshCcw className="h-4 w-4" />
                        </Button>

                        <AlertDialog open={overwriteDialogOpen} onOpenChange={setOverwriteDialogOpen}>
                            <AlertDialogContent className="bg-slate-950 border-slate-800 text-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Overwrite Preset?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                        This will update the existing preset with your current form settings. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleOverwritePreset}
                                        className="!bg-blue-600 hover:!bg-blue-700 !text-white font-bold"
                                    >
                                        {updatePreset.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Overwrite
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="border-red-500/50 text-red-500 hover:bg-red-500/20 hover:text-red-400"
                            title="Delete preset"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <AlertDialogContent className="bg-slate-950 border-slate-800 text-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Preset?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                        Are you sure you want to delete this preset? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeletePreset}
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                                    >
                                        {deletePreset.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>

            {/* Core Options */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-blue-500" />
                        Core Options
                    </CardTitle>
                    <CardDescription>Basic scraping configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Label htmlFor="queries" className="cursor-help">Search Queries (one per line) *</Label>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                Enter keywords for businesses you want to find (e.g., 'plumbers Lisbon'). Each line is a separate search.
                            </TooltipContent>
                        </Tooltip>
                        <Textarea
                            id="queries"
                            placeholder="electricians lisbon&#10;plumbers porto&#10;restaurants faro"
                            className="min-h-[120px] bg-slate-800 border-slate-700 font-mono text-sm"
                            {...form.register('queries')}
                        />
                        {form.formState.errors.queries && (
                            <p className="text-red-400 text-sm">{form.formState.errors.queries.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor="depth" className="cursor-help">Depth (max scroll)</Label>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    How many pages of results to scroll through. High depth finds more leads but takes significantly longer.
                                </TooltipContent>
                            </Tooltip>
                            <Input
                                id="depth"
                                type="number"
                                min={1}
                                max={100}
                                className="bg-slate-800 border-slate-700"
                                {...form.register('depth', { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor="concurrency" className="cursor-help">Concurrency</Label>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Number of parallel browser windows. Speed up jobs by using more, but requires more system memory (RAM).
                                </TooltipContent>
                            </Tooltip>
                            <Input
                                id="concurrency"
                                type="number"
                                min={1}
                                max={16}
                                className="bg-slate-800 border-slate-700"
                                {...form.register('concurrency', { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Email & Reviews */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Mail className="h-5 w-5 text-green-500" />
                        Email & Reviews
                    </CardTitle>
                    <CardDescription>Additional data extraction options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="extractEmail"
                            checked={form.watch('extractEmail')}
                            onCheckedChange={(checked) => form.setValue('extractEmail', !!checked)}
                        />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Label htmlFor="extractEmail" className="cursor-help">
                                    Extract emails from business websites
                                </Label>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                Visit business websites to find contact emails. This adds a second stage to the scraping process.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="extraReviewsEnabled"
                                checked={Number(form.watch('extraReviews') || 0) > 0}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        form.setValue('extraReviews', 300) // Default to 300 reviews
                                    } else {
                                        form.setValue('extraReviews', 0)
                                    }
                                }}
                            />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor="extraReviewsEnabled" className="cursor-help">
                                        Collect extended reviews
                                    </Label>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    Collect more reviews than the default ones shown in search. Essential for sentiment analysis.
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        {Number(form.watch('extraReviews') || 0) > 0 && (
                            <div className="ml-6 flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Label htmlFor="extraReviewsCount" className="text-sm text-slate-400 whitespace-nowrap cursor-help">
                                            Max reviews:
                                        </Label>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        Limit the total reviews per business. Collecting thousands of reviews is not recommended unless specifically needed.
                                    </TooltipContent>
                                </Tooltip>
                                <Input
                                    id="extraReviewsCount"
                                    type="number"
                                    min={10}
                                    max={2000}
                                    className="bg-slate-800 border-slate-700 w-24"
                                    {...form.register('extraReviews', { valueAsNumber: true })}
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Location Settings */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        Location Settings
                    </CardTitle>
                    <CardDescription>Geographic targeting options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor="lang" className="cursor-help">Language</Label>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    The language context for Google Maps. Affects address formatting and metadata.
                                </TooltipContent>
                            </Tooltip>
                            <Select
                                value={form.watch('lang')}
                                onValueChange={(value) => form.setValue('lang', value)}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {languageOptions.map((lang) => (
                                        <SelectItem key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor="geo" className="cursor-help">Geo Coordinates (lat,lng)</Label>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Hard-code the search center (lat,lng). Example: 38.7223,-9.1393. Overrides query-based location.
                                </TooltipContent>
                            </Tooltip>
                            <Input
                                id="geo"
                                placeholder="38.7223,-9.1393"
                                className="bg-slate-800 border-slate-700"
                                {...form.register('geo')}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor="zoom" className="cursor-help">Zoom Level (0-21)</Label>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    The 'magnification' level of the map. 15 is a standard city view; 10 shows a whole region.
                                </TooltipContent>
                            </Tooltip>
                            <Input
                                id="zoom"
                                type="number"
                                min={0}
                                max={21}
                                className="bg-slate-800 border-slate-700"
                                {...form.register('zoom', { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor="radius" className="cursor-help">Radius (meters)</Label>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Search within this distance (in meters) from the center. 10000m = 10km radius.
                                </TooltipContent>
                            </Tooltip>
                            <Input
                                id="radius"
                                type="number"
                                min={0}
                                className="bg-slate-800 border-slate-700"
                                {...form.register('radius', { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                        Advanced
                    </CardTitle>
                    <CardDescription>Performance and debugging options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Label htmlFor="proxies" className="cursor-help">Proxies (one per line)</Label>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                List of proxy servers to rotate. Helps stay undetected and avoid 'Too Many Requests' errors from Google.
                            </TooltipContent>
                        </Tooltip>
                        <Textarea
                            id="proxies"
                            placeholder="http://user:pass@proxy1.com:8080&#10;socks5://user:pass@proxy2.com:1080"
                            className="min-h-[80px] bg-slate-800 border-slate-700 font-mono text-sm"
                            {...form.register('proxies')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Label htmlFor="exitOnInactivity" className="cursor-help">Exit on Inactivity</Label>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                Stop the job if no new data is found for this long (e.g., 3m). Prevents jobs from hanging forever.
                            </TooltipContent>
                        </Tooltip>
                        <Input
                            id="exitOnInactivity"
                            placeholder="3m"
                            className="bg-slate-800 border-slate-700 w-32"
                            {...form.register('exitOnInactivity')}
                        />
                    </div>
                    <Separator className="bg-slate-700" />
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="fastMode"
                                checked={form.watch('fastMode')}
                                onCheckedChange={(checked) => form.setValue('fastMode', !!checked)}
                            />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor="fastMode" className="cursor-help">Fast mode</Label>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Maximize speed by skipping heavy rendering. Returns up to 21 results per query. Requires Geo Coordinates.
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="debug"
                                checked={form.watch('debug')}
                                onCheckedChange={(checked) => form.setValue('debug', !!checked)}
                            />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor="debug" className="cursor-help">Debug mode (show browser)</Label>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Show the actual browser window while it works. Useful for troubleshooting but slower.
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
                type="submit"
                size="lg"
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
            >
                <Rocket className="h-5 w-5" />
                {isSubmitting ? 'Starting Job...' : 'Start Scraping Job'}
            </Button>
        </form>
    )
}
