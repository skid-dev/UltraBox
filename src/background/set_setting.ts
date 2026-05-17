import { Settings } from "../types/settings"
import { settings_item } from "../storage/items"

export async function set_setting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
): Promise<void> {
    const current_settings = await settings_item.getValue()
    if (!current_settings) {
        console.error("Settings not initialized yet.")
        return
    }

    await settings_item.setValue({
        ...current_settings,
        [key]: value,
    })
}
