import on_install from "./events/on_install"
chrome.runtime.onInstalled.addListener(on_install)

import on_update from "./events/on_update"
chrome.tabs.onUpdated.addListener(on_update)

import { on_open, on_close } from "./events/on_update_track_tab"
chrome.tabs.onUpdated.addListener(on_open)
chrome.tabs.onRemoved.addListener(on_close)
