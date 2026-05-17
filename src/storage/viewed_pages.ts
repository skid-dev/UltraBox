import { RecentsEntry } from "../types/recents"
import { recents_item } from "./items"

export async function add_url_to_recents(url: string, name: string): Promise<void> {
    // clean URL (remove media queries and page fragments)
    url = url.split("#")[0].split("?")[0]

    let recents = await recents_item.getValue()
    const now = Date.now()

    const existing_entry: RecentsEntry | undefined = recents.find(entry => entry.url === url)
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

    await recents_item.setValue(recents)
}

export async function get_recents(): Promise<RecentsEntry[]> {
    return await recents_item.getValue()
}

export async function clear_recents(): Promise<void> {
    await recents_item.setValue([])
}
