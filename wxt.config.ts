import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: "src",
    // Firefox MV2 build: WXT normalizes host_permissions, web_accessible_resources,
    // and action -> browser_action automatically. The `scripting` permission and
    // `chrome.scripting.*` API are supported in Firefox MV2 (Firefox 102+).
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
    // UltraBox is an existing extension (currently distributed for Chrome). The
    // Firefox data-collection consent requirement only applies to brand-new
    // listings on AMO; suppress the build-time warning until we list there.
    suppressWarnings: {
        firefoxDataCollection: true,
    },
})
