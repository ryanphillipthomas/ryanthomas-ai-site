# Hero and contact

The page is a header, a hero, a Products section, a Contact section, and a footer. The hero shows the name heading, one lead line, and a button that opens an email to the site owner. Products names Focx in plain text. Contact and the footer link to email, GitHub, and X.

## Sub-features

- `hero-heading` shows the only `h1.hero-title`, "I’m Ryan Thomas." Header wordmark files are `/marks/header-{dark,light}.svg`. Hero wordmark and rail files are `/marks/hero-{dark,light}.svg`, sized with `--hero-mark-w` (342px mobile, 640px desktop).
- `hero-lead` shows the `.lead` line under the heading.
- `hero-cta` shows the `.btn` link, labelled `Say hello`, which is a `mailto:` link to `info@ryanthomas.ai`.
- `hero-nav` links `Products` to `#products` and `Contact` to `#contact`. The header wordmark links to `/`.
- `products-copy` shows an `h2` "Products" and a `.product` block with `h3.product-name` "Focx" and `p.product-line` "AI for learning." The block is a `div`, not a link. Changing `div.product` to `a.product` with `href="https://focx.ai"` is the swap if Ryan wants the Focx line to link.
- `contact-links` shows the email, a "Follow" label, GitHub at `https://github.com/ryanphillipthomas`, and X at `https://x.com/phazebludesign`.
- `footer-copy` shows "© 2026 Ryan Thomas" plus Email, GitHub, and X.
- `hero-copy-sync` keeps the lead line identical in `meta name="description"` and the `og:description` tag.

## How to get to it (user POV)

- Open `http://127.0.0.1:8123/` at any width.
- Choose the button under the lead line, or press Tab until it is focused and press Enter.
- Choose Products or Contact in the header to move to that section.

## Driving it with drive.mjs

Preconditions:

- `site.sh doctor` exits 0.
- You know the exact copy the task requires.

- **Load and read copy.** Run `node .cursor/skills/verify-ryanthomas-ai/scripts/drive.mjs http://127.0.0.1:8123/ "$EVIDENCE_DIR" --expect "<required text>" --absent "<removed text>"`. Every width and scheme prints `PASS` for each `--expect` and `--absent` line. The built-in `visible copy` and `no placeholder copy` lines also print `PASS`.
- **Check the button.** The `mailto link intact`, `button label`, and `button meets 44px target` lines print `PASS`. `report.json` has `btnText` `Say hello` and `btnHref` `mailto:info@ryanthomas.ai` for each run.
- **Check the anchors.** The `products nav target`, `contact nav target`, `github target`, and `x target` lines print `PASS`.
- **Check copy sync.** Run `rg -n "Building useful software, one small thing at a time." index.html`. The visible lead and `meta name="description"` and `og:description` match.
- **Proof.** Read `dark-1280.png` and `light-390.png`. The heading, lead line, and button appear in that order. Products does not show a placeholder or a focx.ai link. `report.json` `hrefs` must not include `https://focx.ai`.

## Gotchas

- `--expect` matches the rendered `innerText`, so CSS `text-transform` changes what it sees. A label changed by CSS alone does not match the source text.
- The `mailto:` href proves the link target, not that a mail client opens. Report that as could not verify.
- The `og:image:alt` text is `ryanthomas: wordmark on graphite`. It is not an exact copy of the heading.
- The heading uses a typographic apostrophe. Match on `Ryan Thomas` if a search treats the apostrophe literally.
