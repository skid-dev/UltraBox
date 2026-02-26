import { Module } from "../.../../../../types/module"
import { extract_hostnames } from "../../functions/extract_hostname"

export default <Module>{
    setting: async (s) => {
        return !!s.inject_css
    },
    condition: async (tab_id, tab, settings) => {
        const { current_domain, main_domain_hostname } = extract_hostnames(
            tab.url!,
            settings.main_domain
        )

        if (!main_domain_hostname || !current_domain?.includes(main_domain_hostname)) {
            return false
        }
        return true
    },
    action: async (tab_id, tab, settings) => {
        await chrome.scripting.insertCSS({
            target: { tabId: tab_id },
            files: ["inject.css"],
        })
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            files: ["inject_css_tools.js"],
        })
    },
}
