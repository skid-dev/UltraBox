import { Module } from "../.../../../../types/module"
import { extract_hostnames } from "../../functions/extract_hostname"

export default <Module>{
    setting: async s => {
        return !!s.launcher_module && !!s.launcher_module_shortcut
    },
    condition: async (base, settings) => {
        const { current_domain, main_domain_hostname, is_homepage } = extract_hostnames(
            base.tab.url!,
            settings.main_domain
        )

        if (!base.tab.url) return false

        // box of books
        if (base.tab.url.includes(".boxofbooks.io/book/")) return true

        if (!main_domain_hostname || !current_domain?.includes(main_domain_hostname)) {
            return false
        }

        if (is_homepage) return false
        return true
    },
    action: async (base, settings, helper_fns) => {
        await chrome.scripting.executeScript({
            target: { tabId: base.tab_id },
            files: ["launcher_shortcut.js"],
        })
        await chrome.scripting.insertCSS({
            target: { tabId: base.tab_id },
            files: ["launcher_styles.css"],
        })

        if (settings.schooltape_compatibility && helper_fns.is_schoolbox_page) {
            await chrome.scripting.insertCSS({
                target: { tabId: base.tab_id },
                files: ["schooltape/launcher_styles.css"],
            })
        }
    },
}
