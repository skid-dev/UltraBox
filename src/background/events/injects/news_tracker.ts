import { Module } from "../../../types/module"
import { poll_feed } from "../../pull_feed"

export default <Module>{
    setting: s => {
        return !!s.record_post_history
    },
    action: async (tab_id, tab, settings) => {
        console.log("[News history] Fetching for changes to news posts...")
        await poll_feed()
    },
}
