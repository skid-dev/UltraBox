import { Module } from "../../../types/module";

export default <Module> {
    setting: s => {
        return !!s.recents_list_module
    },
    condition: async (base, settings, helper_fns) => {
       return (await helper_fns.url_begins_with("/news"))
    },
    action: async (base, settings, helper_fns) => {
        await chrome.scripting.executeScript({
            target: {tabId: base.tab_id},
            files: ["display_history.js"]
        })

        await chrome.scripting.insertCSS({
            target: {tabId: base.tab_id},
            files: ["news_history.css"]
        })

        if (settings.schooltape_compatibility) {
            await chrome.scripting.insertCSS({
                target: {tabId: base.tab_id},
                files: ["schooltape/post_history_styles.css"]
            })
        }
    }
}