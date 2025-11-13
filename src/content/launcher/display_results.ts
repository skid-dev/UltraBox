import { IndexedItem } from "../../types/indexed_item"
import { lighten } from "../functions/lighten"
import { darken } from "../functions/darken"
import { Settings } from "../../types/settings"

// Helper to promisify chrome.storage.sync.get for settings
const get_stored_settings = (): Promise<Settings | undefined> =>
    new Promise(resolve => {
        chrome.storage.sync.get("settings", result => {
            resolve(result.settings as Settings | undefined)
        })
    })

export async function display_results(parent_div: HTMLElement, results: IndexedItem[]): Promise<void> {
    parent_div.innerHTML = ""
    const stored_settings = await get_stored_settings()
    const is_dark_mode = stored_settings?.inject_css ?? false

    for (let result of results) {
        let item_parent = document.createElement("div")
        item_parent.classList.add("ultrabox-launcher-item-parent")

        if (result.item.colour) {
            if (is_dark_mode) {
                item_parent.style.backgroundColor = darken(result.item.colour, 0.8)
            } else {
                item_parent.style.backgroundColor = lighten(result.item.colour, 0.8)
            }
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
