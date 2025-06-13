import { Settings } from "../types/settings"

const tabs = document.querySelectorAll(".tab-button") as NodeListOf<HTMLButtonElement>
const tabContents = document.querySelectorAll(".tab-content") as NodeListOf<HTMLElement>
const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement

const mainDomainInput = document.getElementById("mainDomain") as HTMLInputElement
const injectCssCheckbox = document.getElementById("injectCss") as HTMLInputElement
const launcherModuleCheckbox = document.getElementById("launcherModule") as HTMLInputElement
const newsRssFeedInput = document.getElementById("newsRssFeed") as HTMLInputElement
const RssPullFrequencySelect = document.getElementById("RssFetchFrequency") as HTMLSelectElement
const rss_next_pull_time = document.getElementById("rss-next-pull-time") as HTMLSpanElement

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

// Load settings
chrome.storage.sync.get(["settings", "theme"], result => {
    const settings: Settings = result.settings

    // Load saved theme or default to light
    const saved_theme = (result.theme as string) || "light"
    applyTheme(saved_theme)

    mainDomainInput.value = settings.main_domain
    injectCssCheckbox.checked = settings.inject_css
    launcherModuleCheckbox.checked = settings.launcher_module
    newsRssFeedInput.value = settings.news_rss_feed
    RssPullFrequencySelect.value = settings.rss_feed_pull_interval.toString()

    // Load last pulled time from the last time the chrome alarm was triggered
    chrome.alarms.get("rss_poll", alarm => {
        if (alarm) {
            const nextPullTime = new Date(alarm.scheduledTime)
            const now = Date.now()
            const diff_minutes = Math.floor((nextPullTime.getTime() - now) / 1000 / 60)

            let time_ago = rtf.format(diff_minutes, "minutes")

            rss_next_pull_time.textContent = `Next pull in ${time_ago}`
        }
    })
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
    const settings: Settings = {
        main_domain: mainDomainInput.value,
        inject_css: injectCssCheckbox.checked,
        launcher_module: launcherModuleCheckbox.checked,
        rss_feed_pull_interval: parseInt(RssPullFrequencySelect.value, 10),
        news_rss_feed: newsRssFeedInput.value,
    }
    chrome.storage.sync.set({ settings })
}

// Add event listeners for autosave
mainDomainInput.addEventListener("input", saveSettings)
injectCssCheckbox.addEventListener("change", saveSettings)
launcherModuleCheckbox.addEventListener("change", saveSettings)
newsRssFeedInput.addEventListener("input", saveSettings)
RssPullFrequencySelect.addEventListener("change", saveSettings)

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
