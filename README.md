# UltraBox

A Chrome extension for the SchoolBox LMS with integrations for the Box of Books (BoB) platform.

## Features

- Launcher: A search bar for quick access to news articles and classes, as well as textbooks from Box of Books.
   - You'll need to manually provide the RSS feed for your news headlines.
- Dark theme (Beta): Dark theme for the SchoolBox website and its pages (still a work in progress)
- News Chips: Replaces boring SchoolBox tabs in the news section with much more elegant chips and a search bar.

### Upcoming

- Frequently viewed pages: quick access for pages and resources you commonly access, separated by your class periods.
- Add automatic detection for the news headlines RSS feed.

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
