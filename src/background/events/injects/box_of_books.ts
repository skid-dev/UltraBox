import { Module } from "../../../types/module"

export default <Module>{
    setting: async s => {
        return true
    },
    condition: async (base) => {
        const tab_url = base.tab.url

        if (!tab_url) return false
        if (!tab_url.includes(".boxofbooks.io/reader/page/bookbox")) return false

        return true
    },
    action: async (base) => {
        await chrome.scripting.executeScript({
            target: { tabId: base.tab_id },
            files: ["get_textbooks.js"],
        })
    },
}
