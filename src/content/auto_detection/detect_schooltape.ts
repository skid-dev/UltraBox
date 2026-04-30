import { set_setting } from "../../background/set_default_settings"

async function main() {
    // create marker
    const marker = document.createElement("div")
    marker.setAttribute("data-ultrabox-schooltape-marker", "true")
    document.body.appendChild(marker)

    // set up observer
    const observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.type === "childList") {
                // check for added nodes
                if (mutation.addedNodes.length > 0) {
                    Array.from(mutation.addedNodes).forEach(async node => {
                        if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            (node as Element).getAttribute("data-schooltape") === "stylesheet-themes"
                        ) {
                            console.log("[Schooltape Detection] Detected Schooltape stylesheet added to the page.")
                            await set_setting("schooltape_compatibility", true)
                        }
                    })
                }
                // check for removed nodes
                if (mutation.removedNodes.length > 0) {
                    Array.from(mutation.removedNodes).forEach(async node => {
                        if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            (node as Element).getAttribute("data-schooltape") === "stylesheet-themes"
                        ) {
                            console.log("[Schooltape Detection] Detected Schooltape stylesheet removed from the page.")
                            await set_setting("schooltape_compatibility", false)
                        }
                    })
                }
            }
        }
    })
    observer.observe(document.head, { childList: true, subtree: true })
}

const marker_elem = document.querySelector("[data-ultrabox-schooltape-marker]")
if (!marker_elem) {
    main()
}
