# FacMod

Browser extension for mods.factorio.com download interception.

## Structure

```
manifest.chrom.json         # Chromium MV3 (Chrome/Edge/Brave/Vivaldi)
manifest.firefox.json       # Firefox MV3 (rename to manifest.json for Firefox)
.github/workflows/
  ci.yml                    # Runs on push/PR to main: icons, web-ext lint
  release.yml               # On v* tag: icons, lint, ZIPs, GitHub Release
src/
  polyfill.js               # chrome.* → browser.* Promise shim
  content.js                # Injected on mods.factorio.com/*, injects FacMod button next to download
  background.js             # Service worker, receives messages, calls API, triggers downloads
icons/
  logo.png                  # Source icon (~512x512)
  generate.py               # Resizes logo.png → icon{16,48,128}.png
```

## Commands

```bash
python3 icons/generate.py         # Generate sized icons from logo.png
npm install -g web-ext            # Firefox linter
web-ext lint --self-hosted        # Validate Firefox extension
git tag v0.0.X && git push origin v0.0.X   # Trigger release build
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

## CI/CD

- CI validates both manifests + runs `web-ext lint` for Firefox
- Release: push tag `v*` → builds Chrome + Firefox ZIPs → creates GitHub Release
- ZIPs exclude `.git/`, `.github/`, source assets (`logo.png`, `generate.py`), docs
- Firefox ZIP uses `manifest.firefox.json` copied to `manifest.json`

## Conventions

- No external dependencies. Zero npm packages.
- ES5 syntax in content/polyfill (broader compat). Async/await OK in background (service worker).
- `data-file-id` attribute on download buttons.
- The site uses htmx — `htmx:afterSettle` listener re-injects buttons after dynamic content swaps.
