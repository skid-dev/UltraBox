export function handle_command(command: string) {
    if (command === "toggle-launcher") {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            console.log("Received command to toggle launcher, active tab:", tabs[0])
            if (tabs.length === 0 || !tabs[0].id) return

            chrome.tabs.sendMessage(tabs[0].id, { action: "launcher-enable" })
        })
    }
}
