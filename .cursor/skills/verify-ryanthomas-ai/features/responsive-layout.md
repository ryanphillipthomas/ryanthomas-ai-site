# Responsive layout

The page is one document column with side padding. At 1024px and above the padding is `max(80px, (100vw - 1120px) / 2)`, the header is 72px, and the hero padding-top is 128px. Below 1024px the padding is 24px, the header is 64px, and the hero padding-top is 64px. The button stays at least 44px tall and does not stretch to the column width. The page never scrolls horizontally.

## Sub-features

- `layout-breakpoint` switches layout between 1024px and 1023px.
- `layout-touch-target` keeps the button at least 44px tall.
- `layout-no-overflow` keeps the page as wide as the viewport, including at 320px.
- `layout-type` uses the Graphite type roles, mobile first, switching at 1024px.

## How to get to it (user POV)

- Open the page on a desktop window of 1024px or wider.
- Open it on a phone or a window of 1023px or narrower, including 390px and 320px.

## Driving it with drive.mjs

Preconditions:

- `site.sh doctor` exits 0.

- **Run the width matrix.** Run `node .cursor/skills/verify-ryanthomas-ai/scripts/drive.mjs http://127.0.0.1:8123/ "$EVIDENCE_DIR"`. At 1280px and 1024px the line `desktop layout` prints `PASS`, with the header at 72px and the hero padding-top at 128px. At 1023px, 768px, 390px, and 320px the line `mobile layout` prints `PASS`, with the header at 64px and the hero padding-top at 64px.
- **Check overflow and target size.** Every width prints `PASS` for `no horizontal overflow` and `button meets 44px target`.
- **Proof.** `report.json` holds `scrollWidth`, `innerWidth`, `btnHeight`, `headerHeight`, and `heroPaddingTop` for each run. Read `dark-390.png` and `dark-320.png`. The button is a compact control, not a full-width bar, and nothing is cut off at the right edge.

## Gotchas

- The breakpoint is `min-width: 1024px`, so 1024px is desktop and 1023px is mobile. Test both sides.
- The old 730px optical-band check and the full-width-button check do not describe this page. Do not reintroduce them.
- On macOS, headless Chrome with `--window-size` lays out narrow widths wider than requested and shows false overflow. This harness uses CDP viewport emulation instead. Keep it that way.
