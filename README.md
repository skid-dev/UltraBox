# UltraBox

UltraBox is a Chrome extension that enhances the SchoolBox web platform. It injects custom CSS styles, indexes SchoolBox content, and provides a quick search launcher to access news articles and your classes. News items are periodically pulled from a configurable RSS feed and stored locally.

## Features

- Background script polls an RSS feed using `fast-xml-parser` and stores items in `chrome.storage`.
- Launcher module uses Fuse.js to search across stored items directly on the SchoolBox homepage.
- Optional CSS injection to apply extra styles to SchoolBox pages.
- Popup UI for configuring the extension: main domain, RSS feed URL, fetch frequency, and module toggles.
- Built with TypeScript and bundled with Webpack; uses Bun for scripts.

## Development

1. Install dependencies using Bun:
   ```bash
   bun install
   ```
2. Build the extension:
   ```bash
   bun run build
   ```
3. For development mode with file watching:
   ```bash
   bun run dev
   ```
4. Serve the built files locally:
   ```bash
   bun run serve-dist
   ```

Load the `dist/` directory as an unpacked extension in Chrome to test.

## Repository Layout

- **src/** – TypeScript sources for background, content, popup and utility modules.
- **dist/** – Compiled output after running the build script.
- **webpack.config.cjs** – Webpack configuration for bundling scripts and assets.

## License

UltraBox is released under the MIT license.
