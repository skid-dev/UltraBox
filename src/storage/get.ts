import { ItemRecord } from "../types/item_record"

export async function get_all_news_channels(): Promise<string[]> {
    const news_channels = await chrome.storage.local.getKeys()
    return news_channels
        .filter(key => key.startsWith("news_channel_"))
        .map(key => key.replace("news_channel_", ""))
}

export async function get_news_channel(channel_name: string): Promise<ItemRecord[]> {
    const news_channel = await chrome.storage.local.get(`news_channel_${channel_name}`)
    return news_channel[`news_channel_${channel_name}`] as ItemRecord[] || []
}

export async function get_news_item(
    channel_name: string,
    item_guid: string
): Promise<ItemRecord | undefined> {
    let channel_items = await get_news_channel(channel_name)
    if (!channel_items) return undefined

    let this_item = channel_items.find(item => item.guid === item_guid)
    if (!this_item) return undefined

    return this_item
}

export interface itemWithContext {
    item: ItemRecord
    parent_channel: string
}

export async function search_for_news_item(filter_function: (item: ItemRecord) => boolean): Promise<itemWithContext[]> {
    let all_channels = await get_all_news_channels()
    let matching_items: itemWithContext[] = []

    for (let channel of all_channels) {
        let items = await get_news_channel(channel)
        let filtered_items = items.filter(filter_function)
        let filtered_items_with_channel = filtered_items.map(i => {
            return {
                item: i,
                parent_channel: channel,
            }
        })
        matching_items = matching_items.concat(filtered_items_with_channel)
    }

    return matching_items
}
