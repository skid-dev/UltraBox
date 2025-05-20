import { Settings } from "../types/settings"
import { poll_feed } from "./pull_feed"

export async function init_settings(): Promise<void> {
    let current_settings = await chrome.storage.sync.get("settings")

    if (current_settings.settings) {
        // settings already exist, no need to set defaults
        await poll_feed()
        return
    }

    const initial_settings: Settings = {
        main_domain: "",
        inject_css: false,
        launcher_module: true,
        rss_feed_pull_interval: 10,
        news_rss_feed: "",
    }
    await chrome.storage.sync.set({ settings: initial_settings })

    await poll_feed()
}
