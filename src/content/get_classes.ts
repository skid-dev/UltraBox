import * as set_storage from "../storage/set"
import * as get_storage from "../storage/get"
import { ItemRecord } from "../types/item_record"

const CLASS_CHANNEL_NAME = "classes"

export function get_classes(): ItemRecord[] {
    let a_elements = Array.from(
        document.querySelectorAll(`a[href^="/homepage/code"`)
    ) as HTMLAnchorElement[]

    return a_elements.map(elem => {
        return {
            title: elem.innerText,
            content: "",
            parent: "Your subjects",
            link: elem.href,
            guid: elem.href,
            image_uri: null,
            colour: "#4287f5",
        }
    })
}

export async function store_classes(): Promise<void> {
    let classes = get_classes()

    let current_channel_items = (await get_storage.get_news_channel(CLASS_CHANNEL_NAME)).length
    if (current_channel_items === classes.length) { return }

    await set_storage.clear_channel(CLASS_CHANNEL_NAME)

    for (let class_item of classes) {
        await set_storage.add_if_not_exists(CLASS_CHANNEL_NAME, class_item.guid, class_item)
    }
}
