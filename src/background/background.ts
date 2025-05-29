import { Settings } from "../types/settings"
import { init_rss_poller } from "./pull_feed"
import { extract_hostnames } from "./functions/extract_hostname"
import { init_settings } from "./set_default_settings"

chrome.runtime.onInstalled.addListener(async () => {
    await init_settings()
    await init_rss_poller()
})

// also initialise polling when the extension starts up after a browser restart
chrome.runtime.onStartup.addListener(() => {
    init_rss_poller().catch(err =>
        console.error("Failed to init RSS poller on startup", err)
    )
})

// ensure polling is scheduled whenever the service worker loads
init_rss_poller().catch(err =>
    console.error("Failed to initialise RSS poller", err)
)

// Helper to promisify chrome.storage.sync.get for settings
const get_stored_settings = (): Promise<Settings | undefined> =>
    new Promise(resolve => {
        chrome.storage.sync.get("settings", result => {
            resolve(result.settings as Settings | undefined)
        })
    })

// listen for tab updates, and inject content script if conditions are met
chrome.tabs.onUpdated.addListener(async (tab_id, _, tab) => {
    // if (change_info.status !== "complete" || !tab.url) return
    if (!tab.url) return

    const current_tab_url = tab.url
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
})
