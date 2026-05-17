import { set_setting } from "../background/set_setting"
import { show_detection_banner } from "../content/auto_detection/show_banner"

export default defineUnlistedScript(() => {
    async function main() {
        if (document.querySelector("#ultrabox-domain-detect-banner")) {
            return
        }

        const elem = document.querySelector("#footer li a[href='https://schoolbox.education']")
        if (!elem || window.location.href === "https://schoolbox.education/") {
            return
        }

        const url = new URL(window.location.href)
        const main_url = url.protocol + "//" + url.hostname

        await set_setting("main_domain", main_url)

        show_detection_banner({
            id: "ultrabox-domain-detect-banner",
            top: "20px",
            title: `Detected main domain: ${main_url}`,
            body_html: `<p>UltraBox is now setup to work on your LMS' domain!</p>`,
        })
    }

    main()
})
