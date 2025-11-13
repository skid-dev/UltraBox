import { poll_feed } from "../background/pull_feed"
import { store_classes } from "./get_classes"
import { get_news_channels, on_input, on_keydown } from "./launcher/main"

console.log("Content script loaded.")

// Function to inject the launcher
function inject_launcher(): void {
    // Check if launcher already exists
    if (document.getElementById("schoolbox-launcher")) {
        return
    }
    get_news_channels()
    poll_feed()

    // launcher div
    const launcher_div = document.createElement("div")
    launcher_div.id = "schoolbox-launcher-background-div"
    launcher_div.className = "schoolbox-launcher-background-div"
    let insert_before = document.getElementsByClassName("Component_Dashboard_GreetingController")[0]
    insert_before.parentElement?.insertBefore(launcher_div, insert_before)

    // launcher centre content div
    const launcher_content_div = document.createElement("div")
    launcher_content_div.id = "schoolbox-launcher-content-div"
    launcher_content_div.className = "schoolbox-launcher-content-div"
    launcher_div.appendChild(launcher_content_div)

    // move elements on the main page to this new launcher div
    // greeting heading
    launcher_content_div.appendChild(
        document.querySelector(".Component_Dashboard_GreetingController") as HTMLElement
    )

    // new element: date and time display
    const date_time_display = document.createElement("div")
    date_time_display.id = "schoolbox-date-time-display"
    date_time_display.className = "schoolbox-date-time-display"
    // show the date as "HH:MM | Weekday, DD Mth"
    const now = new Date()
    date_time_display.innerText = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    }) + " | " + now.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
    })
    launcher_content_div.appendChild(date_time_display)
    
    // timetable (if it exists)
    let timetable_element = document.querySelector("[data-timetable-container]") as HTMLElement
    if (timetable_element) {
        // remove the day indicator
        let day_indicator = timetable_element.querySelector("[data-timetable-header]") as HTMLElement
        if (day_indicator) {
            day_indicator.remove()
        }

        launcher_content_div.appendChild(timetable_element)
    }

    // launcher box
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

    // add the launcher to the page
    launcher_content_div.appendChild(launcher_input_container)

    // select the input field
    launcher_input_box.addEventListener("input", on_input)
    launcher_input_box.addEventListener("keydown", on_keydown)
    launcher_input_box.focus()

    console.log("Launcher injected.")
}

inject_launcher()
store_classes()
