# Hero and contact

The page is a header, a hero, a Products section, a Contact section, and a footer. The header is nav only. The hero shows a decorative wordmark, one heading, and a button that opens an email to the site owner. Products names Focx, the line "AI for learning.", and a focx.ai link. Contact and the footer link to email, GitHub, and X.

## Sub-features

- `hero-heading` shows the only `h1.hero-title`, "Building useful software, one small thing at a time." There is no header wordmark. Hero wordmark files are `/marks/hero-{dark,light}.svg` (viewBox 15649×2240), sized with `--hero-mark-w` (342px mobile, 640px desktop). `.hero-mark` is `aria-hidden="true"`.
- `hero-cta` shows the `.btn` link, labelled `Say hello`, which is a `mailto:` link to `info@ryanthomas.ai`. The gap from the heading to the button is `--lead-gap` (32px mobile, 48px desktop). There is no `.lead` paragraph.
- `hero-nav` links `Products` to `#products` and `Contact` to `#contact`. The header is right-aligned nav only.
- `products-copy` shows an `h2` "Products" and a `.product` block with `h3.product-name` "Focx" and `p.product-line` "AI for learning." The line stays body text. A callout link reads `focx.ai ↗` and points at `https://focx.ai`.
- `contact-links` shows the email, a "Follow" label, GitHub at `https://github.com/ryanphillipthomas`, and X at `https://x.com/phazebludesign`.
- `footer-copy` shows "© 2026 Ryan Thomas" as a muted caption link to `/`, with no underline until hover or focus, plus Email, GitHub, and X.
- `hero-copy-sync` keeps the heading sentence inside `meta name="description"` and the `og:description` tag. The `<title>` stays `Ryan Thomas`.

## How to get to it (user POV)

- Open `http://127.0.0.1:8123/` at any width.
- Choose the button under the heading, or press Tab until it is focused and press Enter.
- Choose Products or Contact in the header to move to that section.

## Driving it with drive.mjs

Preconditions:

- `site.sh doctor` exits 0.
- You know the exact copy the task requires.

- **Load and read copy.** Run `node .cursor/skills/verify-ryanthomas-ai/scripts/drive.mjs http://127.0.0.1:8123/ "$EVIDENCE_DIR" --expect "<required text>" --absent "<removed text>"`. Every width and scheme prints `PASS` for each `--expect` and `--absent` line. The built-in `visible copy` and `no placeholder copy` lines also print `PASS`.
- **Check the button.** The `mailto link intact`, `button label`, and `button meets 44px target` lines print `PASS`. `report.json` has `btnText` `Say hello` and `btnHref` `mailto:info@ryanthomas.ai` for each run.
- **Check the anchors.** The `products nav target`, `contact nav target`, `github target`, and `x target` lines print `PASS`.
- **Check copy sync.** Run `rg -n "Building useful software, one small thing at a time." index.html`. The visible heading, `meta name="description"`, and `og:description` include that sentence.
- **Proof.** Read `dark-1280.png` and `light-390.png`. The wordmark, heading, and button appear in that order. Products shows the focx.ai link. `report.json` `hrefs` includes `https://focx.ai` and `/`.

## Gotchas

- `--expect` matches the rendered `innerText`, so CSS `text-transform` changes what it sees. A label changed by CSS alone does not match the source text.
- The `mailto:` href proves the link target, not that a mail client opens. Report that as could not verify.
- The `og:image:alt` text is `ryanthomas: wordmark on graphite`. It is not an exact copy of the heading.
- The visible page does not include "I'm Ryan Thomas." The description meta may still start with "Ryan Thomas."
