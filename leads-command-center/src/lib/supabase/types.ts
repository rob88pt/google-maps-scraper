// Database types for the Leads Command Center
// These match the scraper's output + our custom tables

// Result row from database (JSONB in data column)
export interface ResultRow {
    id: number
    data: Lead
    user_id: string | null
    created_at: string
}

export interface Lead {
    // Scraper fields (from Entry struct in gmaps/entry.go)
    // Note: Field names match JSON tags in Go struct exactly
    input_id: string
    link: string
    cid: string
    title: string
    categories: string[]
    category: string
    address: string
    open_hours: Record<string, string[]>
    popular_times: Record<string, Record<number, number>>
    web_site: string  // Note: scraper uses web_site not website
    phone: string
    plus_code: string
    review_count: number
    review_rating: number
    reviews_per_rating: Record<number, number>
    latitude: number
    longtitude: number  // Note: scraper has typo "longtitude" not "longitude"
    status: string
    description: string
    reviews_link: string
    thumbnail: string
    timezone: string
    price_range: string
    data_id: string
    place_id: string
    images: Image[]
    reservations: LinkSource[]
    order_online: LinkSource[]
    menu: LinkSource
    owner: Owner
    complete_address: Address
    about: About[]
    user_reviews?: Review[]
    user_reviews_extended?: Review[]
    emails: string[]
    // CRM Fields (added via API joins)
    crm_status?: 'new' | 'contacted' | 'qualified' | 'closed' | 'archived'
    notes_count?: number
}

export interface Image {
    title: string
    image: string
}

export interface LinkSource {
    link: string
    source: string
}

export interface Owner {
    id: string
    name: string
    link: string
}

export interface Address {
    borough: string
    street: string
    city: string
    postal_code: string
    state: string
    country: string
}

export interface About {
    id: string
    name: string
    options: { name: string; enabled: boolean }[]
}



export interface Review {
    Name: string
    ProfilePicture: string
    Rating: number
    Description: string
    Images: string[] | null
    When: string
}

export interface Job {
    id: string
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
    params: JobParams
    queries: string[]
    created_at: string
    started_at: string | null
    completed_at: string | null
    error: string | null
    result_count: number
    preset_id?: string | null
}

export interface JobParams {
    depth: number
    concurrency: number
    email: boolean
    extraReviews: number  // 0 = disabled, >0 = max reviews to collect
    lang: string
    geo: string
    zoom: number
    radius: number
    proxies: string[]
    fastMode: boolean
    exitOnInactivity: string
    debug: boolean
    queries?: string[]
}

export interface JobPreset {
    id: string
    name: string
    params: JobParams
    created_at: string
    updated_at: string
}

export interface LeadNote {
    id: string
    lead_cid: string
    content: string
    created_at: string
    updated_at: string
}

export interface LeadTag {
    id: string
    lead_cid: string
    tag: string
    created_at: string
}

export interface LeadStatus {
    lead_cid: string
    status: 'new' | 'contacted' | 'qualified' | 'closed' | 'archived'
    follow_up_date: string | null
    updated_at: string
}
