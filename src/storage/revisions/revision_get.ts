import { RevisionHistoryEntry } from "../../types/rev_history"
import { get_storage_key } from "./common"

export async function get_revision(rev_id: string): Promise<RevisionHistoryEntry | null> {
    const item_name = get_storage_key(rev_id)
    const result = await chrome.storage.local.get([item_name])
    return result[item_name] as RevisionHistoryEntry || null
}
