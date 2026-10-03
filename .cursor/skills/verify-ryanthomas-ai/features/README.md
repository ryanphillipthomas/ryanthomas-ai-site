# ryanthomas.ai verification map

This directory is the maintained source for verifying the user-facing behavior of ryanthomas.ai. Read the index before driving the site, then use the matching feature file as the recipe.

## Baseline preconditions

- Serve the checkout with `.cursor/skills/verify-ryanthomas-ai/scripts/site.sh start` at `http://127.0.0.1:8123/`.
- Run `site.sh doctor` and require exit code 0, with the served `index.html` matching the checkout.
- Record `git status --porcelain` before the run and compare it after `site.sh stop`.
- Never drive a server this skill did not start.

## Driving conventions

- `scripts/drive.mjs` is the browser harness. It emulates four widths (1280, 731, 730, 390) and both color schemes.
- Add `--expect` and `--absent` for the copy a task requires. Treat the quoted text literally.
- Prefer visible text, the `mailto:` href, and computed styles over DOM position.
- Chrome always runs with a temp `--user-data-dir`. Never run the `google-chrome` wrapper.
- Keep evidence in `/tmp/verify-ryanthomas-ai/runs/`, never in the repo.

## Proof and skip reporting

- Capture the user action or load, and the resulting measured state, not only a screenshot.
- Record the feature ID with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped path as verified through a different one. In particular, a `mailto:` href check does not prove a mail client opens.

## Features

- [Hero and contact](./hero-and-contact.md) covers the heading, lead line, and the `Say hello` mailto button.
- [Responsive layout](./responsive-layout.md) covers the 730px breakpoint, touch target, and overflow.
- [Color schemes](./color-schemes.md) covers the dark default, the light override, and `theme-color`.
- [Metadata and assets](./metadata-and-assets.md) covers head tags, icons, manifest, sitemap, and robots.
