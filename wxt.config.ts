import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: "src",
    manifest: {
        name: "UltraBox",
        description: "A Chrome extension for SchoolBox.",
        permissions: ["storage", "activeTab", "scripting", "tabs", "unlimitedStorage"],
        host_permissions: ["<all_urls>"],
        action: {
            default_title: "UltraBox",
        },
        commands: {
            "toggle-launcher": {
                suggested_key: {
                    default: "Ctrl+K",
                    mac: "Command+K",
                },
                description: "Toggle UltraBox Launcher",
            },
        },
        web_accessible_resources: [
            {
                // Unlisted scripts + CSS files dynamically injected by the
                // background via chrome.scripting.executeScript / insertCSS.
                resources: ["/*.js", "/*.css", "/schooltape/*.css"],
                matches: ["<all_urls>"],
            },
        ],
    },
})
