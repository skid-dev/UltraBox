import { Module } from "../.../../../../types/module"
import { extract_hostnames } from "../../functions/extract_hostname"

export default <Module> {
    setting: s => {
        return !!s.news_search_module
    },
    condition: async (_base, _settings, helper_fns) => {
        return helper_fns.is_page("/")
    },
    action: async (base, settings) => {
        await chrome.scripting.executeScript({
            target: { tabId: base.tab_id },
            files: ["news_search_main.js"],
        })

        await chrome.scripting.insertCSS({
            target: { tabId: base.tab_id },
            files: ["news_search_styles.css"],
        })

        if (settings.schooltape_compatibility) {
            await chrome.scripting.insertCSS({
                target: { tabId: base.tab_id },
                files: ["schooltape/news_search_styles.css"],
            })
        }
    },
} satisfies Module
