import { RevisionData, RevisionHistoryEntry } from "../../types/rev_history"
import { get_storage_key } from "./common"
import * as get_storage from "../get"
import * as set_storage from "../set"

export async function add_revision_to_history(
    parent_guid: string,
    prev_revision: RevisionData,
    timestamp: number,
    diff_add: number,
    diff_modify: number,
    diff_delete: number
): Promise<RevisionHistoryEntry> {
    const uuid = crypto.randomUUID()
    const item_name = get_storage_key(uuid)

    const data_object: RevisionHistoryEntry = {
        rev_id: uuid,
        parent_guid,
        update_timestamp: timestamp,
        data: prev_revision,

        diff_new_size: diff_add,
        diff_modified_size: diff_modify,
        diff_delete_size: diff_delete
    }
    await chrome.storage.local.set({ [item_name]: data_object })

    return data_object
}

export async function remove_null_revisions(item_guid: string): Promise<boolean> {
    const item = await get_storage.get_news_item("news", item_guid)
    if (!item) {
        return false
    }

    const filtered_uuids: string[] = []
    for (const uuid of item.rev_history_uuids ?? []) {
        const rev_key = get_storage_key(uuid)
        const rev_data = await chrome.storage.local.get(rev_key)

        if (rev_data[rev_key] !== null && rev_data[rev_key] !== undefined) {
            filtered_uuids.push(uuid)
        }
    }
    item.rev_history_uuids = filtered_uuids

    await set_storage.update_item_properties("news", item_guid, {
        rev_history_uuids: item.rev_history_uuids
    })
    return true
}
