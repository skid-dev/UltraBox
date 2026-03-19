export interface ItemRecord {
    title: string
    content: string
    raw: string
    parent: string
    link: string
    guid: string
    image_uri: string | null
    colour?: string
    updated_at?: number

    // new in v0.2 - improved item ordering
    view_count: number
    last_viewed: number
    bounce_count: number

    // new in v0.3 - item revision history tracking
    rev_history_uuids?: string[]
}
