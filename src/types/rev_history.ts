export interface RevisionHistoryEntry {
    rev_id: string

    // parent item data (same for all revisions of the same item)
    parent_guid: string

    // unique revision data for this specific revision
    update_timestamp: number
    data: RevisionData
}

export interface RevisionData {
    title: string
    content: string
}