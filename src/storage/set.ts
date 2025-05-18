import { ItemRecord } from "../types/item_record"

export async function add_channel(channel_name: string): Promise<void> {
    const channel_key = `news_channel_${channel_name}`
    await chrome.storage.local.set({ [channel_key]: [] })
}

export async function ensure_channel_exists(channel_name: string): Promise<void> {
    const channel_key = `news_channel_${channel_name}`
    const channel_data = await chrome.storage.local.get(channel_key)

    // Check if the channel already exists
    if (!channel_data[channel_key]) {
        await add_channel(channel_name)
    }
}

export async function clear_channel(channel_name: string): Promise<void> {
    const channel_key = `news_channel_${channel_name}`
    await chrome.storage.local.set({ [channel_key]: [] })
}

export async function add_item_to_channel(channel_name: string, item: ItemRecord): Promise<boolean> {
    const channel_key = `news_channel_${channel_name}`
    const channel_data = await chrome.storage.local.get(channel_key)

    // Check if the channel exists
    if (!channel_data[channel_key]) {
        console.error(`Channel ${channel_name} does not exist.`)
        return false
    }

    const channel_items: ItemRecord[] = channel_data[channel_key] || []

    // Check if the item already exists in the channel
    const item_exists = channel_items.some(existing_item => existing_item.guid === item.guid)
    if (item_exists) {
        console.error(`Item with GUID ${item.guid} already exists in channel ${channel_name}.`)
        return false // Item already exists, do not add
    }

    // Add the new item to the channel
    channel_items.push(item)
    await chrome.storage.local.set({ [channel_key]: channel_items })
    return true
}

export async function update_item_properties(
    channel_name: string,
    item_guid: string,
    new_properties: Partial<ItemRecord>
): Promise<void> {
    const channel_key = `news_channel_${channel_name}`
    const channel_data = await chrome.storage.local.get(channel_key)

    // Check if the channel exists
    if (!channel_data[channel_key]) {
        console.error(`Channel ${channel_name} does not exist.`)
        return
    }

    let channel_items: ItemRecord[] = channel_data[channel_key] || []

    // Update the item properties
    channel_items = channel_items.map(item => {
        if (item.guid === item_guid) {
            return { ...item, ...new_properties }
        }
        return item
    })

    await chrome.storage.local.set({ [channel_key]: channel_items })
}

export async function remove_item_from_channel(channel_name: string, item_guid: string): Promise<void> {
    const channel_key = `news_channel_${channel_name}`
    const channel_data = await chrome.storage.local.get(channel_key)

    // Check if the channel exists
    if (!channel_data[channel_key]) {
        console.error(`Channel ${channel_name} does not exist.`)
        return
    }

    let channel_items: ItemRecord[] = channel_data[channel_key] || []

    // Remove the item from the channel
    channel_items = channel_items.filter(item => item.guid !== item_guid)
    await chrome.storage.local.set({ [channel_key]: channel_items })
}

export async function add_if_not_exists(
    channel_name: string,
    item_guid: string,
    item: ItemRecord
): Promise<boolean> {
    const channel_key = `news_channel_${channel_name}`
    const channel_data = await chrome.storage.local.get(channel_key)

    // Check if the channel exists
    if (!channel_data[channel_key]) {
        console.error(`Channel ${channel_name} does not exist.`)
        return false
    }

    let channel_items: ItemRecord[] = channel_data[channel_key] || []

    // Check if the item already exists in the channel
    const item_exists = channel_items.some(existing_item => existing_item.guid === item_guid)
    if (item_exists) return false // Item already exists, do not add

    // Add the new item to the channel
    channel_items.push(item)
    await chrome.storage.local.set({ [channel_key]: channel_items })
    return true
}
