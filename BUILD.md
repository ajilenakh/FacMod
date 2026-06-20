# FacMod - Build & Install

## Generate Icons

```bash
python3 icons/generate.py
```

## Chrome / Edge / Brave / Vivaldi

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the repo root (uses `manifest.json` — copy from `manifest.chrom.json`)

## Firefox

```bash
cp manifest.firefox.json manifest.json
```

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.firefox.json`

For permanent install: sign via [addons.mozilla.org](https://addons.mozilla.org/)

## Validate

```bash
pip install Pillow
python3 icons/generate.py

npm install -g web-ext
cp manifest.firefox.json manifest.json
web-ext lint --self-hosted
```

## Release

```bash
git tag v0.0.X && git push origin v0.0.X
```

GitHub Actions builds `facmod-chrome.zip` and `facmod-firefox.zip` and creates a Release.
