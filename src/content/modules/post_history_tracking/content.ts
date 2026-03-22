import {setup} from "./on_click"

async function main() {
    console.log("Running display history module")
    const meta_elem = document.querySelector(".meta") as HTMLDivElement

    await setup()
}

if (document.querySelector(".meta") && !document.querySelector("#ultrabox-history-container")) {
    main().then(() => {
        console.log("Done")
    })
} else {
    console.log("Waiting...")
}
