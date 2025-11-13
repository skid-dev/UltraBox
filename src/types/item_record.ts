export interface ItemRecord {
    title: string
    content: string
    parent: string
    link: string
    guid: string
    image_uri: string | null
    colour?: string
    updated_at?: number
}
