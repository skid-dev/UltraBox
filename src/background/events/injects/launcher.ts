import { Module } from "../.../../../../types/module"
import { extract_hostnames } from "../../functions/extract_hostname"

export default <Module>{
    setting: async (s) => {
        return !!s.launcher_module
    },
    condition: async (tab_id, tab, settings, is_page) => {
        return is_page("/")
    },
    action: async (tab_id, tab, settings) => {
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            files: ["content.js"],
        })
        await chrome.scripting.insertCSS({
            target: { tabId: tab_id },
            files: ["launcher_styles.css"],
        })
    },
}
