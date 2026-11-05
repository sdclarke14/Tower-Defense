# Hollowgate

A cartoon tower defense game in the style of Kingdom Rush. Plain HTML, CSS and a canvas. No build step and no dependencies.

## Play

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

On a phone, use landscape. Add to Home Screen for a fullscreen app.

## Controls

- Tap a stone pad to build. Tap a tower to upgrade or sell.
- Spells: tap the button, then drag and release on the map. Desktop keys: `1`, `2`, `Space`.
- Barracks soldiers block ground units. Bats fly over them, and cannons cannot hit bats.

## Files

- `index.html` page and HUD
- `css/style.css` responsive layout, touch sizing
- `js/game.js` game loop, enemies, towers, drawing
- `manifest.webmanifest`, `icon.svg` home-screen install

## Publish

On GitHub: Settings, Pages, deploy from branch `main`, folder `/ (root)`.
