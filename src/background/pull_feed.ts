import { ItemRecord } from "../types/item_record"
import { XMLParser } from "fast-xml-parser"
import { RSSItem } from "../types/rss_item"
import * as set_storage from "../storage/set"
import * as get_storage from "../storage/get"
import { convert_to_plaintext } from "./functions/convert_to_plaintext"
import { find_first_storage_image_link } from "./functions/get_image_uri"
import { Settings } from "../types/settings"
import { add_revision_to_history } from "../storage/revisions/revision_set"
import { RevisionData } from "../types/rev_history"
import { calculate_new_metrics } from "./functions/calculate_rev_metrics"

const STORAGE_KEY = "news"

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    // tweaks that help with most RSS feeds
})

function get_updated_timestamp(item_json: RSSItem): number {
    if (!item_json.pubDate) {
        return Date.now()
    }

    const parsed_date = Date.parse(item_json.pubDate)
    if (Number.isNaN(parsed_date)) {
        return Date.now()
    }

    return parsed_date
}

function item_to_record(item_json: RSSItem): ItemRecord {
    return {
        title: item_json.title ?? "",
        content: convert_to_plaintext(item_json.description ?? ""),
        raw: item_json.description ?? "",
        parent: "News",
        link: item_json.link ?? "",
        guid: item_json.guid ?? "",
        image_uri: find_first_storage_image_link(item_json.description ?? ""),
        updated_at: get_updated_timestamp(item_json),
        view_count: 0,
        last_viewed: 0,
        bounce_count: 0,
    }
}

async function append_revision(
    guid: string,
    prev_data: Partial<ItemRecord>,
    revision: Partial<ItemRecord>
): Promise<string> {
    // generate old revision data
    const prev_data_obj: RevisionData = {
        title: prev_data.title ?? "",
        content: prev_data.raw ?? "",
    }

    // create the revision data
    const rev_object: RevisionData = {
        title: revision.title ?? "",
        content: revision.raw ?? "",
    }

    const now = Date.now()
    const { new_lines, modified_lines, deleted_lines } = await calculate_new_metrics(
        prev_data_obj,
        rev_object
    )

    const data = await add_revision_to_history(
        guid,
        prev_data_obj,
        now,
        new_lines,
        modified_lines,
        deleted_lines
    )

    return data.rev_id
}

export const poll_feed = async (): Promise<void> => {
    try {
        let user_settings = (await chrome.storage.sync.get("settings"))["settings"] as Settings

        if (!user_settings.news_rss_feed) {
            console.log("No RSS feed URL found in settings")
            return
        }

        const response = await fetch(user_settings.news_rss_feed)
        const xml_text = await response.text()
        const xml_doc = parser.parse(xml_text)

        await set_storage.ensure_channel_exists(STORAGE_KEY)

        console.log("Pulling feed", user_settings.news_rss_feed)

        const items = xml_doc["rss"]["channel"]["item"] as RSSItem[]
        for (let item of items) {
            const item_record = item_to_record(item)

            // check if the item already exists in storage
            let existing_item = await get_storage.get_news_item(STORAGE_KEY, item_record.guid)
            if (!existing_item) {
                // if the item does not exist, add it to the storage
                let success = await set_storage.add_item_to_channel(STORAGE_KEY, item_record)
                console.log("Adding new item to channel:", item_record)
                if (!success) {
                    console.error("Failed to add item to channel", item_record)
                    continue
                }
            } else {
                const updates: Partial<ItemRecord> = {}

                if (existing_item.content !== item_record.content) {
                    updates.content = item_record.content
                }

                if (existing_item.raw !== item_record.raw) {
                    updates.raw = item_record.raw
                }

                if (existing_item.title !== item_record.title) {
                    updates.title = item_record.title
                }

                const existing_updated_at = existing_item.updated_at ?? 0
                if (
                    !existing_item.updated_at ||
                    existing_updated_at < (item_record.updated_at ?? 0)
                ) {
                    updates.updated_at = item_record.updated_at
                }

                if (Object.keys(updates).length > 0) {
                    const revision_id = await append_revision(item_record.guid, existing_item, {
                        ...existing_item,
                        ...updates,
                    })
                    await set_storage.update_item_properties(STORAGE_KEY, item_record.guid, updates)
                    await set_storage.add_revision_history_entry(
                        STORAGE_KEY,
                        item_record.guid,
                        revision_id
                    )
                }

                continue
            }
        }

        console.log("Pull successful, pulled", items.length, "items")
    } catch (err) {
        console.error("rss poll failed", err)
    }
}
