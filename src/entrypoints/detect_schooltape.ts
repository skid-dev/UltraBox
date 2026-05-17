import { set_setting } from "../background/set_setting"

export default defineUnlistedScript(() => {
    async function handle_stylesheet_change(nodes: NodeList, present: boolean) {
        for (const node of Array.from(nodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue
            const attr = (node as Element).getAttribute("data-schooltape")
            if (attr !== "stylesheet-themes") continue

            const verb = present ? "added" : "removed"
            console.log(`[Schooltape Detection] Detected Schooltape stylesheet ${verb} to the page.`)
            await set_setting("schooltape_compatibility", present)
        }
    }

    async function main() {
        // create marker
        const marker = document.createElement("div")
        marker.setAttribute("data-ultrabox-schooltape-marker", "true")
        document.body.appendChild(marker)

        // set up observer
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type !== "childList") continue
                handle_stylesheet_change(mutation.addedNodes, true)
                handle_stylesheet_change(mutation.removedNodes, false)
            }
        })
        observer.observe(document.head, { childList: true, subtree: true })
    }

    if (!document.querySelector("[data-ultrabox-schooltape-marker]")) {
        main()
    }
})
