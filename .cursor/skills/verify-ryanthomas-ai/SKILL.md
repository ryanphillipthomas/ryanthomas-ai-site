---
name: verify-ryanthomas-ai
description: Launch, drive, and prove behavior of the ryanthomas.ai static site (one index.html with inlined CSS) in headless Chrome at desktop and mobile widths, in dark and light color schemes. Use when verifying any change to index.html, page copy, metadata, assets, or styling, and for the verifier subagent's evidence.
---

# Verify ryanthomas.ai

The site is `index.html` plus static assets. There is no build, test suite, or CI, so this skill is the project's verification harness. It serves the checkout, drives it in a real browser over CDP, and writes evidence outside the repository.

Run every command from the repo root. `<skill>` below is `.cursor/skills/verify-ryanthomas-ai`.

## Launch

```bash
<skill>/scripts/site.sh start
```

This serves the checkout on `127.0.0.1:8123` with `python3 -m http.server`. It prints `ready: http://127.0.0.1:8123/` when the page answers. Set `VERIFY_PORT` to use another port. The script refuses to start if the port is already taken by something it did not start, and it never kills by process name.

## Doctor

```bash
<skill>/scripts/site.sh doctor
```

Read-only. It prints the revision and branch, the number of dirty paths, whether the server is the one this skill started, whether the served `index.html` is byte-identical to the checkout, and whether Chrome exists. Exit code 0 means worth driving. Run it first, and again whenever a result looks odd. A `MISMATCH` line means another process owns the port, so do not drive it.

## Drive

```bash
node <skill>/scripts/drive.mjs http://127.0.0.1:8123/ "$EVIDENCE_DIR" [--expect "text"]... [--absent "text"]...
```

It launches `/opt/google/chrome/chrome` headless with a fresh temp `--user-data-dir` and a private debugging port, and deletes that profile when it exits. It loads the page at 1280x720, 731x900, 730x900, and 390x844 in both `dark` and `light` (CDP viewport and `prefers-color-scheme` emulation), and prints one `PASS` or `FAIL` line per check.

Per width and scheme it checks that:

- the page has no horizontal overflow (`scrollWidth` equals the viewport width);
- the `.btn` is at least 44px tall and its `href` is a `mailto:` link;
- there is no `<script>` element;
- the layout matches the 730px breakpoint: at 731px the button is narrower than `main` and `main` padding-top is 96px, and at 730px and below the button fills `main` and padding-top is 64px;
- at 730px and below, the hero starts at the top of the column (`h1` top is 64px, the mobile padding-top);
- the body background is `rgb(16, 17, 18)` in dark and `rgb(244, 244, 245)` in light.

Once per run it checks that the console, network, and HTTP responses had no errors.

`--expect` and `--absent` assert visible copy at every width and scheme. Use them for the requirement under test, for example `--expect "Say Hello" --absent "projects will live"`. The default checks encode this page's current tokens and the 730px breakpoint. If a change intentionally alters those, update `scripts/drive.mjs` in the same PR and say so. Do not loosen a check to pass a candidate.

The script exits 1 on any failure and 0 when all pass.

Browser tools (Playwright, Chrome DevTools MCP) are an alternative for interaction, such as focus rings or hover. Check `document.documentElement.scrollWidth` against the viewport at every width. Never use headless Chrome CLI flags (`--window-size`) for width checks on macOS. They lay out narrow widths wider than requested.

Never run the `google-chrome` wrapper. It attaches to a shared browser on port 9222 and hangs.

## Evidence

Pick the directory before driving and keep it outside the repo:

```bash
EVIDENCE_DIR=/tmp/verify-ryanthomas-ai/runs/$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)
```

`drive.mjs` writes `report.json` (every check plus the measured values per width and scheme) and screenshots `dark-1280.png`, `dark-390.png`, `light-1280.png`, and `light-390.png`. Read the screenshots. A proof reports the revision, the checks that ran, the evidence path, and which feature files in `features/` were covered. A screenshot alone does not prove behavior; the `report.json` measurements do. Static files (manifest, sitemap, robots, assets) are checked with the commands in `features/metadata-and-assets.md`, not by the browser run.

## Cleanup

```bash
<skill>/scripts/site.sh stop
```

It stops the server it started, using the recorded pid, and removes `.playwright-mcp/` from the repo root. A Playwright browser tool run writes that folder into the checkout. It is git-ignored, but it still counts as a changed tree for the verifier. It keeps `/tmp/verify-ryanthomas-ai/runs/`, so evidence survives. After a failed run, run `stop` before retrying, then confirm `git status --porcelain` matches what you recorded at the start.

## Feature map

`features/README.md` is the maintained list of what to verify. Read it before choosing checks, and cover every entry point it lists for the feature under test. Keep it current with `/maintain-verification-skill`.
