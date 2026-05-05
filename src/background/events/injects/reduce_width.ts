import { Module } from "../../../types/module"

export default <Module>{
    setting: s => {
        return s.reduce_content_width
    },
    condition: (_base, _settings, helper_fns) => {
        return helper_fns.is_schoolbox_page
    },
    action: async base => {
        await chrome.scripting.insertCSS({
            target: { tabId: base.tab_id },
            files: ["reduce_width.css"],
        })
    },
}
