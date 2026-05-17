import { Settings } from "../types/settings"

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
