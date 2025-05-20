// rss_poller.ts
import { ItemRecord } from "../types/item_record"
import { XMLParser } from "fast-xml-parser"
import { RSSItem } from "../types/rss_item"
import * as set_storage from "../storage/set"
import * as get_storage from "../storage/get"
import { convert_to_plaintext } from "./functions/convert_to_plaintext"
import { find_first_storage_image_link } from "./functions/get_image_uri"
import { Settings } from "../types/settings"

const STORAGE_KEY = "news"

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    // tweaks that help with most RSS feeds
})

function item_to_record(item_json: RSSItem): ItemRecord {
    return {
        title: item_json.title ?? "",
        content: convert_to_plaintext(item_json.description ?? ""),
        parent: "News",
        link: item_json.link ?? "",
        guid: item_json.guid ?? "",
        image_uri: find_first_storage_image_link(item_json.description ?? ""),
    }
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
                if (!success) {
                    console.error("Failed to add item to channel", item_record)
                    continue
                }
            } else if (existing_item?.content !== item_record.content) {
                // if the item exists, check if the content has changed, and if so
                // update the item in the storage
                await set_storage.update_item_properties(STORAGE_KEY, item_record.guid, {
                    content: item_record.content,
                })
                continue
            }
        }

        console.log("Pull successful, pulled", items.length, "items")
    } catch (err) {
        console.error("rss poll failed", err)
    }
}

export const on_alarm = (alarm: chrome.alarms.Alarm): void => {
    if (alarm.name === "rss_poll") poll_feed()
}

export async function init_rss_poller(): Promise<void>{
    let user_settings = (await chrome.storage.sync.get("settings"))["settings"] as Settings

    chrome.alarms.create("rss_poll", { periodInMinutes: user_settings.rss_feed_pull_interval })
    chrome.alarms.onAlarm.addListener(on_alarm)
}
