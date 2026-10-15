# Color schemes

The page follows the visitor's system setting. Dark is the default. A `prefers-color-scheme: light` override swaps the Graphite tokens. There is no manual toggle and no orange.

## Sub-features

- `scheme-dark` shows the dark palette by default: background `#101112`, primary text `#e9e9eb`, button fill `#e9e9eb` with text `#101112`.
- `scheme-light` shows the light palette when the system prefers light: background `#f4f4f5`, primary text `#17181a`, button fill `#17181a` with text `#ffffff`.
- `scheme-links` draw content links in the primary text color with a 1px underline. Nav links use the secondary text color and are not underlined.
- `scheme-theme-color` matches the browser chrome color to the background in each scheme.

## How to get to it (user POV)

- Set the operating system or browser appearance to dark or light, then load the page.

## Driving it with drive.mjs

Preconditions:

- `site.sh doctor` exits 0.

- **Emulate both schemes.** Run `node .cursor/skills/verify-ryanthomas-ai/scripts/drive.mjs http://127.0.0.1:8123/ "$EVIDENCE_DIR"`. The lines `dark palette` and `light palette` print `PASS`. The body background is `rgb(16, 17, 18)` in dark and `rgb(244, 244, 245)` in light.
- **Check the button colors.** `report.json` has `btnBg` and `btnColor` for each scheme. Dark button is `rgb(233, 233, 235)` with `rgb(16, 17, 18)` text. Light button is `rgb(23, 24, 26)` with `rgb(255, 255, 255)` text. The `dark button` and `light button` lines print `PASS`.
- **Check link colors.** The `primary link color` and `nav link color` lines print `PASS`. Content links are underlined. Nav links are not.
- **Check theme-color.** Run `rg -n 'name="theme-color"' index.html`. The dark tag uses `#101112` and the light tag uses `#f4f4f5`, which equal `--bg` in each scheme.
- **Check for retired orange.** Run `rg -n "efa16f|ffb37e|a8470b|ff945b" index.html`. There are no matches.
- **Check reduced motion.** The `reduced motion: hero animation off` line prints `PASS`, and the duration lines are `0s` or `0ms`.
- **Proof.** Read `dark-1280.png` and `light-1280.png`. The button is light on the dark page and dark on the light page.

## Gotchas

- The `theme-color` meta values are hard-coded, so a change to `--bg` must also change them.
- The drive checks assert the current Graphite values. A deliberate palette change needs a matching edit to `scripts/drive.mjs` in the same PR.
- Headless Chrome defaults to light. Always emulate both schemes explicitly, as `drive.mjs` does.
