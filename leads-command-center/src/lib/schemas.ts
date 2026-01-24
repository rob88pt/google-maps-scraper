import { z } from 'zod'

// Schema for job submission form - all fields have explicit defaults
export const jobFormSchema = z.object({
    // Core Options
    queries: z.string().min(1, 'At least one query is required'),
    depth: z.coerce.number().min(1).max(100).default(10),
    concurrency: z.coerce.number().min(1).max(16).default(4),
    outputJson: z.boolean().default(false),

    // Email & Reviews
    extractEmail: z.boolean().default(false),
    extraReviews: z.coerce.number().min(0).default(0), // 0 = disabled, >0 = max reviews to collect

    // Location Settings
    lang: z.string().default('en'),
    geo: z.string().default(''),
    zoom: z.coerce.number().min(0).max(21).default(15),
    radius: z.coerce.number().min(0).default(10000),

    // Proxy Configuration
    proxies: z.string().default(''),

    // Advanced
    fastMode: z.boolean().default(false),
    exitOnInactivity: z.string().default('3m'),
    debug: z.boolean().default(false),

    // Preset
    presetId: z.string().optional(),
})

export type JobFormValues = z.infer<typeof jobFormSchema>

// Input type (what the form expects before validation)
export type JobFormInput = z.input<typeof jobFormSchema>

// Schema for saving a preset
export const presetFormSchema = z.object({
    name: z.string().min(1, 'Preset name is required').max(50),
})

export type PresetFormValues = z.infer<typeof presetFormSchema>

// Default values for new job form
export const defaultJobFormValues: JobFormInput = {
    queries: '',
    depth: 10,
    concurrency: 4,
    outputJson: false,
    extractEmail: false,
    extraReviews: 0, // 0 = disabled, >0 = max reviews to collect
    lang: 'en',
    geo: '',
    zoom: 15,
    radius: 10000,
    proxies: '',
    fastMode: false,
    exitOnInactivity: '3m',
    debug: false,
}

// Language options for the dropdown
export const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'nl', label: 'Dutch' },
    { value: 'pl', label: 'Polish' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
]
