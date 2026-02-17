import { add_url_to_recents } from "../../storage/viewed_pages"
import { Settings } from "../../types/settings"
import { extract_hostnames } from "../functions/extract_hostname"

// additional domains to track, by default, all pages in schoolbox and box of books are tracked.
const RECENTS_TRACK_DOMAINS = [
    // google drive
    "drive.google.com",
    "docs.google.com",
    "sheets.google.com",
    "slides.google.com",
    
    // microsoft office
    "sharepoint.com",
    "onedrive.live.com"
]

const get_stored_settings = (): Promise<Settings | undefined> =>
    new Promise(resolve => {
        chrome.storage.sync.get("settings", result => {
            resolve(result.settings as Settings | undefined)
        })
    })

async function inject_scripts_for_schoolbox_page(tab_id: number, tab: chrome.tabs.Tab) {
    const current_tab_url = tab.url
    if (!current_tab_url) return

    const settings = await get_stored_settings()

    if (!settings) return

    const { current_domain, main_domain_hostname, is_homepage } = extract_hostnames(
        current_tab_url,
        settings.main_domain
    )

    if (!main_domain_hostname || !current_domain?.includes(main_domain_hostname)) {
        return
    }

    // styles applied for all pages
    if (settings.inject_css) {
        try {
            await chrome.scripting.insertCSS({
                target: { tabId: tab_id },
                files: ["inject.css"],
            })
            await chrome.scripting.executeScript({
                target: { tabId: tab_id },
                files: ["inject_css_tools.js"],
            })
        } catch (err) {
            console.error("Failed to inject CSS:", err)
        }
    }

    if (!is_homepage) return

    // home page only modules / styles
    if (settings.launcher_module) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab_id },
                files: ["content.js"],
            })
            await chrome.scripting.insertCSS({
                target: { tabId: tab_id },
                files: ["launcher_styles.css"],
            })
        } catch (err) {
            console.error("Failed to inject content script for launcher:", err)
        }
    }

    if (settings.news_search_module) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab_id },
                files: ["news_search_main.js"],
            })
            await chrome.scripting.insertCSS({
                target: { tabId: tab_id },
                files: ["news_search_styles.css"],
            })
        } catch (err) {
            console.error("Failed to inject content script for news search:", err)
        }
    }
}

async function inject_scripts_for_bob_page(tab_id: number, tab: chrome.tabs.Tab) {
    const tab_url = tab.url

    if (!tab_url) return
    if (!tab_url.includes(".boxofbooks.io/reader/page/bookbox")) return

    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            files: ["get_textbooks.js"],
        })
    } catch (err) {
        console.log("Failed to index BoB page", err)
    }
}

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

    await inject_scripts_for_schoolbox_page(tab_id, tab)
    await inject_scripts_for_bob_page(tab_id, tab)
    await track_page_if_in_domain(tab_id, tab)
}
