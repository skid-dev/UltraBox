import { Module } from "../.../../../../types/module"
import { extract_hostnames } from "../../functions/extract_hostname"

export default {
    setting: s => {
        return !!s.news_search_module
    },
    condition: async (tab_id, tab, settings) => {
        const { current_domain, main_domain_hostname, is_homepage } = extract_hostnames(
            tab.url!,
            settings.main_domain
        )

        if (!main_domain_hostname || !current_domain?.includes(main_domain_hostname)) {
            return false
        }

        if (!is_homepage) return false
        return true
    },
    action: async (tab_id, _tab, _settings) => {
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            files: ["news_search_main.js"],
        })

        await chrome.scripting.insertCSS({
            target: { tabId: tab_id },
            files: ["news_search_styles.css"],
        })
    },
} satisfies Module
