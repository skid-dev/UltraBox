async function main() {
    // create marker
    const marker = document.createElement("div")
    marker.setAttribute("data-ultrabox-schooltape-marker", "true")
    document.body.appendChild(marker)

    // set up observer
    const observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.type === "childList") {
                // check for updated nodes
                if (mutation.addedNodes.length > 0) {
                    Array.from(mutation.addedNodes).some(node => node)
                }
            }
        }
    })
}

//8=========D

const marker_elem = document.querySelector("[data-ultrabox-schooltape-marker]")
if (!marker_elem) {
    main()
}
