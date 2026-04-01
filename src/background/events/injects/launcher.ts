import { Module } from "../.../../../../types/module"

export default <Module>{
    setting: async (s) => {
        return !!s.launcher_module
    },
    condition: async (_base, _settings, helper_fns) => {
        return helper_fns.is_page("/")
    },
    action: async (base, settings) => {
        await chrome.scripting.executeScript({
            target: { tabId: base.tab_id },
            files: ["content.js"],
        })
        await chrome.scripting.insertCSS({
            target: { tabId: base.tab_id },
            files: ["launcher_styles.css"],
        })

        if (settings.schooltape_compatibility) {
            await chrome.scripting.insertCSS({
                target: { tabId: base.tab_id },
                files: ["schooltape/launcher_styles.css"],
            })
        }
    },
}
