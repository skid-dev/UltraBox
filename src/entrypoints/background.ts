import on_install from "../background/events/on_install"
import on_update from "../background/events/on_update"
import { on_open, on_close } from "../background/events/on_update_track_tab"
import { launcher_shortcut } from "../background/events/commands/launcher"

export default defineBackground(() => {
    chrome.runtime.onInstalled.addListener(on_install)
    chrome.tabs.onUpdated.addListener(on_update)
    chrome.tabs.onUpdated.addListener(on_open)
    chrome.tabs.onRemoved.addListener(on_close)
    chrome.commands.onCommand.addListener(launcher_shortcut)
})
