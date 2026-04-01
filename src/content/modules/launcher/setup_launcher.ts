import { on_input, on_keydown } from "./main"

export default function setup_launcher(parent: HTMLDivElement): HTMLInputElement {
    const launcher_input_container = document.createElement("div")
    launcher_input_container.id = "schoolbox-launcher"

    const launcher_input_box = document.createElement("input")
    launcher_input_box.autocomplete = "off"
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
    parent.appendChild(launcher_input_container)

    // select the input field
    launcher_input_box.addEventListener("input", on_input)
    launcher_input_box.addEventListener("keydown", on_keydown)
    launcher_input_box.focus()

    return launcher_input_box
}
