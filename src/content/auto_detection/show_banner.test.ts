import { describe, it, expect, afterEach, beforeEach, vi } from "vitest"
import { show_detection_banner } from "./show_banner"

describe("show_detection_banner", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        document.body.innerHTML = ""
    })

    it("mounts a banner with the provided id, top offset, and content", () => {
        show_detection_banner({
            id: "ultrabox-test-banner",
            top: "80px",
            title: "Detected SchoolBox",
            body_html: "<p>Hello world</p>",
        })

        const banner = document.getElementById("ultrabox-test-banner")
        expect(banner).not.toBeNull()
        expect(banner?.style.position).toBe("fixed")
        expect(banner?.style.top).toBe("80px")
        expect(banner?.style.right).toBe("20px")
        expect(banner?.style.zIndex).toBe("10000")
        expect(banner?.innerHTML).toContain("Detected SchoolBox")
        expect(banner?.innerHTML).toContain("<p>Hello world</p>")
        expect(banner?.innerHTML).toContain("Submit a bug report")
    })

    it("removes itself after the default 10s timeout", () => {
        show_detection_banner({
            id: "ultrabox-autohide",
            top: "20px",
            title: "Hi",
            body_html: "<p>body</p>",
        })

        expect(document.getElementById("ultrabox-autohide")).not.toBeNull()
        vi.advanceTimersByTime(10000)
        expect(document.getElementById("ultrabox-autohide")).toBeNull()
    })

    it("honors a custom auto_hide_ms duration", () => {
        show_detection_banner({
            id: "ultrabox-custom",
            top: "20px",
            title: "Hi",
            body_html: "<p>body</p>",
            auto_hide_ms: 2500,
        })

        vi.advanceTimersByTime(2499)
        expect(document.getElementById("ultrabox-custom")).not.toBeNull()
        vi.advanceTimersByTime(1)
        expect(document.getElementById("ultrabox-custom")).toBeNull()
    })
})
