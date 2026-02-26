export function launcher_shortcut(command: string) {
    if (command === "toggle-launcher") {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs.length === 0 || !tabs[0].id) return

            chrome.tabs.sendMessage(tabs[0].id, { action: "launcher-enable" })
        })
    }
}
