import { Settings } from "../types/settings"
import { extract_hostnames } from "./functions/extract_hostname"
import { init_settings } from "./set_default_settings"

chrome.runtime.onInstalled.addListener(async () => {
    await init_settings()
})

// Helper to promisify chrome.storage.sync.get for settings
const get_stored_settings = (): Promise<Settings | undefined> =>
    new Promise(resolve => {
        chrome.storage.sync.get("settings", result => {
            resolve(result.settings as Settings | undefined)
        })
    })

async function check_schoolbox_page(tab_id: number, tab: chrome.tabs.Tab) {
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
                files: ["news_search_module.js"],
            })
            await chrome.scripting.insertCSS({
                target: { tabId: tab_id },
                files: ["news_search_module.css"],
            })
        } catch (err) {
            console.error("Failed to inject content script for news search:", err)
        }
    }
}

async function check_bob_page(tab_id: number, tab: chrome.tabs.Tab) {
    const tab_url = tab.url

    console.log(tab_url)

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

// listen for tab updates, and inject content script if conditions are met
chrome.tabs.onUpdated.addListener(async (tab_id, _, tab) => {
    // if (change_info.status !== "complete" || !tab.url) return
    if (!tab.url) return

    await check_schoolbox_page(tab_id, tab)
    await check_bob_page(tab_id, tab)
})
