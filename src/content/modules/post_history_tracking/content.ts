import {setup} from "./setup"

async function main() {
    console.log("[News history] Running display history module")
    await setup()
}

if (document.querySelector(".meta") && !document.querySelector("#ultrabox-history-container")) {
    main().then(() => {
        console.log("Done")
    })
} else {
    console.log("Waiting...")
}
