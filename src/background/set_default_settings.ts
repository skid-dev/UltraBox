import { Settings } from "../types/settings"
import { settings_item } from "../storage/items"
import { poll_feed } from "./pull_feed"

// set_setting was moved to ./set_setting so content-script entrypoints
// can import it without pulling in poll_feed / fast-xml-parser.
export { set_setting } from "./set_setting"

export async function init_settings(): Promise<void> {
    const current_settings = await settings_item.getValue()

    if (current_settings) {
        // settings already exist, no need to set defaults
        await poll_feed()
        return
    }

    const initial_settings: Settings = {
        // settings
        main_domain: "",
        news_rss_feed: "",
        inject_css: false,
        schooltape_compatibility: true,

        // modules
        launcher_module: true,
        launcher_module_shortcut: true,
        reduce_timetable_width: false,

        news_search_module: true,

        recents_list_module: true,
        record_post_history: true,
        record_setting_active: false,
    }
    await settings_item.setValue(initial_settings)

    await poll_feed()
}
