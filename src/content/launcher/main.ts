import Fuse from "fuse.js"
import * as get_storage from "../../storage/get"
import { IndexedItem } from "../../types/indexed_item"
import { display_results } from "./display_results"

// get all the available channels
let items_index: IndexedItem[] = []
let fuse: Fuse<IndexedItem>

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
    }

    return results
}

function process_search_term(search_term: string): [string, string] {
    // if the first character is a dot, remove it
    if (search_term.charAt(0) === ".") {
        return ["Search for subjects only", search_term.slice(1).trim()]
    }

    return ["", search_term.trim()]
}

export function on_input(ev: Event): void {
    const input_text = (ev.target as HTMLInputElement).value

    const parent_div = document.getElementById("schoolbox-launcher-results")
    const results_wrapper_div = document.getElementById("schoolbox-launcher-results-wrapper")

    if (!parent_div || !results_wrapper_div) return

    if (!input_text) {
        results_wrapper_div.style.display = "none"
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
        return
    }

    let results = fuse.search(processed_search_term)

    let filtered_results = filter_results(
        input_text,
        results.map(result => result.item)
    ).slice(0, 5)

    console.log("Search results", results)

    display_results(parent_div, filtered_results)
    results_wrapper_div.style.display = "block"
}

export function on_keydown(ev: KeyboardEvent): void {
    const results_wrapper_div = document.getElementById("schoolbox-launcher-results-wrapper")
    const results_div = document.getElementById("schoolbox-launcher-results")

    if (ev.key === "Escape") {
        if (results_wrapper_div) {
            results_wrapper_div.style.display = "none"
        }
    } else if (ev.key === "Enter") {
        // click on the first link in parent_div
        let first_link = results_div?.getElementsByTagName("a")[0]
        if (first_link) {
            first_link.click()
        }
    }
}
