import { search_for_news_item } from "../../storage/get"
import { increment_item_bounce_count, update_item_vc_and_lvt } from "../../storage/set"
import { TabCacheEntry } from "../../types/tab_cache"
import { get_tabs_async } from "../functions/promisify"

let tab_cache = new Map<number, TabCacheEntry>()

export async function on_open(tab_id: number, _: any, tab: chrome.tabs.Tab) {
    await on_update_track_tab(tab_id, _, tab)

    // if the tab was not opened via the launcher, don't track bounce
    if (!tab.url?.includes("webreader") && !tab.url?.includes("ub_ref=launcher")) {
        return
    }

    // get the URL of the closed tab without query or fragment parameters
    const tab_url_cleaned = tab.url.split("#")[0].split("?")[0]

    // find the item with the url
    const matching = await search_for_news_item(i => {
        return tab_url_cleaned.includes(i.link) || i.link.includes(tab_url_cleaned)
    })

    if (matching.length > 0) {
        const item = matching[0]
        await update_item_vc_and_lvt(item.parent_channel, item.item.guid)
    }
}

export async function on_update_track_tab(tab_id: number, _: any, tab: chrome.tabs.Tab) {
    let open_tabs = await get_tabs_async({})

    open_tabs.forEach(t => {
        if (t.id === undefined) {
            return
        }
        if (
            tab_cache.has(t.id) && // tab already cached
            tab_cache.get(t.id)?.url === t.url && // url is the same
            tab_cache.get(t.id)?.title === t.title // title is the same
        ) {
            return
        }
        tab_cache.set(t.id, { url: t.url, title: t.title, updated_at: Date.now() })
    })
}

const BOUNCE_THRESHOLD_MS = 10 * 1000 // 10 seconds
export async function on_close(tab_id: number) {
    const last_closed_tab = get_last_closed_tab(tab_id)

    if (!last_closed_tab) return

    // if the tab was closed recently, and it was opened from the launcer
    // add one to the bounce rate
    const tab_opened_at = last_closed_tab.updated_at
    let now = Date.now()
    if (now - tab_opened_at > BOUNCE_THRESHOLD_MS) return

    // if the tab was not opened via the launcher, don't track bounce
    if (
        !last_closed_tab.url?.includes("webreader") &&
        !last_closed_tab.url?.includes("ub_ref=launcher")
    ) {
        return
    }

    // get the URL of the closed tab without query or fragment parameters
    const closed_tab_url = last_closed_tab.url.split("#")[0].split("?")[0]

    // find the item with the url
    const matching = await search_for_news_item(i => {
        return closed_tab_url.includes(i.link) || i.link.includes(closed_tab_url)
    })

    if (matching.length > 0) {
        const item = matching[0]
        await increment_item_bounce_count(item.parent_channel, item.item.guid)
    }
}

export function get_last_closed_tab(tab_id: number): TabCacheEntry | null {
    let tab_just_closed = tab_cache.get(tab_id)
    if (tab_just_closed) {
        // remove from cache
        tab_cache.delete(tab_id)
    }
    return tab_just_closed || null
}
