import { get_stored_settings } from "../background/functions/utls/is_page"
import { poll_feed } from "../background/pull_feed"
import { store_classes } from "../content/modules/launcher/getters/get_classes"
import { get_news_channels } from "../content/modules/launcher/main"
import setup_launcher from "../content/modules/launcher/setup_launcher"

export default defineUnlistedScript(() => {
    // Function to inject the launcher
    async function inject_launcher(): Promise<void> {
        if (document.getElementById("ultrabox-launcher-injected-marker")) {
            // launcher already injected, no need to inject again
            return
        }

        const marker = document.createElement("div")
        marker.id = "ultrabox-launcher-injected-marker"
        document.body.appendChild(marker)

        // Check if launcher already exists
        const settings = await get_stored_settings()
        get_news_channels()
        poll_feed()

        // launcher div
        const launcher_div = document.createElement("div")
        launcher_div.id = "schoolbox-launcher-background-div"
        launcher_div.className = "schoolbox-launcher-background-div"
        let insert_before = document.getElementsByClassName(
            "Component_Dashboard_GreetingController"
        )[0]
        insert_before.parentElement?.insertBefore(launcher_div, insert_before)

        // launcher centre content div
        const launcher_content_div = document.createElement("div")
        launcher_content_div.id = "schoolbox-launcher-content-div"
        launcher_content_div.className = "schoolbox-launcher-content-div"
        launcher_div.appendChild(launcher_content_div)
        launcher_div.style.marginTop = "40px"

        if (settings?.reduce_timetable_width) {
            launcher_div.style.width = "min(900px, 90%)"
        }

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
        date_time_display.innerText =
            now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }) +
            " | " +
            now.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "short",
            })
        launcher_content_div.appendChild(date_time_display)

        // timetable (if it exists)
        let timetable_element = document.querySelector(
            "[data-timetable-container]"
        ) as HTMLElement
        if (timetable_element) {
            // remove the day indicator
            let day_indicator = timetable_element.querySelector(
                "[data-timetable-header]"
            ) as HTMLElement
            if (day_indicator) {
                day_indicator.remove()
            }

            launcher_content_div.appendChild(timetable_element)
        }

        setup_launcher(launcher_content_div, true)
    }

    inject_launcher()
    store_classes()
})
