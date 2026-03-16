import { RevisionData, RevisionHistoryEntry } from "../../types/rev_history"
import { get_storage_key } from "./common"

export async function add_revision_to_history(
    parent_guid: string,
    revision: RevisionData,
    timestamp: number
): Promise<RevisionHistoryEntry> {
    const uuid = crypto.randomUUID()
    const item_name = get_storage_key(uuid)

    const data_object: RevisionHistoryEntry = {
        rev_id: uuid,
        parent_guid,
        update_timestamp: timestamp,
        data: revision,
    }
    await chrome.storage.local.set({ [item_name]: data_object })

    return data_object
}
