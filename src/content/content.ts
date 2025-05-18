import { store_classes } from "./get_classes"
import { get_news_channels, on_input, on_keydown } from "./launcher/main"

console.log("Content script loaded.")

// Function to inject the launcher
function injectLauncher(): void {
    // Check if launcher already exists
    if (document.getElementById("schoolbox-launcher")) {
        return
    }
    get_news_channels()

    let insert_before = document.getElementsByClassName("Component_Dashboard_GreetingController")[0]

    const launcher = document.createElement("div")
    launcher.id = "schoolbox-launcher"
    launcher.innerHTML = `
        <input type="text" id="schoolbox-launcher-search" placeholder="Search...">
        <div id="schoolbox-launcher-results-wrapper"><div id="schoolbox-launcher-results"></div></div>
    `

    insert_before.parentElement?.insertBefore(launcher, insert_before)
    // select the input field
    const input = document.getElementById("schoolbox-launcher-search") as HTMLInputElement
    input.addEventListener("input", on_input)
    input.addEventListener("keydown", on_keydown)
    input.focus()

    console.log("Launcher injected.")
}

injectLauncher()
store_classes()
