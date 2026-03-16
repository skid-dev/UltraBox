import { Module } from "../../../types/module";

export default <Module> {
    setting: s => {
        return !!s.recents_list_module
    },
    condition: (tab_id, tab, settings) => {
        
    },
    action: async (tab_id, tab, settings) => {

    }
}