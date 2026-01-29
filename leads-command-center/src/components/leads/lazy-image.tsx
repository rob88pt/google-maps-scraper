'use client'

import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt: string
    className?: string
    imgClassName?: string
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
    rootMargin?: string // Distance from viewport to start loading
}

/**
 * Calculates exponential backoff with jitter to avoid thundering herd problem.
 */
function getBackoffDelay(attempt: number, base: number, max: number) {
    const exp = Math.min(max, base * Math.pow(2, attempt))
    const jitter = exp * (0.75 + Math.random() * 0.5) // 0.75x to 1.25x
    return Math.round(jitter)
}

/**
 * LazyImage component that handles:
 * 1. Intersection Observer (only load/retry when in view)
 * 2. Exponential backoff with jitter on retries
 * 3. Loading skeletons and fade-in transitions
 * 4. Error fallbacks and specific Google Maps CDN headers
 */
export function LazyImage({
    src,
    alt,
    className,
    imgClassName,
    maxRetries = 3,
    baseDelayMs = 800,
    maxDelayMs = 5000,
    rootMargin = '400px',
    priority = false, // If true, bypass intersection observer and load eagerly
    loading = priority ? 'eager' : 'lazy',
    decoding = 'async',
    referrerPolicy = 'no-referrer', // Recommended for Google usercontent URLs
    ...props
}: LazyImageProps & { priority?: boolean }) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const retryTimerRef = React.useRef<number | null>(null)

    const [inView, setInView] = React.useState(priority)
    const [attempt, setAttempt] = React.useState(0)
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle')

    // Reset state if src changes
    React.useEffect(() => {
        setAttempt(0)
        setStatus('idle')
        if (retryTimerRef.current) {
            window.clearTimeout(retryTimerRef.current)
            retryTimerRef.current = null
        }
    }, [src])

    // Intersection Observer to gate loading/retries
    React.useEffect(() => {
        if (!containerRef.current || priority) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting)
            },
            { rootMargin, threshold: 0.01 }
        )

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [rootMargin, priority])

    // Cleanup timer on unmount
    React.useEffect(() => {
        return () => {
            if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current)
        }
    }, [])

    const handleRetry = React.useCallback(() => {
        if (attempt >= maxRetries) {
            setStatus('failed')
            return
        }

        const delay = getBackoffDelay(attempt, baseDelayMs, maxDelayMs)

        if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current)

        retryTimerRef.current = window.setTimeout(() => {
            // Only retry if still in view
            if (inView) {
                setAttempt(prev => prev + 1)
                setStatus('loading')
            } else {
                // If moved out of view, wait for next inView to trigger retry
                setStatus('idle')
            }
        }, delay)
    }, [attempt, maxRetries, baseDelayMs, maxDelayMs, inView])

    // Trigger initial load when in view
    React.useEffect(() => {
        if (inView && status === 'idle' && attempt === 0) {
            setStatus('loading')
        }
    }, [inView, status, attempt])

    // Construct image URL with cache-busting retry param (only on retries)
    const effectiveSrc = React.useMemo(() => {
        if (attempt === 0) return src
        try {
            const url = new URL(src)
            url.searchParams.set('_r', attempt.toString())
            return url.toString()
        } catch (e) {
            return src // Fallback if invalid URL
        }
    }, [src, attempt])

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden bg-slate-800/50", className)}
        >
            {/* Loading State / Skeleton */}
            {(status === 'idle' || status === 'loading') && (
                <Skeleton className="absolute inset-0 z-10" />
            )}

            {/* Error State */}
            {status === 'failed' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Building2 className="h-2/3 w-2/3 text-slate-600" />
                </div>
            )}

            {/* Actual Image - only mount when in range or after first scroll */}
            {(inView || attempt > 0 || status === 'loaded') && (
                <img
                    {...props}
                    src={effectiveSrc}
                    alt={alt}
                    loading={loading}
                    decoding={decoding}
                    referrerPolicy={referrerPolicy}
                    className={cn(
                        "h-full w-full object-cover transition-opacity duration-500",
                        status === 'loaded' ? 'opacity-100' : 'opacity-0',
                        imgClassName
                    )}
                    onLoad={() => setStatus('loaded')}
                    onError={() => {
                        if (attempt < maxRetries) {
                            handleRetry()
                        } else {
                            setStatus('failed')
                        }
                    }}
                />
            )}
        </div>
    )
}
