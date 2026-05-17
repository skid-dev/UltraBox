# UltraBox

A Chrome extension for the SchoolBox LMS with integrations for the Box of Books (BoB) platform.

## Features

- Launcher: A search bar for quick access to news articles and classes, as well as textbooks from Box of Books.
    - Search through book headings in Box of Books.
- Dark theme: Dark theme for the SchoolBox website and its pages (still a work in progress)
- News Chips: Replaces boring SchoolBox tabs in the news section with much more elegant chips and a search bar.
- Announcement / Post / News Item Edit history.
- Automatic detection for the news headlines RSS feed.

### In progress

- Frequently viewed pages: quick access for pages and resources you commonly access, separated by your class periods.

## Manual installation (via pre-built package)

### For chrome and chromium based browsers

1.  Download the latest release (or a specific version you wish to install)
1.  Unzip the file
1.  Open your browsers extensions page (For chrome it's chrome://extensions)
1.  If not already enabled, click the toggle in the top to enable developer mode.
1.  A new ribbon should appear underneath the top navigation bar. Click the "Load Unpacked" button.
1.  Select the folder that was extracted earlier.

## Development

This project is built with [WXT](https://wxt.dev). Install dependencies and run the dev server (which launches Chrome with the extension auto-loaded):

```bash
# install dependencies
npm install   # or: bun install

# dev server with HMR
npm run dev

# production build (writes to .output/chrome-mv3/)
npm run build

# build a zip for Web Store submission (writes to .output/<name>-<ver>-chrome.zip)
npm run zip
```

To manually load the production build as an unpacked extension in Chrome:

1. Run `npm run build`.
2. Open `chrome://extensions/`.
3. Enable Developer Mode (top right).
4. Click "Load Unpacked" and select the `.output/chrome-mv3/` folder.

### Firefox development

Firefox builds (MV2) are also supported. WXT normalizes the MV3 manifest into
the MV2 shape automatically; the `chrome.scripting.*` API used by the background
worker is supported in Firefox 102 and later.

```bash
# dev server with HMR, launches Firefox with the extension auto-loaded
npm run dev:firefox

# production build (writes to .output/firefox-mv2/)
npm run build:firefox

# zip for AMO submission (writes to .output/<name>-<ver>-firefox.zip)
npm run zip:firefox
```

To customise the browser binary that `npm run dev` / `npm run dev:firefox`
launches (e.g. point at Firefox Developer Edition), copy
`web-ext.config.example.ts` to `web-ext.config.ts` and edit the paths. The
`web-ext.config.ts` file is gitignored — keep it local to your machine.

## License

- MIT license. Do whatever you want idrc
