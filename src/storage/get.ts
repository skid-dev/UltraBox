import { ItemRecord } from "../types/item_record"
import { get_news_channel_items, list_news_channel_names } from "./items"

export async function get_all_news_channels(): Promise<string[]> {
    return await list_news_channel_names()
}

export async function get_news_channel(channel_name: string): Promise<ItemRecord[]> {
    return (await get_news_channel_items(channel_name)) ?? []
}

export async function get_news_item(
    channel_name: string,
    item_guid: string
): Promise<ItemRecord | undefined> {
    const channel_items = await get_news_channel(channel_name)
    return channel_items.find(item => item.guid === item_guid)
}

export interface itemWithContext {
    item: ItemRecord
    parent_channel: string
}

export async function search_for_news_item(
    filter_function: (item: ItemRecord) => boolean
): Promise<itemWithContext[]> {
    const all_channels = await get_all_news_channels()
    const matching_items: itemWithContext[] = []

    for (const channel of all_channels) {
        const items = await get_news_channel(channel)
        const filtered = items.filter(filter_function)
        for (const item of filtered) {
            matching_items.push({ item, parent_channel: channel })
        }
    }

    return matching_items
}
