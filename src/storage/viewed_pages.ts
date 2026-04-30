import { RecentsEntry } from "../types/recents"

const RECENTS_KEY = "recent_pages"

export async function ensure_recents_exists(): Promise<void> {
    const data = await chrome.storage.local.get(RECENTS_KEY)
    if (!data[RECENTS_KEY]) {
        await chrome.storage.local.set({ [RECENTS_KEY]: [] })
    }
}

export async function add_url_to_recents(url: string, name: string): Promise<void> {
    await ensure_recents_exists()

    // clean URL (remove media queries and page fragments)
    url = url.split("#")[0].split("?")[0]

    let data = await chrome.storage.local.get(RECENTS_KEY)
    let recents: RecentsEntry[] = data[RECENTS_KEY] as RecentsEntry[] || []
    const now = Date.now()
    
    let existing_entry: RecentsEntry | undefined = recents.find(entry => entry.url === url)
    if (existing_entry) {
        existing_entry.viewed_count += 1
        existing_entry.last_viewed_timestamp = now
    } else {
        recents.push({
            url: url,
            title: name,
            viewed_count: 1,
            last_viewed_timestamp: now,
        })
    }

    // purge pages not viewed in the last 30 days
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
    recents = recents.filter(entry => now - entry.last_viewed_timestamp <= THIRTY_DAYS_MS)

    // sort by last viewed timestamp (most recent first)
    recents.sort((a, b) => b.last_viewed_timestamp - a.last_viewed_timestamp)

    await chrome.storage.local.set({ [RECENTS_KEY]: recents })
}

export async function get_recents(): Promise<RecentsEntry[]> {
    await ensure_recents_exists()

    let data = await chrome.storage.local.get(RECENTS_KEY)
    let recents: RecentsEntry[] = data[RECENTS_KEY] as RecentsEntry[] || []
    return recents
}

export async function clear_recents(): Promise<void> {
    await chrome.storage.local.set({ [RECENTS_KEY]: [] })
}
