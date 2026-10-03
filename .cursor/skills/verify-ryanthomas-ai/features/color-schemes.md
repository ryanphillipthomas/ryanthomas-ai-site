# Color schemes

The page follows the visitor's system setting. Dark is the default. A `prefers-color-scheme: light` override swaps the design tokens. There is no manual toggle.

## Sub-features

- `scheme-dark` shows the dark palette by default.
- `scheme-light` shows the light palette when the system prefers light.
- `scheme-theme-color` matches the browser chrome color to the background in each scheme.

## How to get to it (user POV)

- Set the operating system or browser appearance to dark or light, then load the page.

## Driving it with drive.mjs

Preconditions:

- `site.sh doctor` exits 0.

- **Emulate both schemes.** Run `node .cursor/skills/verify-ryanthomas-ai/scripts/drive.mjs http://127.0.0.1:8123/ "$EVIDENCE_DIR"`. The lines `dark palette` and `light palette` print `PASS`. The body background is `rgb(16, 17, 18)` in dark and `rgb(244, 244, 245)` in light.
- **Check the button colors.** `report.json` has `btnBg`, `btnColor`, `bodyBg`, and `bodyColor` for each scheme. Dark button is `rgb(239, 161, 111)` and light button is `rgb(168, 71, 11)`.
- **Check theme-color.** Run `rg -n 'name="theme-color"' index.html`. The dark tag uses `#101112` and the light tag uses `#f4f4f5`, which equal `--bg` in each scheme.
- **Proof.** Read `dark-1280.png` and `light-1280.png`. Only the colors differ.

## Gotchas

- The `theme-color` meta values are hard-coded, so a change to `--bg` must also change them.
- The drive checks assert the current palette values. A deliberate palette change needs a matching edit to `scripts/drive.mjs` in the same PR.
- Headless Chrome defaults to light. Always emulate both schemes explicitly, as `drive.mjs` does.
