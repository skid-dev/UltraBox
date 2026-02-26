const RECENCY_DECAY_MS = 1000 * 60 * 60 * 24 * 3 // recency advantage fades over ~3 days
const MAX_RECENCY_BOOST = 0.15

export function get_recency_boost(updated_at?: number): number {
    if (!updated_at) return 0

    const age_ms = Date.now() - updated_at
    if (age_ms <= 0) {
        return MAX_RECENCY_BOOST
    }

    const decay = Math.exp(-age_ms / RECENCY_DECAY_MS)
    return MAX_RECENCY_BOOST * decay
}
