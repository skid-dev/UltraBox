import { darken } from "./functions/darken"

function set_timetable_bg() {
    console.log("[UltraBox] Setting timetable background colors as per set stylesheet...")
    const timetable_elements = Array.from(
        document.querySelectorAll(".timetable-subject")
    ) as HTMLDivElement[]

    // check if the timetable has already been darkened
    if (
        !timetable_elements.some(
            el => getComputedStyle(el).backgroundColor === "rgb(204, 255, 204)"
        )
    ) {
        return
    }

    for (let elem of timetable_elements) {
        elem.style.backgroundColor = darken(getComputedStyle(elem).backgroundColor, 0.7)
    }
}

set_timetable_bg()
