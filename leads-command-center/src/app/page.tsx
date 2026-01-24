'use client'

import { useState } from 'react'
import { AppHeader } from "@/components/layout/app-header"
import { JobForm } from "@/components/jobs/job-form"
import { JobConfigDialog } from "@/components/jobs/job-config-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, RefreshCw, Clock, CheckCircle2, XCircle, Loader2, MoreVertical, StopCircle, Trash2 } from "lucide-react"
import { toast } from 'sonner'
import { useJobs, useCreateJob, useCancelJob, useDeleteJob } from '@/lib/hooks/use-jobs'
import type { JobFormValues } from "@/lib/schemas"
import type { Job } from '@/lib/supabase/types'

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  running: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
}

const statusIcons = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  cancelled: XCircle,
}

export default function JobsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; job: Job | null }>({
    open: false,
    job: null,
  })
  const [configDialog, setConfigDialog] = useState<{ open: boolean; job: Job | null }>({
    open: false,
    job: null,
  })

  // TanStack Query hooks
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobs()
  const createJob = useCreateJob()
  const cancelJob = useCancelJob()
  const deleteJob = useDeleteJob()

  const handleSubmitJob = async (values: JobFormValues) => {
    try {
      const result = await createJob.mutateAsync(values)
      toast.success(`Job started! Scraping ${result.queryCount} queries...`)
      setIsDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start job')
    }
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelJob.mutateAsync(jobId)
      toast.success('Job cancelled')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel job')
    }
  }

  const openDeleteConfirmation = (job: Job) => {
    setDeleteConfirm({ open: true, job })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.job) return

    try {
      await deleteJob.mutateAsync(deleteConfirm.job.id)
      toast.success('Job deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete job')
    } finally {
      setDeleteConfirm({ open: false, job: null })
    }
  }

  const openConfigDialog = (job: Job) => {
    setConfigDialog({ open: true, job })
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Scraping Jobs</h2>
            <p className="text-slate-400">Start new jobs and monitor progress</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Scraping Job</DialogTitle>
              </DialogHeader>
              <JobForm onSubmit={handleSubmitJob} isSubmitting={createJob.isPending} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Job Queue</CardTitle>
                <CardDescription>Your recent and active scraping jobs</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-500">
                  No jobs yet. Click "New Job" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job: Job) => {
                    const StatusIcon = statusIcons[job.status]
                    const canCancel = job.status === 'running' || job.status === 'pending'
                    const canDelete = !canCancel

                    return (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => openConfigDialog(job)}
                      >
                        <div className="flex items-center gap-4">
                          <StatusIcon className={`h-5 w-5 ${job.status === 'running' ? 'animate-spin text-blue-500' :
                            job.status === 'completed' ? 'text-green-500' :
                              job.status === 'failed' ? 'text-red-500' :
                                job.status === 'pending' ? 'text-yellow-500' :
                                  'text-slate-400'
                            }`} />
                          <div>
                            <p className="text-white font-medium">
                              {job.queries.slice(0, 2).join(', ')}
                              {job.queries.length > 2 && ` +${job.queries.length - 2} more`}
                            </p>
                            <p className="text-slate-400 text-sm">
                              {new Date(job.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={statusColors[job.status]}>
                            {job.status}
                          </Badge>
                          {job.status === 'running' && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse gap-1">
                              <span className="h-2 w-2 rounded-full bg-red-500"></span>
                              LIVE
                            </Badge>
                          )}
                          <span className="text-slate-400 text-sm min-w-[80px] text-right tabular-nums">
                            {job.result_count.toLocaleString()} leads
                          </span>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                              {canCancel && (
                                <DropdownMenuItem
                                  onClick={() => handleCancelJob(job.id)}
                                  className="text-yellow-500 focus:text-yellow-500"
                                >
                                  <StopCircle className="h-4 w-4 mr-2" />
                                  Cancel Job
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem
                                  onClick={() => openDeleteConfirmation(job)}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => !open && setDeleteConfirm({ open: false, job: null })}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Job?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete this job record.
              {deleteConfirm.job?.result_count && deleteConfirm.job.result_count > 0
                ? ` The ${deleteConfirm.job.result_count.toLocaleString()} leads collected will be preserved.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteJob.isPending}
            >
              {deleteJob.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Configuration Dialog */}
      <JobConfigDialog
        job={configDialog.job}
        open={configDialog.open}
        onOpenChange={(open) => setConfigDialog({ ...configDialog, open })}
      />
    </div>
  )
}
