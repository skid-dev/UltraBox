import Fuse from "fuse.js"
import * as get_storage from "../../../storage/get"
import { IndexedItem } from "../../../types/indexed_item"
import { display_results } from "./display_results"

// score adjustment functions
import { get_recency_boost } from "./getters/calculations/recency"
import { get_bounce_rate_boost } from "./getters/calculations/bounce_rate_boost"
import { get_textbook_headings } from "./get_textbook_headings"

// get all the available channels
let items_index: IndexedItem[] = []
let fuse: Fuse<IndexedItem>
let active_result_index = -1
let is_bob = window.location.href.includes(".boxofbooks.io/book/")

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

    if (is_bob) {
        let headings = await get_textbook_headings()
        console.log("Adding textbook headings to index", headings)
        items_index = items_index.concat(headings)
    }

    fuse = new Fuse(items_index, {
        keys: ["item.title", "item.content"],
        ignoreDiacritics: true,
        useExtendedSearch: true,
        includeScore: true,
        includeMatches: true,
    })
}

function is_valid_result(search_term: string, result: IndexedItem): boolean {
    const first_char = search_term.charAt(0).toLowerCase()

    if (first_char === ".") {
        return result.parent_channel === "classes"
    } else if (first_char === "/") {
        return result.parent_channel === "bob"
    } else if (first_char === "!") {
        return result.parent_channel === "news"
    } else if (first_char === ":") {
        return result.parent_channel === "this_textbook"
    }

    return true
}

function process_search_term(search_term: string): [string, string] {
    // if the first character is a dot, remove it
    if (search_term.charAt(0) === ".") {
        return ["Search for subjects only", search_term.slice(1).trim()]
    } else if (search_term.charAt(0) === "/") {
        return ["Searching for textbooks only", search_term.slice(1).trim()]
    } else if (search_term.charAt(0) === "!") {
        return ["Searching for news items only", search_term.slice(1).trim()]
    } else if (search_term.charAt(0) === ":") {
        return ["Searching for headings in this textbook", search_term.slice(1).trim()]
    }

    return ["", search_term.trim()]
}

function get_result_items(): HTMLElement[] {
    const results_div = document.getElementById("schoolbox-launcher-results")

    if (!results_div) return []

    return Array.from(
        results_div.getElementsByClassName("ultrabox-launcher-item-parent")
    ) as HTMLElement[]
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

function get_textbook_iframe_doc(): Document | null {
    const web_viewer: HTMLIFrameElement | null = document.getElementById(
        "webviewer-1"
    ) as HTMLIFrameElement
    if (!web_viewer) {
        return null
    }
    const web_doc = web_viewer.contentDocument || web_viewer.contentWindow?.document
    if (!web_doc) {
        return null
    }

    return web_doc
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
        .filter(result => is_valid_result(input_text, result.item))
        .map(result => {
            const base_score = result.score ?? 0
            const recency_boost = get_recency_boost(
                result.item.item.last_viewed || result.item.item.updated_at
            )
            const bounce_rate_boost = get_bounce_rate_boost(result.item)

            return {
                entry: result.item,
                score: base_score - recency_boost - bounce_rate_boost,
                matches: result.matches,
            }
        })
        .sort((a, b) => a.score - b.score)
        .map(result => {
            return {
                item: result.entry,
                matches: result.matches,
            }
        })

    let filtered_results = weighted_results.slice(0, 8)

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

        if (target_link?.getAttribute("data-heading-name")) {
            const web_doc = get_textbook_iframe_doc()

            if (!web_doc) {
                return
            }

            // find button
            const heading_text = target_link.getAttribute("data-heading-name")
            const heading_elements = Array.from(
                web_doc.querySelectorAll(`.row button.contentButton`)
            ).filter(
                el => el.querySelector("span")?.textContent === heading_text
            ) as HTMLButtonElement[]

            console.log("Navigating to textbook chapter", heading_text, heading_elements)

            if (heading_elements.length > 0) {
                heading_elements[0].click()

                // close launcher
                document.getElementById("ultrabox-launcher-background-div")!.style.display = "none"
            }
        }

        if (target_link) {
            ev.preventDefault()
            target_link.click()
        }
    }
}
