# UltraBox

A Chrome Extension for thr SchoolBox LMS with integrations for the Box of Books (BoB) platform.

## Features

- Launcher: A search bar for quick access to news articles and classes, as well as textbooks from Box of Books.
- Dark theme (Beta): Dark theme for the SchoolBox website and its pages (still work in progress)
- News Chips: replaces boring Schoolbox tabs in the news section with much more elegant chips and a search bar.

### Upcoming

- Frequently viewed pages: quick access for pages and resources you commonly access, separated by your class periods.

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

- MIT license.
