import { RevisionData } from "../../types/rev_history"
import { diffChars } from "diff"

export async function calculate_new_metrics(old_data: RevisionData, new_data: RevisionData) {
    let added_chars = 0
    let removed_chars = 0
    let unchanged_chars = 0

    const changes = diffChars(old_data.content.toLowerCase(), new_data.content.toLowerCase())

    for (const part of changes) {
        if (part.added) {
            added_chars += part.count || 0
        } else if (part.removed) {
            removed_chars += part.count || 0
        } else {
            unchanged_chars += part.count || 0
        }
    }

    // A "modification" at the character level isn't a standard metric,
    // it's usually just represented as a removal followed by an addition.
    return { added_chars, removed_chars, unchanged_chars }
}
