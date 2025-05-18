# My Chrome Extension

This is a basic Chrome extension boilerplate template using TypeScript and the Bun runtime.

## Project Structure

```
my-chrome-extension
├── src
│   ├── content.ts
│   ├── background.ts
│   └── popup
│       ├── popup.html
│       └── popup.ts
├── manifest.json
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my-chrome-extension
   ```

2. **Install dependencies**:
   Make sure you have Bun installed. Then run:
   ```bash
   bun install
   ```

3. **Build the project**:
   To compile the TypeScript files, run:
   ```bash
   bun run build
   ```

4. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode".
   - Click on "Load unpacked" and select the `my-chrome-extension` directory.

## Usage

- Click on the extension icon in the Chrome toolbar to open the popup.
- The content script will automatically run on specified web pages as defined in the `manifest.json`.

## License

This project is licensed under the MIT License. See the LICENSE file for details.