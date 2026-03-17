import type { FuseResultMatch } from "fuse.js"
import { IndexedItem } from "../../../types/indexed_item"
import { lighten } from "../../functions/lighten"
import { darken } from "../../functions/darken"
import { Settings } from "../../../types/settings"

export interface LauncherSearchResult {
    item: IndexedItem
    matches?: ReadonlyArray<FuseResultMatch>
}

// Helper to promisify chrome.storage.sync.get for settings
const get_stored_settings = (): Promise<Settings | undefined> =>
    new Promise(resolve => {
        chrome.storage.sync.get("settings", result => {
            resolve(result.settings as Settings | undefined)
        })
    })

function normalize_match_ranges(
    indices: ReadonlyArray<readonly [number, number]>,
    text_length: number
): ReadonlyArray<readonly [number, number]> {
    if (text_length === 0 || indices.length === 0) {
        return []
    }

    const sorted_ranges = indices
        .map(([start, end]) => [Math.max(0, start), Math.min(end, text_length - 1)] as [number, number])
        .filter(([start, end]) => start <= end)
        .sort((a, b) => a[0] - b[0] || a[1] - b[1])

    if (sorted_ranges.length === 0) {
        return []
    }

    const merged_ranges: [number, number][] = [sorted_ranges[0]]

    for (const [start, end] of sorted_ranges.slice(1)) {
        const current_range = merged_ranges[merged_ranges.length - 1]

        if (start <= current_range[1] + 1) {
            current_range[1] = Math.max(current_range[1], end)
            continue
        }

        merged_ranges.push([start, end])
    }

    return merged_ranges
}

function append_matched_text(
    container: HTMLElement,
    text: string,
    indices: ReadonlyArray<readonly [number, number]>
): void {
    const normalized_ranges = normalize_match_ranges(indices, text.length)

    if (normalized_ranges.length === 0) {
        container.innerText = text
        return
    }

    let current_index = 0

    for (const [start, end] of normalized_ranges) {
        if (start > current_index) {
            container.appendChild(document.createTextNode(text.slice(current_index, start)))
        }

        const matched_text = document.createElement("strong")
        matched_text.classList.add("ultrabox-launcher-match")
        matched_text.innerText = text.slice(start, end + 1)
        container.appendChild(matched_text)

        current_index = end + 1
    }

    if (current_index < text.length) {
        container.appendChild(document.createTextNode(text.slice(current_index)))
    }
}

function get_match_ranges(
    result: LauncherSearchResult,
    key_name: "item.title" | "item.content"
): ReadonlyArray<readonly [number, number]> {
    const match = result.matches?.find(entry => entry.key === key_name)
    return match?.indices ?? []
}

export async function display_results(
    parent_div: HTMLElement,
    results: LauncherSearchResult[]
): Promise<void> {
    const stored_settings = await get_stored_settings()
    const is_dark_mode = stored_settings?.inject_css ?? false

    parent_div.innerHTML = ""

    for (let result of results) {
        let item_parent = document.createElement("div")
        item_parent.classList.add("ultrabox-launcher-item-parent")

        if (result.item.item.colour) {
            if (is_dark_mode) {
                item_parent.style.backgroundColor = darken(result.item.item.colour, 0.8)
            } else {
                item_parent.style.backgroundColor = lighten(result.item.item.colour, 0.8)
            }
        }

        // item image
        if (result.item.parent_channel !== "news") {
            let item_image = document.createElement("div")
            item_image.classList.add("ultrabox-launcher-item-placeholder-image")
            item_image.style.backgroundColor = result.item.item.colour || "#a8caff"
            item_image.innerText = result.item.item.title[0].toUpperCase()

            item_parent.appendChild(item_image)
        } else {
            let item_image = document.createElement("img")
            item_image.classList.add("ultrabox-launcher-item-image")
            item_image.src = result.item.item.image_uri || ""
            item_image.onerror = () => {
                item_image.onerror = null
                item_image.src = "/images/logo.php?logo=skin_logo_square&size=normal"
            }

            item_parent.appendChild(item_image)
        }

        let item_details_container = document.createElement("div")
        item_details_container.classList.add("ultrabox-launcher-item-details-container")

        // title and parent channel
        let item_title = document.createElement("div")
        item_title.classList.add("ultrabox-launcher-item-title")

        let item_channel = document.createElement("div")
        item_channel.classList.add("ultrabox-launcher-item-channel")
        item_channel.innerText = result.item.item.parent + " / "
        item_title.appendChild(item_channel)

        let item_title_link = document.createElement("a")
        let link = null
        if (result.item.parent_channel !== "this_textbook") {
            link = new URL(result.item.item.link)
            link.searchParams.set("ub_ref", "launcher")
            item_title_link.href = link.toString()
        } else {
            item_title_link.setAttribute("data-heading-name", result.item.item.title)
        }

        append_matched_text(
            item_title_link,
            result.item.item.title,
            get_match_ranges(result, "item.title")
        )
        item_title.appendChild(item_title_link)

        item_details_container.appendChild(item_title)

        // content preview
        let item_content = document.createElement("div")
        item_content.classList.add("ultrabox-launcher-item-content")
        const content_preview = result.item.item.content.slice(0, 200)
        const content_ranges = get_match_ranges(result, "item.content")
            .map(([start, end]) => [start, Math.min(end, content_preview.length - 1)] as const)
            .filter(([start, end]) => start <= end)

        append_matched_text(item_content, content_preview, content_ranges)
        item_details_container.appendChild(item_content)

        // add to parent div
        item_parent.appendChild(item_details_container)
        parent_div.appendChild(item_parent)
    }
}
