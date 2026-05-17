import { describe, it, expect, beforeEach, vi } from "vitest"
import { fakeBrowser } from "wxt/testing"
import { set_setting } from "./set_setting"
import type { Settings } from "../types/settings"

describe("set_setting", () => {
    beforeEach(() => {
        fakeBrowser.reset()
    })

    it("updates the target key without dropping sibling settings", async () => {
        const initial: Settings = {
            main_domain: "https://example.schoolbox.com.au",
            news_rss_feed: "https://example.schoolbox.com.au/news/rss",
            inject_css: true,
            launcher_module: true,
        }
        await chrome.storage.sync.set({ settings: initial })

        await set_setting("inject_css", false)

        const { settings } = await chrome.storage.sync.get("settings")
        expect(settings).toEqual({
            main_domain: "https://example.schoolbox.com.au",
            news_rss_feed: "https://example.schoolbox.com.au/news/rss",
            inject_css: false,
            launcher_module: true,
        })
    })

    it("logs an error and leaves storage untouched when settings are uninitialized", async () => {
        const error_spy = vi.spyOn(console, "error").mockImplementation(() => {})

        await set_setting("inject_css", true)

        expect(error_spy).toHaveBeenCalledWith("Settings not initialized yet.")
        const result = await chrome.storage.sync.get("settings")
        expect(result.settings).toBeUndefined()

        error_spy.mockRestore()
    })
})
