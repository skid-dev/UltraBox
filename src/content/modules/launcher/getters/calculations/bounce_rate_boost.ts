import { IndexedItem } from "../../../../../types/indexed_item"

const MAX_BOUNCE_RATE_BOOST = 0.15

export function get_bounce_rate_boost(item: IndexedItem): number {
    if (!item.item.view_count || item.item.bounce_count === undefined) return 0

    const views = Math.max(item.item.view_count ?? 0, 0)
    const bounces = Math.max(item.item.bounce_count ?? 0, 0)

    if (views === 0) return 0

    const bounce_rate = Math.min(1, bounces / views) // 0..1
    const engagement_score = 1 - bounce_rate // higher is better
    const confidence = 1 - Math.exp(-views / 25) // reduces noise from low sample size

    return MAX_BOUNCE_RATE_BOOST * engagement_score * confidence * 2
}