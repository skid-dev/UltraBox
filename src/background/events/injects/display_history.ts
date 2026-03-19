import { Module } from "../../../types/module";

export default <Module> {
    setting: s => {
        return !!s.recents_list_module
    },
    condition: async (tab_id, tab, settings, is_page) => {
       return (await is_page("/news/"))
    },
    action: async (tab_id, tab, settings) => {
        await chrome.scripting.executeScript({
            target: {tabId: tab_id},
            files: ["display_history.js"]
        })

        await chrome.scripting.insertCSS({
            target: {tabId: tab_id},
            files: ["news_history.css"]
        })
    }
}