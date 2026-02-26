export interface RecentsEntry {
    url: string
    title: string
    viewed_count: number
    last_viewed_timestamp: number // unix epoch ms
}

export interface TimeFrequency {
    day_of_week: number
    often_view_start_time_s: number
    often_view_end_time_s: number
}
