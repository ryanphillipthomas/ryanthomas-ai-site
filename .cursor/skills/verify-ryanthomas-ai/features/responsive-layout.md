# Responsive layout

The page is one centered column. At 730px and below the content padding shrinks and the button fills the column. It never scrolls horizontally.

## Sub-features

- `layout-breakpoint` switches layout between 731px and 730px.
- `layout-touch-target` keeps the button at least 44px tall.
- `layout-no-overflow` keeps the page as wide as the viewport.
- `layout-fluid-type` scales the heading with the viewport without a breakpoint.

## How to get to it (user POV)

- Open the page on a desktop window wider than 730px.
- Open it on a phone or narrow window of 730px or less.

## Driving it with drive.mjs

Preconditions:

- `site.sh doctor` exits 0.

- **Run the width matrix.** Run `node .cursor/skills/verify-ryanthomas-ai/scripts/drive.mjs http://127.0.0.1:8123/ "$EVIDENCE_DIR"`. At 731px the line `desktop layout` prints `PASS`, with `main` padding-top at 96px and the button narrower than `main`. At 730px and 390px the line `mobile layout` prints `PASS`, with padding-top at 64px and the button as wide as `main`.
- **Check overflow and target size.** Every width prints `PASS` for `no horizontal overflow` and `button meets 44px target`.
- **Proof.** `report.json` holds `scrollWidth`, `innerWidth`, `btnWidth`, `mainWidth`, and `mainPaddingTop` for each run. Read `dark-390.png` and confirm the button spans the column.

## Gotchas

- The breakpoint is `max-width:730px`, so 730px is mobile and 731px is desktop. Test both sides.
- `--bp-sm` in the tokens is documentation. The media query uses a literal 730px, so changing the token does nothing.
- On macOS, headless Chrome with `--window-size` lays out narrow widths wider than requested and shows false overflow. This harness uses CDP viewport emulation instead. Keep it that way.
