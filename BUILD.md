# FacMod - Build & Install

## Generate Icons

```bash
python3 icons/generate.py
```

## Chrome / Edge / Brave / Vivaldi

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `FacMod/` directory (uses `manifest.json`)

## Firefox

⚠️ `manifest.json` uses `service_worker` (Chrome MV3) — doesn't work in Firefox.
Use `manifest.firefox.json` (uses `background.scripts`):

```bash
cp manifest.firefox.json manifest.json   # or load it directly
```

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.firefox.json`

For permanent install: sign the add-on at https://addons.mozilla.org/

## Safari

Requires Xcode + safari-web-extension-converter:

```bash
xcrun safari-web-extension-converter FacMod/
```

This generates an Xcode project wrapping the extension. JavaScript files are shared; manifest is converted to Safari format.

## Build for Distribution

```
FacMod/
├── manifest.json            # Chrome/Edge/Brave/Vivaldi (MV3)
├── manifest.firefox.json    # Firefox (MV3)
├── src/
│   ├── polyfill.js          # Cross-browser API shim
│   ├── content.js           # Content script
│   └── background.js        # Background service worker
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

Single codebase. Firefox uses `browser` namespace natively; Chromium uses `chrome` namespace wrapped by `polyfill.js`.
