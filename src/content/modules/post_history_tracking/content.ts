import {setup} from "./setup"

async function main() {
    await setup()
}

if (document.querySelector(".meta") && !document.querySelector("#ultrabox-history-container")) {
    main()
}