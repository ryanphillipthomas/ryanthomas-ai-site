# Hero and contact

The hero is the only content on the page. It shows the name heading, one lead line, and a button that opens an email to the site owner.

## Sub-features

- `hero-heading` shows the `h1` with the owner's name.
- `hero-lead` shows the `.lead` line under the heading.
- `hero-cta` shows the `.btn` link, which is a `mailto:` link to `info@ryanthomas.ai`.
- `hero-copy-sync` keeps the lead line identical in `meta name="description"` and the `og:description` tag.

## How to get to it (user POV)

- Open `http://127.0.0.1:8123/` at any width.
- Choose the button under the lead line, or press Tab once and Enter.

## Driving it with drive.mjs

Preconditions:

- `site.sh doctor` exits 0.
- You know the exact copy the task requires.

- **Load and read copy.** Run `node .cursor/skills/verify-ryanthomas-ai/scripts/drive.mjs http://127.0.0.1:8123/ "$EVIDENCE_DIR" --expect "<required text>" --absent "<removed text>"`. Every width and scheme prints `PASS` for each `--expect` and `--absent` line.
- **Check the button.** The `mailto link intact` and `button meets 44px target` lines print `PASS`. `report.json` has `btnText` and `btnHref` for each run.
- **Check copy sync.** Run `rg -n "<lead or heading text>" index.html`. Every visible occurrence that also appears in `meta name="description"`, `og:title`, or `og:description` changed together.
- **Proof.** Read `dark-1280.png` and `light-390.png`. The heading, lead line, and button appear in that order.

## Gotchas

- `--expect` matches the rendered `innerText`, so CSS `text-transform` changes what it sees. A label changed by CSS alone does not match the source text.
- The `mailto:` href proves the link target, not that a mail client opens. Report that as could not verify.
- The `og:image:alt` text is not an exact copy of the heading, so do not expect an exact repeat.
