import Fuse from "fuse.js"
import * as get_storage from "../../storage/get"
import { IndexedItem } from "../../types/indexed_item"
import { display_results } from "./display_results"

// get all the available channels
let items_index: IndexedItem[] = []
let fuse: Fuse<IndexedItem>
let active_result_index = -1

const RECENCY_DECAY_MS = 1000 * 60 * 60 * 24 * 3 // recency advantage fades over ~3 days
const MAX_RECENCY_BOOST = 0.15

function get_recency_boost(updated_at?: number): number {
    if (!updated_at) return 0

    const age_ms = Date.now() - updated_at
    if (age_ms <= 0) {
        return MAX_RECENCY_BOOST
    }

    const decay = Math.exp(-age_ms / RECENCY_DECAY_MS)
    return MAX_RECENCY_BOOST * decay
}

export async function get_news_channels(): Promise<void> {
    let all_channels = await get_storage.get_all_news_channels()
    console.log("Indexing channels", all_channels)
    for (let channel of all_channels) {
        let items = await get_storage.get_news_channel(channel)
        console.log("Channel", channel, "has", items.length, "items")
        items_index = items_index.concat(
            items.map(item => {
                return {
                    parent_channel: channel,
                    item: item,
                }
            })
        )
    }

    fuse = new Fuse(items_index, {
        keys: ["item.title", "item.content"],
        ignoreDiacritics: true,
        useExtendedSearch: true,
        includeScore: true,
    })
}

function filter_results(search_term: string, results: IndexedItem[]): IndexedItem[] {
    const first_char = search_term.charAt(0).toLowerCase()

    if (first_char === ".") {
        results = results.filter(result => {
            return result.parent_channel === "classes"
        })
    } else if (first_char === "/") {
        results = results.filter(result => {
            return result.parent_channel === "bob"
        })
    } else if (first_char === "!") {
        results = results.filter(result => {
            return result.parent_channel === "news"
        })
    }

    return results
}

function process_search_term(search_term: string): [string, string] {
    // if the first character is a dot, remove it
    if (search_term.charAt(0) === ".") {
        return ["Search for subjects only", search_term.slice(1).trim()]
    } else if (search_term.charAt(0) === "/") {
        return ["Searching for textbooks only", search_term.slice(1).trim()]
    } else if (search_term.charAt(0) === "!") {
        return ["Searching for news items only", search_term.slice(1).trim()]
    }

    return ["", search_term.trim()]
}

function get_result_items(): HTMLElement[] {
    const results_div = document.getElementById("schoolbox-launcher-results")

    if (!results_div) return []

    return Array.from(results_div.getElementsByClassName("ultrabox-launcher-item-parent")) as HTMLElement[]
}

function clear_active_result(): void {
    get_result_items().forEach(item => {
        item.classList.remove("ultrabox-launcher-item-active")
        item.removeAttribute("aria-selected")
    })

    active_result_index = -1
}

function set_active_result(index: number): void {
    const items = get_result_items()

    if (items.length === 0) {
        active_result_index = -1
        return
    }

    const normalized_index = ((index % items.length) + items.length) % items.length

    items.forEach((item, current_index) => {
        if (current_index === normalized_index) {
            item.classList.add("ultrabox-launcher-item-active")
            item.setAttribute("aria-selected", "true")
        } else {
            item.classList.remove("ultrabox-launcher-item-active")
            item.removeAttribute("aria-selected")
        }
    })

    active_result_index = normalized_index
}

function move_active_result(delta: number): boolean {
    const items = get_result_items()

    if (items.length === 0) {
        clear_active_result()
        return false
    }

    if (active_result_index === -1) {
        set_active_result(delta > 0 ? 0 : items.length - 1)
    } else {
        set_active_result(active_result_index + delta)
    }

    return true
}

function get_active_result_link(): HTMLAnchorElement | null {
    const items = get_result_items()
    const current_item =
        active_result_index >= 0 && active_result_index < items.length
            ? items[active_result_index]
            : items[0]

    return (current_item?.querySelector("a") as HTMLAnchorElement | null) ?? null
}

export async function on_input(ev: Event): Promise<void> {
    const input_text = (ev.target as HTMLInputElement).value

    const parent_div = document.getElementById("schoolbox-launcher-results")
    const results_wrapper_div = document.getElementById("schoolbox-launcher-results-wrapper")

    if (!parent_div || !results_wrapper_div) return

    if (!input_text) {
        results_wrapper_div.style.display = "none"
        clear_active_result()
        return
    }

    let [search_filter_text, processed_search_term] = process_search_term(input_text)

    if (!processed_search_term) {
        if (search_filter_text.length > 0) {
            parent_div.innerText = search_filter_text
            results_wrapper_div.style.display = "block"
        } else {
            results_wrapper_div.style.display = "none"
        }
        clear_active_result()
        return
    }

    let results = fuse.search(processed_search_term)

    let weighted_results = results
        .map(result => {
            const base_score = result.score ?? 0
            const recency_boost = get_recency_boost(result.item.item.updated_at)

            return {
                entry: result.item,
                score: base_score - recency_boost,
            }
        })
        .sort((a, b) => a.score - b.score)
        .map(result => result.entry)

    let filtered_results = filter_results(input_text, weighted_results).slice(0, 5)

    console.log("Search results", {
        raw: results,
        weighted: weighted_results,
    })

    await display_results(parent_div, filtered_results)
    results_wrapper_div.style.display = "block"

    if (filtered_results.length > 0) {
        set_active_result(0)
    } else {
        clear_active_result()
    }
}

export function on_keydown(ev: KeyboardEvent): void {
    const results_wrapper_div = document.getElementById("schoolbox-launcher-results-wrapper")

    if (ev.key === "Escape") {
        if (results_wrapper_div) {
            results_wrapper_div.style.display = "none"
        }
        clear_active_result()
        return
    }

    if (ev.key === "ArrowDown") {
        if (move_active_result(1)) {
            ev.preventDefault()
        }
    } else if (ev.key === "ArrowUp") {
        if (move_active_result(-1)) {
            ev.preventDefault()
        }
    } else if (ev.key === "Tab") {
        const direction = ev.shiftKey ? -1 : 1
        if (move_active_result(direction)) {
            ev.preventDefault()
        }
    } else if (ev.key === "Enter") {
        const target_link = get_active_result_link()
        if (target_link) {
            ev.preventDefault()
            target_link.click()
        }
    }
}
