import type { Settings } from "../../types/settings"

async function main() {
    if (document.querySelector("ultrabox-domain-detect-banner")) {
        return
    }

    const elem = document.querySelector("#footer li a[href='https://schoolbox.education']")
    if (elem && window.location.href !== "https://schoolbox.education/") {
        const url = new URL(window.location.href)
        const main_url = url.protocol + "//" + url.hostname

        let settings = (await chrome.storage.sync.get("settings"))["settings"] as Settings
        settings.main_domain = main_url
        await chrome.storage.sync.set({ settings })

        // show a popup banner
        const banner = document.createElement("div")
        banner.id = "ultrabox-domain-detect-banner"
        banner.style.position = "fixed"
        banner.style.top = "20px"
        banner.style.right = "20px"
        banner.style.backgroundColor = "#e3ffe4"
        banner.style.border = "2px solid #4CAF50"
        banner.style.borderLeftWidth = "8px"
        banner.style.color = "black"
        banner.style.padding = "15px"
        banner.style.borderRadius = "5px"
        banner.style.zIndex = "10000"

        banner.innerHTML = `
            <p style="font-weight: bold;">Detected main domain: ${main_url}</p>
            <p>UltraBox is now setup to work on your LMS' domain!</p>
            <p>Incorrectly detected? <a href='https://github.com/skid-dev/UltraBox' target='_blank'>Submit a bug report</a></p>
        `

        document.body.appendChild(banner)

        setTimeout(() => {
            banner.remove()
        }, 10000)
    }
}

main()
