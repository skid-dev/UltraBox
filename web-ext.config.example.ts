import { defineWebExtConfig } from "wxt"

// Copy this file to `web-ext.config.ts` (gitignored) and adjust paths for your
// machine. WXT uses it to launch the browser during `wxt` / `wxt -b firefox`.
//
// See https://wxt.dev/guide/essentials/config/browser-startup.html
export default defineWebExtConfig({
    binaries: {
        chrome: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        firefox: "firefoxdeveloperedition",
    },
    startUrls: ["https://schoolbox.education/"],
})
