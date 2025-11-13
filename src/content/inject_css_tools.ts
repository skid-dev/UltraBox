import { darken } from "./functions/darken"

function set_timetable_bg() {
    console.log("[UltraBox] Setting timetable background colors as per set stylesheet...")
    const timetable_elements = Array.from(
        document.querySelectorAll(".timetable-subject")
    ) as HTMLDivElement[]
    for (let elem of timetable_elements) {
        elem.style.backgroundColor = darken(getComputedStyle(elem).backgroundColor, 0.3)
    }
}

set_timetable_bg()
