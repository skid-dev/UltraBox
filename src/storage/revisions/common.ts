const recents_prefix = "news_recent_"

export function get_storage_key(name: string): string {
    return `${recents_prefix}${name}`
}
