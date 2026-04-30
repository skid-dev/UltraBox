import { Module } from "../../../types/module"
    
export default <Module>{
    action: async (base) => {
        await chrome.scripting.executeScript({
            target: { tabId: base.tab_id },
            files: ["detect_schooltape.js"],
        })
    },
}
