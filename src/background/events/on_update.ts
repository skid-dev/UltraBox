import { check_in_schoolbox_domain, get_stored_settings, is_page, url_begins_with } from "../functions/utls/is_page"
import track_page_if_in_domain from "../functions/utls/track_page"

import dark_theme_css from "./injects/dark_theme_css"
import launcher from "./injects/launcher"
import news_search from "./injects/news_search"
import box_of_books from "./injects/box_of_books"
import launcher_shortcut from "./injects/launcher_shortcut"
import news_tracker_fetch from "./injects/news_tracker"
import news_tracker_display from "./injects/display_history"

const INJECTS = [
    dark_theme_css,
    launcher,
    news_search,
    box_of_books,
    launcher_shortcut,
    news_tracker_fetch,
    news_tracker_display,
]

export default async function on_update(tab_id: number, _: any, tab: chrome.tabs.Tab) {
    // if (change_info.status !== "complete" || !tab.url) return
    if (!tab.url) return

    const settings = await get_stored_settings()
    if (!settings) return

    if (settings.main_domain === "") {
        // attempt to detect main domain via a special inject
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            files: ["detect_domain.js"],
        })
    }

    const url_normalised = new URL(tab.url)
    const main_domain_normalised = new URL(settings.main_domain)
    if (
        settings.news_rss_feed === "" &&
        url_normalised.hostname === main_domain_normalised.hostname
    ) {
        // attempt to detect news rss feed via a special inject
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            files: ["detect_rss_feed.js"],
        })
    }

    for (let inject of INJECTS) {
        // setting check (supports sync or async)
        if (inject.setting) {
            const enabled = await Promise.resolve(inject.setting(settings))
            if (!enabled) continue
        }

        const is_schoolbox_page = await check_in_schoolbox_domain(tab.url!)

        const base_objs = { tab_id, tab }
        const helper_fns = {
            is_page: (url_path: string) => is_page(tab.url!, url_path),
            is_schoolbox_page: is_schoolbox_page,
            url_begins_with: (url_path: string) => url_begins_with(tab.url!, url_path),
        }

        // condition check (supports sync or async)
        if (inject.condition) {
            const condition_valid = await Promise.resolve(
                inject.condition(base_objs, settings, helper_fns)
            )
            if (!condition_valid) continue
        }

        // action (supports sync or async)
        try {
            await Promise.resolve(inject.action(base_objs, settings, helper_fns))
        } catch (err) {
            console.log("Failed to inject scripts for module", err)
        }
    }

    await track_page_if_in_domain(tab_id, tab)
}
