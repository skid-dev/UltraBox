import { Module } from "../.../../../../types/module"
import { extract_hostnames } from "../../functions/extract_hostname"

export default <Module>{
    setting: async s => {
        return !!s.launcher_module && !!s.launcher_module_shortcut
    },
    condition: async (tab_id, tab, settings) => {
        const { current_domain, main_domain_hostname, is_homepage } = extract_hostnames(
            tab.url!,
            settings.main_domain
        )

        if (!tab.url) return false

        // box of books
        if (tab.url.includes(".boxofbooks.io/book/")) return true

        if (!main_domain_hostname || !current_domain?.includes(main_domain_hostname)) {
            return false
        }

        if (is_homepage) return false
        return true
    },
    action: async (tab_id, tab, settings) => {
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            files: ["launcher_shortcut.js"],
        })
        await chrome.scripting.insertCSS({
            target: { tabId: tab_id },
            files: ["launcher_styles.css"],
        })
    },
}
