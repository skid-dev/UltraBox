import launcher from "../../../background/events/injects/launcher"
import { get_news_channels, on_input, on_keydown } from "./main"
import setup_launcher from "./setup_launcher"

function inject_launcher_shortcut() {
    get_news_channels()

    // darkened background for launcher
    const launcher_popup_background = document.createElement("div")
    launcher_popup_background.id = "ultrabox-launcher-background-div"

    // inner box for the actual content
    const launcher_popup = document.createElement("div")
    launcher_popup.id = "ultrabox-launcher-popup-content-div"

    launcher_popup_background.appendChild(launcher_popup)
    document.body.appendChild(launcher_popup_background)

    const input_elem = setup_launcher(launcher_popup)

    function enable_launcher() {
        launcher_popup_background.style.display = "block"
        input_elem.value = ""
        input_elem.focus()
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

    // also listen for messages from chrome extension
    // box of books webreader likes to use stopPropagation 
    // for some events so this prioritises the content script
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "launcher-enable") {
            enable_launcher()
        }
    })
}

if (!document.getElementById("ultrabox-launcher-background-div")) {
    inject_launcher_shortcut()
}
