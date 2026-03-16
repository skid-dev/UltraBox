import { Module } from "../../../types/module"
import { poll_feed } from "../../pull_feed"

export default <Module>{
    setting: s => {
        return !!s.record_post_history
    },
    action: async (tab_id, tab, settings) => {
        await poll_feed()
    },
}
