import { IndexedItem } from "../../../types/indexed_item"

export async function get_textbook_headings(): Promise<IndexedItem[]> {
    // expand all the sections in the outline
    const web_doc: Document = await new Promise((resolve, reject) => {
        let tries_left = 10
        const fetch_interval = setInterval(() => {
            // check if the elements exist
            const web_viewer: HTMLIFrameElement | null = document.getElementById("webviewer-1") as HTMLIFrameElement
            if (!web_viewer) {
                console.log("Waiting for web viewer to load...")
                tries_left--
                if (tries_left <= 0) {
                    reject(new Error("Web viewer not available"))
                }
                return
            }
            const web_doc = web_viewer.contentDocument || web_viewer.contentWindow?.document
            if (!web_doc) {
                console.log("Waiting for web viewer document to load...")
                tries_left--
                if (tries_left <= 0) {
                    reject(new Error("Web viewer document not available"))
                }
                return
            }

            if (web_doc.querySelectorAll(".Outline .arrow").length === 0) {
                console.log(web_doc.querySelectorAll(".Outline .arrow"))
                console.log("Waiting for outline elements to load...")
                return
            }

            Array.from(web_doc.querySelectorAll(".Outline .arrow"))
                .filter(el => !el.classList.contains("expanded"))
                .forEach(el => (el as HTMLElement).click())

            // if all sections are expanded, we can proceed
            clearTimeout(fetch_interval)
            resolve(web_doc)
        }, 500)
    })

    const headings: IndexedItem[] = Array.from(web_doc.querySelectorAll(".Outline button span"))
        .filter(e => e.textContent)
        .map(e => {
            return <IndexedItem>{
                parent_channel: "this_textbook",
                item: {
                    title: e.textContent || "",
                    content: "",
                    parent: "This textbook",
                    link: `h:${e.textContent}`,
                    guid: "",
                    image_uri: "",
                    colour: "#00675b",
                },
            }
        })

    console.log("Extracted textbook headings", headings)
    return headings
}
