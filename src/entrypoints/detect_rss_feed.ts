import { set_setting } from "../background/set_setting"
import { show_detection_banner } from "../content/auto_detection/show_banner"

export default defineUnlistedScript(() => {
    async function main() {
        if (document.querySelector("#ultrabox-rss-feed-detect-iframe")) {
            return
        }

        async function on_load() {
            const iframe_doc = iframe.contentDocument || iframe.contentWindow?.document

            if (!iframe_doc) return

            const rss_link = Array.from(iframe_doc.querySelectorAll("a")).find(tag =>
                tag.href.includes("/news/feed")
            )
            if (!rss_link) {
                return
            }

            const rss_feed_url = rss_link.href
            await set_setting("news_rss_feed", rss_feed_url)

            show_detection_banner({
                id: "ultrabox-rss-feed-detect-banner",
                top: "160px",
                title: `Detected RSS feed: ${rss_feed_url}`,
                body_html: `<p>UltraBox is now setup to work on your LMS' domain!</p>`,
            })
        }

        const iframe = document.createElement("iframe")
        const url = new URL(window.location.href)
        iframe.src = url.protocol + "//" + url.hostname + "/news"
        iframe.id = "ultrabox-rss-feed-detect-iframe"
        iframe.style.display = "none"
        document.body.appendChild(iframe)

        iframe.addEventListener("load", on_load)
    }

    main()
})
