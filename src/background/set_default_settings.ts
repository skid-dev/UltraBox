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
        // settings
        main_domain: "",
        news_rss_feed: "",
        inject_css: false,
        schooltape_compatibility: true,

        // modules
        launcher_module: true,
        launcher_module_shortcut: true,
        reduce_timetable_width: false,

        news_search_module: true,

        recents_list_module: true,
        record_post_history: true,
        record_setting_active: false,
    }
    await chrome.storage.sync.set({ settings: initial_settings })

    await poll_feed()
}

export async function set_setting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
): Promise<void> {
    const current_settings = await chrome.storage.sync.get("settings")
    if (!current_settings.settings) {
        console.error("Settings not initialized yet.")
        return
    }

    const new_settings = {
        ...current_settings.settings,
        [key]: value,
    }
    await chrome.storage.sync.set({ settings: new_settings })
}
