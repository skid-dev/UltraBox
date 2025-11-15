import { Settings } from "../types/settings"

const tabs = document.querySelectorAll(".tab-button") as NodeListOf<HTMLButtonElement>
const tabContents = document.querySelectorAll(".tab-content") as NodeListOf<HTMLElement>
const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement

const mainDomainInput = document.getElementById("mainDomain") as HTMLInputElement
const newsRssFeedInput = document.getElementById("newsRssFeed") as HTMLInputElement

const settingCheckboxes = Array.from(document.getElementsByClassName("toggle-setting")).map(elem => {
    const checkbox = elem.querySelector("input[type='checkbox']") as HTMLInputElement
    console.log(checkbox)
    return {
        container: elem as HTMLElement,
        checkbox: checkbox,
        key: elem.getAttribute("data-setting-var") as keyof Settings,
    }
})

// Load settings
chrome.storage.sync.get(["settings", "theme"], result => {
    const settings: Settings = result.settings
    if (!settings) return

    // load input settings
    mainDomainInput.value = settings.main_domain
    newsRssFeedInput.value = settings.news_rss_feed

    // load checkbox settings
    settingCheckboxes.forEach(({ checkbox, key }) => {
        if (key in settings) {
            checkbox.checked = settings[key] as boolean
        }
    })

    // Load saved theme or default to light
    const saved_theme = (result.theme as string) || "light"
    applyTheme(saved_theme)
})

// Theme toggle functionality
themeToggle.addEventListener("click", e => {
    e.stopImmediatePropagation()
    const current_theme = document.body.getAttribute("data-theme") || "light"
    const new_theme = current_theme === "light" ? "dark" : "light"

    chrome.storage.sync.set({ theme: new_theme })

    applyTheme(new_theme)
})

// Apply theme to document
function applyTheme(theme: string) {
    if (theme === "dark") {
        document.body.setAttribute("data-theme", "dark")
    } else {
        document.body.removeAttribute("data-theme")
    }
}

// Save settings function
const saveSettings = () => {
    // save input settings
    let settings: Settings = {
        main_domain: mainDomainInput.value,
        news_rss_feed: newsRssFeedInput.value,
    }

    // save checkbox settings
    settingCheckboxes.forEach(({ checkbox, key }) => {
        settings[key] = checkbox.checked
    })

    chrome.storage.sync.set({ settings })
}

// Add event listeners for autosave
mainDomainInput.addEventListener("input", saveSettings)
newsRssFeedInput.addEventListener("input", saveSettings)

settingCheckboxes.forEach(({ checkbox }) => {
    checkbox.addEventListener("change", saveSettings)
})

// Tab switching logic
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"))
        tab.classList.add("active")

        const targetTab = tab.getAttribute("data-tab")
        tabContents.forEach(content => {
            content.classList.remove("active")
            if (content.id === targetTab) {
                content.classList.add("active")
            }
        })
    })
})
