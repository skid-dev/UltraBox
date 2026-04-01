# UltraBox

A Chrome extension for the SchoolBox LMS with integrations for the Box of Books (BoB) platform.

## Features

**SchoolTape users: Please enable __SchoolTape compatibility__ in the extension settings to ensure proper styling of elements created by modules in this extension!
| This is a temporary workaround while automatic SchoolTape detection is still work in progress.

- Launcher: A search bar for quick access to news articles and classes, as well as textbooks from Box of Books.
   - Search through book headings in Box of Books.
- Dark theme: Dark theme for the SchoolBox website and its pages (still a work in progress)
- News Chips: Replaces boring SchoolBox tabs in the news section with much more elegant chips and a search bar.
- Announcement / Post / News Item Edit history.
- Automatic detection for the news headlines RSS feed.


### In progress

- Frequently viewed pages: quick access for pages and resources you commonly access, separated by your class periods.

## Manual installation (via pre-built package)

# Builds for this extension are coming soon

### For chrome and chromium based browsers
 1. Download the latest release (or a specific version you wish to install)
 1. Unzip the file
 1. Open your browsers extensions page (For chrome it's chrome://extensions)
 1. If not already enabled, click the toggle in the top to enable developer mode.
 1. A new ribbon should appear underneath the top navigation bar. Click the "Load Unpacked" button.
 1. Select the folder that was extracted earlier.

## Development

Install dependencies using Bun:
```bash
# install dependencies
bun install

# build
bun run build
```
For development mode with file watching:
```bash
bun run dev
```

Load the `dist/` directory as an unpacked extension in Chrome to test.
1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable the Developer Mode toggle in the top right.
3. Click on "load unpacked" in the toolbar that appears.
4. Navigate to the `dist/` folder in the repository. If you don't see one, follow the instructions above to build the extension.

## License

- MIT license. Do whatever you want idrc
