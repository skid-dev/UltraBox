import { Module } from "../../../types/module"
    
export default <Module>{
    setting: s => {
        return !!s.record_post_history
    },
    action: async (base) => {
        await chrome.scripting.executeScript({
            target: { tabId: base.tab_id },
            files: ["history_puller.js"],
        })
    },
}
