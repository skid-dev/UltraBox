export interface RevisionHistoryEntry {
    rev_id: string

    // parent item data (same for all revisions of the same item)
    parent_guid: string

    // unique revision data for this specific revision
    update_timestamp: number

    diff_new_size: number
    diff_modified_size: number
    diff_delete_size: number

    data: RevisionData
}

export interface RevisionData {
    title: string
    content: string
}