import { Settings } from "./settings"

export interface Module {
    setting?: (s: Partial<Settings>) => boolean | Promise<boolean>
    condition?: (
        tab_id: number,
        tab: chrome.tabs.Tab,
        settings: Partial<Settings>
    ) => boolean | Promise<boolean>
    action: (
        tab_id: number,
        tab: chrome.tabs.Tab,
        settings: Partial<Settings>
    ) => void | Promise<void>
}
