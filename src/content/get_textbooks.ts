import * as set_storage from "../storage/set"
import * as get_storage from "../storage/get"
import { TextbookEntry } from "../types/textbook_entry"
import { ItemRecord } from "../types/item_record"

const STORAGE_KEY = "bob"

console.log("[UltraBox] Indexing textbooks...")

function get_textbooks(): TextbookEntry[] {
    let book_elements = Array.from(document.querySelectorAll(`#book-box .page-search-item`))

    let items_textbook_entries: TextbookEntry[] = []
    for (let book of book_elements) {
        let title = book.querySelector(".card-body")?.children[0]?.textContent?.trim() ?? "Untitled"
        let link = book.querySelector("a")?.href ?? ""

        console.log(title, link)
        let link_full = new URL(link.replace("/bookdetail", "/webreader"), window.location.origin)
        let textbook_entry: TextbookEntry = {
            name: title,
            url: link_full.toString(),
        }

        items_textbook_entries.push(textbook_entry)
    }
    return items_textbook_entries
}

let textbooks = get_textbooks()
;(async () => {
    for (let textbook of textbooks) {
        let item_record: ItemRecord = {
            title: textbook.name,
            content: "",
            parent: "Textbooks",
            link: textbook.url,
            guid: textbook.url,
            image_uri: null,
            colour: "#34a853",
        }
        await set_storage.add_if_not_exists(STORAGE_KEY, textbook.url, item_record)
    }
})()

set_storage.ensure_channel_exists(STORAGE_KEY)
console.log(`[UltraBox] Indexed ${textbooks.length} textbooks.`)
