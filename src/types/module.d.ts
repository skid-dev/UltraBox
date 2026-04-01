import { Settings } from "./settings"

/**
 * Represents a module that can be integrated into UltraBox.
 *
 * @interface Module
 *
 * @property {Function} [setting] - Validates and applies module settings.
 * @param {Partial<Settings>} s - The settings object to validate.
 * @returns {boolean | Promise<boolean>} True if settings are valid and applied successfully, false otherwise.
 *
 * @property {Function} [condition] - Determines whether the module should execute for a given tab.
 * @param {number} tab_id - The Chrome tab ID.
 * @param {chrome.tabs.Tab} tab - The Chrome tab object containing tab metadata.
 * @param {Partial<Settings>} settings - The current module settings.
 * @param {Function} is_page - Helper function to check if a URL matches certain criteria.
 * @param {string} url - The URL to check.
 * @returns {boolean | Promise<boolean>} True if the condition is met and module should run, false otherwise.
 *
 * @property {Function} action - Executes the main module logic.
 * @param {number} tab_id - The Chrome tab ID.
 * @param {chrome.tabs.Tab} tab - The Chrome tab object containing tab metadata.
 * @param {Partial<Settings>} settings - The current module settings.
 * @returns {void | Promise<void>} No return value, or a promise that resolves when the action completes.
 */

interface Base {
    tab_id: number
    tab: chrome.tabs.Tab
}

interface HelperFunctions {
    is_page: (url: string) => Promise<boolean>
    is_schoolbox_page: boolean
    url_begins_with: (prefix: string) => Promise<boolean>
}

export interface Module {
    setting?: (s: Partial<Settings>) => boolean | Promise<boolean>
    condition?: (
        base: Base,
        settings: Partial<Settings>,
        helper_fns: HelperFunctions
    ) => boolean | Promise<boolean>
    action: (
        base: Base,
        settings: Partial<Settings>,
        helper_fns: HelperFunctions
    ) => void | Promise<void>
}
