import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ResultRow, Lead } from '@/lib/supabase/types'

interface ExportRequest {
    format: 'csv' | 'json' | 'google-contacts'
    leadCids: string[]
}

/**
 * POST /api/export
 * Export selected leads in CSV, JSON, or Google Contacts format.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as ExportRequest
        const { format, leadCids } = body

        if (!format || !['csv', 'json', 'google-contacts'].includes(format)) {
            return NextResponse.json(
                { error: 'Invalid format. Must be csv, json, or google-contacts.' },
                { status: 400 }
            )
        }

        if (!leadCids || leadCids.length === 0) {
            return NextResponse.json(
                { error: 'No leads selected for export.' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Fetch leads by CIDs
        const { data: results, error } = await supabase
            .from('results')
            .select('id, data, created_at')

        if (error) {
            console.error('[API] Failed to fetch leads for export:', error)
            return NextResponse.json(
                { error: 'Failed to fetch leads.', details: error.message },
                { status: 500 }
            )
        }

        const leads = (results as ResultRow[] || [])
            .filter(row => leadCids.includes(row.data.cid))
            .map(row => normalizeLeadForExport(row.data))

        if (leads.length === 0) {
            return NextResponse.json(
                { error: 'No matching leads found.' },
                { status: 404 }
            )
        }

        // Generate export based on format
        let content: string
        let mimeType: string
        let filename: string

        switch (format) {
            case 'json':
                content = JSON.stringify(leads, null, 2)
                mimeType = 'application/json'
                filename = `leads-export-${Date.now()}.json`
                break

            case 'csv':
                content = generateCSV(leads)
                mimeType = 'text/csv; charset=utf-8'
                filename = `leads-export-${Date.now()}.csv`
                break

            case 'google-contacts':
                content = generateGoogleContactsCSV(leads)
                mimeType = 'text/csv; charset=utf-8'
                filename = `leads-google-contacts-${Date.now()}.csv`
                break

            default:
                return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
        }

        // Add UTF-8 BOM for Excel compatibility
        const bom = '\uFEFF'
        const blob = new Blob([bom + content], { type: mimeType })

        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })

    } catch (error) {
        console.error('[API] Export error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}

/**
 * Helper to normalize lead for JSON export (deduplicates reviews)
 */
function normalizeLeadForExport(lead: Lead): Lead {
    const reviews = (lead.user_reviews_extended?.length
        ? lead.user_reviews_extended
        : lead.user_reviews || [])
        .sort((a, b) => {
            const aHasText = !!(a.Description && a.Description.trim())
            const bHasText = !!(b.Description && b.Description.trim())
            if (aHasText && !bHasText) return -1
            if (!aHasText && bHasText) return 1
            return 0
        })

    return {
        ...lead,
        user_reviews: reviews,
        user_reviews_extended: undefined, // Clear to avoid duplicates/confusion
    }
}

/**
 * Generate standard CSV from leads
 */
function generateCSV(leads: Lead[]): string {
    const headers = [
        'Title',
        'Category',
        'Phone',
        'Email',
        'Website',
        'Address',
        'City',
        'State',
        'Country',
        'Rating',
        'Review Count',
        'Latitude',
        'Longitude',
        'Google Maps Link',
        'CID',
    ]

    const rows = leads.map(lead => [
        escapeCSV(lead.title),
        escapeCSV(lead.category),
        escapeCSV(lead.phone),
        escapeCSV(lead.emails?.join('; ') || ''),
        escapeCSV(lead.web_site),
        escapeCSV(lead.address),
        escapeCSV(lead.complete_address?.city || ''),
        escapeCSV(lead.complete_address?.state || ''),
        escapeCSV(lead.complete_address?.country || ''),
        lead.review_rating?.toString() || '',
        lead.review_count?.toString() || '',
        lead.latitude?.toString() || '',
        lead.longtitude?.toString() || '',  // Note: scraper typo
        escapeCSV(lead.link),
        escapeCSV(lead.cid),
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Generate Google Contacts compatible CSV
 * Follows Google Contacts import format
 */
function generateGoogleContactsCSV(leads: Lead[]): string {
    // Google Contacts CSV headers
    const headers = [
        'Name',
        'Given Name',
        'Additional Name',
        'Family Name',
        'Yomi Name',
        'Given Name Yomi',
        'Additional Name Yomi',
        'Family Name Yomi',
        'Name Prefix',
        'Name Suffix',
        'Initials',
        'Nickname',
        'Short Name',
        'Maiden Name',
        'Birthday',
        'Gender',
        'Location',
        'Billing Information',
        'Directory Server',
        'Mileage',
        'Occupation',
        'Hobby',
        'Sensitivity',
        'Priority',
        'Subject',
        'Notes',
        'Language',
        'Photo',
        'Group Membership',
        'E-mail 1 - Type',
        'E-mail 1 - Value',
        'Phone 1 - Type',
        'Phone 1 - Value',
        'Address 1 - Type',
        'Address 1 - Formatted',
        'Address 1 - Street',
        'Address 1 - City',
        'Address 1 - PO Box',
        'Address 1 - Region',
        'Address 1 - Postal Code',
        'Address 1 - Country',
        'Address 1 - Extended Address',
        'Organization 1 - Type',
        'Organization 1 - Name',
        'Organization 1 - Yomi Name',
        'Organization 1 - Title',
        'Organization 1 - Department',
        'Organization 1 - Symbol',
        'Organization 1 - Location',
        'Organization 1 - Job Description',
        'Website 1 - Type',
        'Website 1 - Value',
    ]

    const rows = leads.map(lead => {
        const fullAddress = [
            lead.complete_address?.street,
            lead.complete_address?.city,
            lead.complete_address?.state,
            lead.complete_address?.postal_code,
            lead.complete_address?.country,
        ].filter(Boolean).join(', ')

        return [
            escapeCSV(lead.title),  // Name
            '',  // Given Name
            '',  // Additional Name
            '',  // Family Name
            '',  // Yomi Name
            '',  // Given Name Yomi
            '',  // Additional Name Yomi
            '',  // Family Name Yomi
            '',  // Name Prefix
            '',  // Name Suffix
            '',  // Initials
            '',  // Nickname
            '',  // Short Name
            '',  // Maiden Name
            '',  // Birthday
            '',  // Gender
            '',  // Location
            '',  // Billing Information
            '',  // Directory Server
            '',  // Mileage
            '',  // Occupation
            '',  // Hobby
            '',  // Sensitivity
            '',  // Priority
            '',  // Subject
            escapeCSV(`Category: ${lead.category}\nRating: ${lead.review_rating} (${lead.review_count} reviews)`),  // Notes
            '',  // Language
            escapeCSV(lead.thumbnail),  // Photo
            '* myContacts',  // Group Membership
            'Work',  // E-mail 1 - Type
            escapeCSV(lead.emails?.[0] || ''),  // E-mail 1 - Value
            'Work',  // Phone 1 - Type
            escapeCSV(lead.phone),  // Phone 1 - Value
            'Work',  // Address 1 - Type
            escapeCSV(fullAddress),  // Address 1 - Formatted
            escapeCSV(lead.complete_address?.street || ''),  // Address 1 - Street
            escapeCSV(lead.complete_address?.city || ''),  // Address 1 - City
            '',  // Address 1 - PO Box
            escapeCSV(lead.complete_address?.state || ''),  // Address 1 - Region
            escapeCSV(lead.complete_address?.postal_code || ''),  // Address 1 - Postal Code
            escapeCSV(lead.complete_address?.country || ''),  // Address 1 - Country
            '',  // Address 1 - Extended Address
            '',  // Organization 1 - Type
            escapeCSV(lead.category),  // Organization 1 - Name (category as business type)
            '',  // Organization 1 - Yomi Name
            '',  // Organization 1 - Title
            '',  // Organization 1 - Department
            '',  // Organization 1 - Symbol
            '',  // Organization 1 - Location
            '',  // Organization 1 - Job Description
            'Work',  // Website 1 - Type
            escapeCSV(lead.web_site),  // Website 1 - Value
        ]
    })

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Escape a value for CSV
 */
function escapeCSV(value: string | undefined | null): string {
    if (!value) return ''

    // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`
    }

    return value
}
