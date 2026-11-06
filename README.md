# Hollowgate Block War

A vertical, two-sided lane battler in the spirit of Clash Royale and Lego Star Wars Battles, drawn in a flat, cel-shaded, Archer-style look. Two militia crews fight over one run-down neighborhood. Plain HTML, CSS and a canvas. No build step, no dependencies, no image files: every character is drawn in code.

## Play

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Best on a phone held upright. Add to Home Screen for a fullscreen app.

## How it works

- You are Eastside Watch (blue, bottom). The AI is Rust Road Militia (red, top).
- Each side has two outposts and an HQ. Take one outpost for a point. Burn down the HQ to win on the spot.
- Cash refills over time (doubles for the last minute). Tap a card, then tap your side of the street, or drag the card onto the field.
- Ground troops cross the canal at the two bridges. Drones fly over it.
- Three minutes, then one minute of sudden-death overtime. Easy, Normal and Hard change how fast the AI earns cash and acts.

## Cards

| Card | Cost | What it does |
| --- | --- | --- |
| Scrappers | 2 | Three fast kids with crowbars |
| Brawler | 3 | Riot shield and a bat, soaks up hits |
| Riflemen | 3 | Two shooters, hit air too |
| Gun Nest | 3 | Sandbag machine gun, fades after 30s |
| Drone | 4 | Flies over the canal, splash damage |
| Airstrike | 4 | Mortar barrage on any spot |
| Bruiser | 5 | Sledgehammer, only goes for buildings |
| Molotov | 5 | Fire splash, hits drones |

Desktop keys: `1`-`4` pick a card, `Esc` cancels, `P` pauses.

## Files

- `index.html` page shell and menu overlay
- `css/style.css` portrait layout
- `js/game.js` rules, AI, drawing for troops, buildings and UI
- `manifest.webmanifest`, `icon.svg` home-screen install

## Publish

On GitHub: Settings, Pages, deploy from branch `main`, folder `/ (root)`.
