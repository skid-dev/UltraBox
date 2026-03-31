import { Module } from "../.../../../../types/module"
import { extract_hostnames } from "../../functions/extract_hostname"

export default <Module> {
    setting: s => {
        return !!s.news_search_module
    },
    condition: async (_tab_id, _tab, _settings, is_page) => {
        return is_page("/")
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
