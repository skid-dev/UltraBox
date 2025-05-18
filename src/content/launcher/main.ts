import Fuse from "fuse.js"
import * as get_storage from "../../storage/get"
import { IndexedItem } from "../../types/indexed_item"
import { lighten } from "../functions/lighten"

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

function display_results(parent_div: HTMLElement, results: IndexedItem[]): void {
    parent_div.innerHTML = ""

    for (let result of results) {
        let item_parent = document.createElement("div")
        item_parent.classList.add("ultrabox-launcher-item-parent")

        if (result.item.colour) {
            item_parent.style.backgroundColor = lighten(result.item.colour, 0.8)
        }

        // item image
        if (result.item.parent === "Your subjects") {
            let item_image = document.createElement("div")
            item_image.classList.add("ultrabox-launcher-item-placeholder-image")
            item_image.style.backgroundColor = result.item.colour || "#a8caff"
            item_image.innerText = result.item.title[0].toUpperCase()

            item_parent.appendChild(item_image)
        } else {
            let item_image = document.createElement("img")
            item_image.classList.add("ultrabox-launcher-item-image")
            item_image.src = result.item.image_uri || ""
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
        item_channel.innerText = result.item.parent + " / "
        item_title.appendChild(item_channel)

        let item_title_link = document.createElement("a")
        item_title_link.innerText = result.item.title
        item_title_link.href = result.item.link
        item_title.appendChild(item_title_link)

        item_details_container.appendChild(item_title)

        // content preview
        let item_content = document.createElement("div")
        item_content.classList.add("ultrabox-launcher-item-content")
        item_content.innerText = result.item.content.slice(0, 200)
        item_details_container.appendChild(item_content)

        // add to parent div
        item_parent.appendChild(item_details_container)
        parent_div.appendChild(item_parent)
    }
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

    let results = fuse.search(input_text).slice(0, 5)
    console.log("Search results", results)

    display_results(
        parent_div,
        results.map(result => result.item)
    )
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
