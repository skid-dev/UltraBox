import { Module } from "../../../types/module"

// reduce_width.css is declared as a manifest-level content_script (see
// wxt.config.ts) and is always present on matching pages. Its rules are
// scoped to body.ultrabox-reduce-content-width, so this module enables
// the styling by setting that class on schoolbox pages.
export default <Module>{
    setting: s => {
        return s.reduce_content_width
    },
    condition: (_base, _settings, helper_fns) => {
        return helper_fns.is_schoolbox_page
    },
    action: async base => {
        await chrome.scripting.executeScript({
            target: { tabId: base.tab_id },
            func: () => {
                document.body.classList.add("ultrabox-reduce-content-width")
            },
        })
    },
}
