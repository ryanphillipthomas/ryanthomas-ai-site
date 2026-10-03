# Metadata and assets

The head carries the title, description, icons, manifest link, and Open Graph and Twitter tags. Static files back the icons, install manifest, and search engine hints.

## Sub-features

- `meta-head` has a title, description, `og:` tags, and `twitter:` tags that agree with the page copy.
- `meta-icons` serves every icon the head and manifest reference.
- `meta-manifest` is valid JSON with 192px and 512px icons.
- `meta-seo` has a `robots.txt` that allows crawling and a well-formed `sitemap.xml` for `https://ryanthomas.ai/`.

## How to get to it (user POV)

- View the page source, or share the URL to a chat app or social network.
- Add the site to a home screen.
- Request `/robots.txt` and `/sitemap.xml`.

## Driving it with shell checks

Preconditions:

- `site.sh doctor` exits 0.

- **Check head tags.** Run `rg -n 'rel="icon"|rel="apple-touch-icon"|rel="manifest"|property="og:|name="twitter:|<title>|name="description"' index.html`. The title, description, and `og:` tags match the visible copy.
- **Check assets resolve.** Run `for p in favicon.ico favicon.svg apple-touch-icon.png icon-192.png icon-512.png og-image.png manifest.webmanifest robots.txt sitemap.xml; do curl -s -o /dev/null -w "$p %{http_code}\n" http://127.0.0.1:8123/$p; done`. Every line ends in `200`.
- **Check the manifest.** Run `python3 -c "import json;m=json.load(open('manifest.webmanifest'));print(m['name'],[i['sizes'] for i in m['icons']])"`. It prints the name and `['192x192', '512x512']`.
- **Check the sitemap.** Run `python3 -c "import xml.dom.minidom as x;x.parse('sitemap.xml');print('well-formed')"`. It prints `well-formed`. `rg -n "Sitemap" robots.txt` points at the same host.
- **Proof.** Keep the command output in `$EVIDENCE_DIR/static-checks.txt`.

## Gotchas

- `drive.mjs` fails on any HTTP 4xx or 5xx during the page load, so a missing icon shows up there too.
- The Open Graph image must be an absolute `https://ryanthomas.ai/` URL, so it cannot be fetched from the local server. Check the file exists in the repo instead.
- The title and description repeat the tagline, so a copy change usually touches `index.html` in several places.
