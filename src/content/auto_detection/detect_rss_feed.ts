import type { Settings } from "../../types/settings"

async function main() {
    if (document.querySelector("#ultrabox-rss-feed-detect-iframe")) {
        console.log("RSS feed detection iframe already exists, skipping...")
        return
    }

    console.log("[RSS feed detection] Starting RSS feed detection...")

    async function on_load() {
        const iframe_doc = iframe.contentDocument || iframe.contentWindow?.document
        console.log(
            "[RSS feed detection] Iframe loaded, searching for rss feed link...",
            iframe_doc
        )

        if (!iframe_doc) return

        let a_tags = Array.from(iframe_doc.querySelectorAll("a"))
        a_tags = a_tags.filter(tag => {
            return tag.href.includes("/news/feed")
        })

        if (a_tags.length === 0) {
            console.log("[RSS feed detection] No rss feed link found")
            return
        }

        const rss_feed_url = a_tags[0].href
        console.log("[RSS feed detection] RSS feed link found:", rss_feed_url)

        // save the detected rss feed url to chrome storage
        const settings = (await chrome.storage.sync.get("settings"))["settings"] as Settings
        settings.news_rss_feed = rss_feed_url
        await chrome.storage.sync.set({ settings })

        // show a popup banner
        const banner = document.createElement("div")
        banner.id = "ultrabox-domain-detect-banner"
        banner.style.position = "fixed"
        banner.style.top = "160px"
        banner.style.right = "20px"
        banner.style.backgroundColor = "#e3ffe4"
        banner.style.border = "2px solid #4CAF50"
        banner.style.borderLeftWidth = "8px"
        banner.style.color = "black"
        banner.style.padding = "15px"
        banner.style.borderRadius = "5px"
        banner.style.zIndex = "10000"

        banner.innerHTML = `
            <p style="font-weight: bold;">Detected RSS feed: ${rss_feed_url}</p>
            <p>UltraBox is now setup to work on your LMS' domain!</p>
            <p>Incorrectly detected? <a href='https://github.com/skid-dev/UltraBox' target='_blank'>Submit a bug report</a></p>
        `

        document.body.appendChild(banner)

        setTimeout(() => {
            banner.remove()
        }, 10000)
    }

    const iframe = document.createElement("iframe")
    const url = new URL(window.location.href)
    iframe.src = url.protocol + "//" + url.hostname + "/news"
    iframe.id = "ultrabox-rss-feed-detect-iframe"
    iframe.style.display = "none"
    document.body.appendChild(iframe)

    console.log("[RSS feed detection] Waiting for iframe to load...", iframe)

    iframe.addEventListener("load", on_load)
}

main()
