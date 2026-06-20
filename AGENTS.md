# FacMod

Browser extension for mods.factorio.com download interception.

## Structure

```
manifest.json            # Chromium MV3 (Chrome/Edge/Brave/Vivaldi)
manifest.firefox.json    # Firefox MV3 (rename to manifest.json for Firefox)
src/
  polyfill.js            # chrome.* → browser.* Promise shim
  content.js             # Injected on mods.factorio.com/*, injects FacMod button next to download
  background.js          # Service worker, receives messages, calls API, triggers downloads
icons/
  logo.png               # Source icon (~512x512)
  generate.py            # Resizes logo.png → icon{16,48,128}.png
```

## Commands

```bash
python3 icons/generate.py      # Generate sized icons from logo.png
```

## Download Logic

`fileId` sent from content script = Factorio mod name (e.g. `EditorExtensions`).
Background worker:
  1. Fetches `GET /api/mods/{name}` from mods.factorio.com
  2. Sorts releases by semver, picks latest
  3. Builds URL: `https://mods-storage.re146.dev/{name}/{version}.zip`
  4. Downloads via `browser.downloads.download`

## Cross-Browser Rules

- Always use `browser.*` API (polyfill.js normalizes chrome.* → browser.* in Chromium).
- Never use `chrome.*` directly.
- Background service worker: no DOM, no `window`, no `localStorage`.
- Content script talks to background via `browser.runtime.sendMessage` only.
- Messaging contract: `{action, fileId}` → `{success, downloadUrl?, error?}`.
- Both manifests must stay in sync (permissions, scripts, version).
- Firefox uses `manifest.firefox.json`; keep as separate file, don't duplicate into `manifest.json`.

## Conventions

- No external dependencies. Zero npm packages.
- ES5 syntax in content/polyfill (broader compat). Async/await OK in background (service worker).
- `data-file-id` attribute on download buttons.
- Skeleton TODOs are placeholder stubs — fill with real logic, don't delete the structure.
