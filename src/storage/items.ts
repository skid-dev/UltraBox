import { ItemRecord } from "../types/item_record"
import { RecentsEntry } from "../types/recents"
import { RevisionHistoryEntry } from "../types/rev_history"
import { Settings } from "../types/settings"

// Typed storage singletons. Storage area prefix matches the area the legacy
// chrome.storage.* calls used: sync for user-editable settings, local for the
// per-channel item caches and the revision history.

export const settings_item = storage.defineItem<Settings | null>("sync:settings", {
    fallback: null,
})

export const recents_item = storage.defineItem<RecentsEntry[]>("local:recent_pages", {
    fallback: [],
})

// Dynamic per-channel keys. defineItem can't be used at the module level for
// these since the channel name is only known at runtime, so wrap getItem /
// setItem in a small factory that captures the prefixed key and typed payload.

const NEWS_CHANNEL_PREFIX = "news_channel_"
const REVISION_PREFIX = "news_recent_"

export async function get_news_channel_items(channel_name: string): Promise<ItemRecord[] | null> {
    return await storage.getItem<ItemRecord[]>(`local:${NEWS_CHANNEL_PREFIX}${channel_name}`)
}

export async function set_news_channel_items(
    channel_name: string,
    items: ItemRecord[]
): Promise<void> {
    await storage.setItem<ItemRecord[]>(`local:${NEWS_CHANNEL_PREFIX}${channel_name}`, items)
}

export async function get_revision_entry(rev_id: string): Promise<RevisionHistoryEntry | null> {
    return await storage.getItem<RevisionHistoryEntry>(`local:${REVISION_PREFIX}${rev_id}`)
}

export async function set_revision_entry(
    rev_id: string,
    entry: RevisionHistoryEntry
): Promise<void> {
    await storage.setItem<RevisionHistoryEntry>(`local:${REVISION_PREFIX}${rev_id}`, entry)
}

// Enumerate all news channel names currently in local storage. WXT's helper
// exposes `snapshot(area)` which loads every value in the area;
// chrome.storage.local.getKeys() is lighter (keys-only) so we keep it here.
export async function list_news_channel_names(): Promise<string[]> {
    const keys = await chrome.storage.local.getKeys()
    return keys
        .filter(key => key.startsWith(NEWS_CHANNEL_PREFIX))
        .map(key => key.slice(NEWS_CHANNEL_PREFIX.length))
}
