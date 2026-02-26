import { Module } from "../../../types/module"

export default <Module>{
    setting: async s => {
        return true
    },
    condition: async (tab_id, tab, settings) => {
        const tab_url = tab.url

        if (!tab_url) return false
        if (!tab_url.includes(".boxofbooks.io/reader/page/bookbox")) return false

        return true
    },
    action: async (tab_id, tab, settings) => {
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            files: ["get_textbooks.js"],
        })
    },
}
