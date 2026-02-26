import launcher from "../background/events/injects/launcher"
import { get_news_channels, on_input, on_keydown } from "./modules/launcher/main"

function inject_launcher_shortcut() {
    get_news_channels()

    // darkened background for launcher
    const launcher_popup_background = document.createElement("div")
    launcher_popup_background.id = "ultrabox-launcher-background-div"

    // inner box for the actual content
    const launcher_popup = document.createElement("div")
    launcher_popup.id = "ultrabox-launcher-popup-content-div"

    const launcher_input_container = document.createElement("div")
    launcher_input_container.id = "schoolbox-launcher"

    const launcher_input_box = document.createElement("input")
    launcher_input_box.id = "schoolbox-launcher-search"
    launcher_input_box.placeholder = "What are you looking for?"

    const launcher_results_wrapper = document.createElement("div")
    launcher_results_wrapper.id = "schoolbox-launcher-results-wrapper"

    const launcher_results = document.createElement("div")
    launcher_results.id = "schoolbox-launcher-results"
    launcher_results_wrapper.appendChild(launcher_results)

    launcher_input_container.appendChild(launcher_input_box)
    launcher_input_container.appendChild(launcher_results_wrapper)

    // add the slauncher to the page
    launcher_popup.appendChild(launcher_input_container)

    launcher_popup_background.appendChild(launcher_popup)

    // select the input field
    launcher_input_box.addEventListener("input", on_input)
    launcher_input_box.addEventListener("keydown", on_keydown)

    document.body.appendChild(launcher_popup_background)

    function enable_launcher() {
        launcher_popup_background.style.display = "block"
        launcher_input_box.value = ""
        launcher_input_box.focus()
    }

    // listen for ctrl + k
    document.addEventListener(
        "keydown",
        ev => {
            if ((ev.ctrlKey || ev.metaKey) && ev.key === "k") {
                ev.preventDefault()
                enable_launcher()
            } else if (ev.key === "Escape") {
                launcher_popup_background.style.display = "none"
            }
        },
        { capture: true }
    )

    chrome.runtime.onMessage.addListener((request) => {
        console.log("Received message in content script:", request)
        if (request.action === "launcher-enable") {
            enable_launcher()
        }
    })
}

if (!document.getElementById("ultrabox-launcher-background-div")) {
    inject_launcher_shortcut()
}
