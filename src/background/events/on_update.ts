import { add_url_to_recents } from "../../storage/viewed_pages"
import { Settings } from "../../types/settings"
import { extract_hostnames } from "../functions/extract_hostname"

import dark_theme_css from "./injects/dark_theme_css"
import launcher from "./injects/launcher"
import news_search from "./injects/news_search"
import box_of_books from "./injects/box_of_books"
import launcher_shortcut from "./injects/launcher_shortcut"

const INJECTS = [dark_theme_css, launcher, news_search, box_of_books, launcher_shortcut]

// additional domains to track, by default, all pages in schoolbox and box of books are tracked.
const RECENTS_TRACK_DOMAINS = [
    // google drive
    "drive.google.com",
    "docs.google.com",
    "sheets.google.com",
    "slides.google.com",

    // microsoft office
    "sharepoint.com",
    "onedrive.live.com",
]

const get_stored_settings = (): Promise<Settings | undefined> =>
    new Promise(resolve => {
        chrome.storage.sync.get("settings", result => {
            resolve(result.settings as Settings | undefined)
        })
    })

async function track_page_if_in_domain(tab_id: number, tab: chrome.tabs.Tab) {
    // if no tab url, return
    const current_tab_url = tab.url
    if (!current_tab_url) return

    // if no settings, or user doesn't have recents enabled, don't track.
    const settings = await get_stored_settings()
    if (!settings || !settings.recents_list_module) return

    // if the page is in the schoolbox or box of books domain, add it to recents (if not homepage)
    const { current_domain, main_domain_hostname, is_homepage } = extract_hostnames(
        current_tab_url,
        settings.main_domain
    )

    if (is_homepage || !main_domain_hostname) return

    // track either box of books or schoolbox pages
    if (
        !current_domain?.includes(main_domain_hostname) &&
        !current_tab_url.includes(".boxofbooks.io/reader/page/bookbox") &&
        !RECENTS_TRACK_DOMAINS.some(domain => current_domain?.includes(domain))
    )
        return
    if (!tab.title) return

    // add page URL to recents
    console.log("[Recents] Adding viewed page to recents:", current_tab_url)
    // query params and search params are automatically removed in the store function.
    add_url_to_recents(current_tab_url, tab.title)
}

export default async function on_update(tab_id: number, _: any, tab: chrome.tabs.Tab) {
    // if (change_info.status !== "complete" || !tab.url) return
    if (!tab.url) return

    const settings = await get_stored_settings()
    if (!settings) return
    for (let inject of INJECTS) {
        // setting check (supports sync or async)
        if (inject.setting) {
            const enabled = await Promise.resolve(inject.setting(settings))
            if (!enabled) continue
        }

        // condition check (supports sync or async)
        const condition_valid = await Promise.resolve(inject.condition(tab_id, tab, settings))
        if (!condition_valid) continue

        // action (supports sync or async)
        try {
            await Promise.resolve(inject.action(tab_id, tab, settings))
        } catch (err) {
            console.log("Failed to inject scripts for module", err)
        }
    }

    // await inject_scripts_for_bob_page(tab_id, tab)
    await track_page_if_in_domain(tab_id, tab)
}
