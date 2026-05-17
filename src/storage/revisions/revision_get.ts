import { RevisionHistoryEntry } from "../../types/rev_history"
import { get_revision_entry } from "../items"

export async function get_revision(rev_id: string): Promise<RevisionHistoryEntry | null> {
    return await get_revision_entry(rev_id)
}
