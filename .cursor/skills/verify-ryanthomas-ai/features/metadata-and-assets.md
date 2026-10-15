# Metadata and assets

The head carries the title, description, icons, manifest link, and Open Graph and Twitter tags. Static files back the icons, install manifest, and search engine hints. The share image alt is `ryanthomas: wordmark on graphite`. The page keeps the `/manifest.webmanifest` URL.

## Sub-features

- `meta-head` has a title, description, `og:` tags, and `twitter:` tags that agree with the page copy. `og:image:alt` and `twitter:image:alt` are `ryanthomas: wordmark on graphite`.
- `meta-icons` serves every icon the head and manifest reference. The head does not link `favicon.svg`.
- `meta-manifest` is valid JSON named `ryanthomas.ai`, short name `ryanthomas`, `display` `standalone`, `start_url` `/`, theme and background `#101112`, with the 192px, 512px, and maskable icons.
- `meta-seo` has `robots` `index,follow`, a `robots.txt` that allows crawling, and a well-formed `sitemap.xml` for `https://ryanthomas.ai/`.

## How to get to it (user POV)

- View the page source, or share the URL to a chat app or social network.
- Add the site to a home screen.
- Request `/robots.txt` and `/sitemap.xml`.

## Driving it with shell checks

Preconditions:

- `site.sh doctor` exits 0.

- **Check head tags.** Run `rg -n 'rel="icon"|rel="apple-touch-icon"|rel="manifest"|property="og:|name="twitter:|<title>|name="description"|name="robots"' index.html`. The title and description match the visible lead's sentence. The manifest href is `/manifest.webmanifest`. Both image alts are `ryanthomas: wordmark on graphite`. There is no `rel="icon"` pointing at `favicon.svg`.
- **Check assets resolve.** Run `for p in favicon.ico favicon-32.png favicon-16.png favicon.svg apple-touch-icon.png icon-192.png icon-512.png icon-512-maskable.png og-image.png manifest.webmanifest robots.txt sitemap.xml fonts/oxanium/Oxanium-Variable.woff2 marks/header-dark.svg marks/header-light.svg marks/hero-dark.svg marks/hero-light.svg; do curl -s -o /dev/null -w "$p %{http_code}\n" http://127.0.0.1:8123/$p; done`. Every line ends in `200`.
- **Check the manifest.** Run `python3 -c "import json;m=json.load(open('manifest.webmanifest'));print(m['name'], m['short_name'], m['display'], m['start_url'], m['theme_color'], m['background_color'], [i['sizes'] for i in m['icons']])"`. It prints `ryanthomas.ai ryanthomas standalone / #101112 #101112 ['192x192', '512x512', '512x512']`.
- **Check indexing.** Run `rg -n 'name="robots"' index.html`. The content is `index,follow`. `rg -n "noindex" index.html robots.txt` finds nothing.
- **Check the sitemap.** Run `python3 -c "import xml.dom.minidom as x;x.parse('sitemap.xml');print('well-formed')"`. It prints `well-formed`. `rg -n "Sitemap" robots.txt` points at the same host.
- **Proof.** Keep the command output in `$EVIDENCE_DIR/static-checks.txt`.

## Gotchas

- `drive.mjs` fails on any HTTP 4xx or 5xx during the page load, so a missing icon or font shows up there too.
- The Open Graph image must be an absolute `https://ryanthomas.ai/` URL, so it cannot be fetched from the local server. Check the file exists in the repo instead.
- The title and description repeat the tagline, so a copy change usually touches `index.html` in several places. The share-image alt is the one exception: it reads `ryanthomas: wordmark on graphite`.
