import { Module } from "../../../types/module"
    
export default <Module>{
    setting: s => {
        return !!s.record_post_history
    },
    action: async (tab_id, tab, settings) => {
        console.log("[News history] Fetching for changes to news posts...")
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            files: ["history_puller.ts"],
        })
    },
}
