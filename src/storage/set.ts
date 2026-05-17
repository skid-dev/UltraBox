import { ItemRecord } from "../types/item_record"
import { get_news_channel_items, set_news_channel_items } from "./items"

export async function add_channel(channel_name: string): Promise<void> {
    await set_news_channel_items(channel_name, [])
}

export async function ensure_channel_exists(channel_name: string): Promise<void> {
    const channel_items = await get_news_channel_items(channel_name)
    if (!channel_items) {
        await add_channel(channel_name)
    }
}

export async function clear_channel(channel_name: string): Promise<void> {
    await set_news_channel_items(channel_name, [])
}

export async function add_item_to_channel(
    channel_name: string,
    item: ItemRecord
): Promise<boolean> {
    const channel_items = await get_news_channel_items(channel_name)
    if (!channel_items) {
        console.error(`Channel ${channel_name} does not exist.`)
        return false
    }

    // Check if the item already exists in the channel
    if (channel_items.some(existing_item => existing_item.guid === item.guid)) {
        console.error(`Item with GUID ${item.guid} already exists in channel ${channel_name}.`)
        return false
    }

    channel_items.push(item)
    await set_news_channel_items(channel_name, channel_items)
    return true
}

export async function update_item_properties(
    channel_name: string,
    item_guid: string,
    new_properties: Partial<ItemRecord>
): Promise<void> {
    const channel_items = await get_news_channel_items(channel_name)
    if (!channel_items) {
        console.error(`Channel ${channel_name} does not exist.`)
        return
    }

    const updated = channel_items.map(item =>
        item.guid === item_guid ? { ...item, ...new_properties } : item
    )

    await set_news_channel_items(channel_name, updated)
}

// update item view count and last viewed time
export async function update_item_vc_and_lvt(
    channel_name: string,
    item_guid: string
): Promise<number | null> {
    const channel_items = await get_news_channel_items(channel_name)
    if (!channel_items) {
        console.error(`Channel ${channel_name} does not exist.`)
        return null
    }

    let updated_view_count: number | null = null
    const updated = channel_items.map(item => {
        if (item.guid !== item_guid) return item
        const new_view_count = (item.view_count || 0) + 1
        updated_view_count = new_view_count
        return { ...item, view_count: new_view_count, last_viewed: Date.now() }
    })
    await set_news_channel_items(channel_name, updated)
    return updated_view_count
}

export async function increment_item_bounce_count(
    channel_name: string,
    item_guid: string
): Promise<void> {
    const channel_items = await get_news_channel_items(channel_name)
    if (!channel_items) {
        console.error(`Channel ${channel_name} does not exist.`)
        return
    }

    const updated = channel_items.map(item => {
        if (item.guid !== item_guid) return item
        return { ...item, bounce_count: (item.bounce_count || 0) + 1 }
    })
    await set_news_channel_items(channel_name, updated)
}

export async function add_revision_history_entry(
    channel_name: string,
    item_guid: string,
    rev_id: string
): Promise<string[]> {
    const channel_items = await get_news_channel_items(channel_name)
    if (!channel_items) {
        console.error(`Channel ${channel_name} does not exist.`)
        return []
    }

    let updated_rev_history: string[] = []
    const updated = channel_items.map(item => {
        if (item.guid !== item_guid) return item
        const new_history = [...(item.rev_history_uuids || []), rev_id]
        updated_rev_history = new_history
        return { ...item, rev_history_uuids: new_history }
    })
    await set_news_channel_items(channel_name, updated)
    return updated_rev_history
}

export async function remove_item_from_channel(
    channel_name: string,
    item_guid: string
): Promise<void> {
    const channel_items = await get_news_channel_items(channel_name)
    if (!channel_items) {
        console.error(`Channel ${channel_name} does not exist.`)
        return
    }

    const updated = channel_items.filter(item => item.guid !== item_guid)
    await set_news_channel_items(channel_name, updated)
}

export async function add_if_not_exists(
    channel_name: string,
    item_guid: string,
    item: ItemRecord
): Promise<boolean> {
    const channel_items = await get_news_channel_items(channel_name)
    if (!channel_items) {
        console.error(`Channel ${channel_name} does not exist.`)
        return false
    }

    if (channel_items.some(existing_item => existing_item.guid === item_guid)) {
        return false
    }

    channel_items.push(item)
    await set_news_channel_items(channel_name, channel_items)
    return true
}
