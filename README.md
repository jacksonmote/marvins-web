<p align="center">
  <img src="assets/Marvins-1200x600.jpg" alt="Hand-painted Marvin for President banner" width="600">
</p>

<h1 align="center">Marvin's Greencastle Website</h1>

<p align="center">
  The source for <a href="https://marvinsgreencastle.com">marvinsgreencastle.com</a>, an unofficial website for Marvin's restaurant in Greencastle, Indiana.
</p>

<p align="center">
  <a href="https://github.com/jacksonmote/marvins-web/actions/workflows/site-checks.yml"><img src="https://github.com/jacksonmote/marvins-web/actions/workflows/site-checks.yml/badge.svg" alt="Site checks status"></a>
</p>

> **Disclaimer**: This website is an independently created informational resource and is not officially affiliated, associated, or endorsed by Marvin's restaurant in Greencastle, Indiana, or any of its owners or employees. The content provided on this site, including but not limited to the menu items, operating hours, pricing, and location details, is intended for general informational purposes only and may be subject to change without notice. Please contact Marvin's directly for the most up-to-date information.

## Features

**For visitors**

- Full menu with prices, half-size options, and a featured GCB section
- Daily specials, hours, and a Google Map that loads automatically when a visitor scrolls near the Location section, so visitors who don't scroll that far load nothing from Google (when the map does load, Google may set its own cookies)
- A short "unofficial fan site" note in the hero that links to Marvin's Facebook page for official news, alongside the full disclaimer at the bottom of the page
- Automatic dark mode that follows the device's light/dark setting (no toggle button); the printed menu stays black on white either way
- Category bar that stays pinned while scrolling the menu
- Tap-to-call buttons, including a call bar pinned to the bottom of the screen on phones
- "Get directions" buttons that open Google Maps with Marvin's as the destination
- Printable menu: the "Print the menu" button (or Ctrl+P / Cmd+P) produces a clean two-page, black-and-white menu with address, phone, and hours
- Links to Facebook, Yelp, TripAdvisor, goputnam.com, and Marvin's merchandise on Etsy
- Custom 404 page for mistyped addresses
- Installable on phones: add it to the home screen and it opens full-screen like an app, with its own Marvin's icon
- Works offline once visited: the menu, prices, and hours load with no signal (the map needs a connection)
- Install tip that shows each phone the right steps: Safari and Chrome on iPhone get Share-menu instructions, and Android gets an Install button
- In app mode, the print button is hidden since printing from a phone app is awkward

**Behind the scenes**

- Link previews (Open Graph) so shared links show the banner, title, and description
- Structured data so search engines can show hours, address, and phone
- Canonical URL, `robots.txt`, and `sitemap.xml` for search engines
- Accessibility checked with axe and Lighthouse (no issues found)
- Web app manifest and home-screen icons made from the banner
- Offline support through a service worker that always loads the live site when online, so menu and price changes show up right away
- Content Security Policy and referrer policy on both pages, so only the site's own files and the Google Maps embed can load
- Automated HTML validation, link checking, and site-file checks, run on every pull request into `main`, after every push to `main`, and weekly (see [Automated checks](#automated-checks))

## Technologies used

The site is plain HTML and CSS with no framework, no build step, and no dependencies to install.

- **HTML5** for the page structure, with semantic landmarks for accessibility
- **CSS3** for all styling: custom properties for the color palette (with an automatic dark mode through `prefers-color-scheme`), CSS Grid and Flexbox for layout, a sticky menu bar, and a print stylesheet for the printable menu
- **JavaScript** (no libraries) for the print button, the scroll-triggered map, offline support, app-mode detection, and the install tip
- **Web App Manifest** so phones can install the site to the home screen
- **Service Worker and Cache API** for offline support
- **Self-hosted web fonts** (WOFF2 files in `assets/fonts/`): Bowlby One for headings and Libre Franklin for body text. Both are licensed under the SIL Open Font License (see `assets/fonts/OFL.txt`), and nothing is loaded from Google Fonts
- **Google Maps** embed for the location map (loaded when the Location section is about to scroll into view, not on page load), and Google Maps links for directions
- **Schema.org structured data (JSON-LD)** so search engines can read hours, address, and phone
- **Open Graph and Twitter Card tags** for link previews
- **Content Security Policy and referrer policy** (meta tags on both pages) so the pages can only load their own files plus the Google Maps embed, with no inline scripts or styles
- **GitHub Actions** to run the automated checks, with each action pinned to a full commit SHA and kept current by Dependabot
- **html-validate** and **lychee** for HTML validation and link checking
- **axe** and **Lighthouse** for accessibility and performance auditing

## File structure

```
index.html                       The whole site: menu, specials, hours, location, contact
styles.css                       All styling, including the print layout; shared by index.html and 404.html
404.html                         Page shown for any address that doesn't exist
robots.txt                       Tells search engines they can crawl the site
sitemap.xml                      Lists the page for search engines
CNAME                            Points GitHub Pages at marvinsgreencastle.com
.nojekyll                        Tells GitHub Pages to serve the files as-is (no Jekyll processing)
LICENSE                          MIT license for the code (see License)
AGENTS.md                        How to work on the repo (change checklist and rules that must not break), for people and coding agents
app.js                           Print button, scroll-to-load map, offline setup, app-mode detection, and the install tip; loaded by both pages
sw.js                            Service worker: saves the site for offline use
manifest.webmanifest             App name, colors, and icons for home-screen installs
favicon.ico                      Browser-tab and Google search icon (16, 32, and 48 px)
assets/                          Banner (JPEG plus 480, 800, and 1200 px WebP versions), install-tip icon (install-tip-icon.webp), large favicon, and home-screen icons
assets/fonts/                    Self-hosted WOFF2 fonts (Bowlby One, Libre Franklin) and their OFL license
.github/workflows/site-checks.yml  Automated HTML, link, and site-file checks
.github/scripts/check-site.js    Checks offline files, manifest, structured data, and local file references
.github/dependabot.yml           Weekly pull requests when a pinned GitHub Action has an update
.github/SECURITY.md              How to report a security problem privately
.htmlvalidate.json               Settings for the HTML check
lychee.toml                      Settings for the link check
```

## Updating the site

Everything below is in `index.html` unless noted. Before opening a pull request, see the checklist and rules in [AGENTS.md](AGENTS.md).

**Menu items and prices.** Each item is a `<li>` inside its category's `<section class="category">`. Copy an existing item and change the name, description, and price. Half sizes go in a `<p class="half">` line under the description. The GCB feature block near the top of the menu has its own price, so update it too if the GCB price changes.

**Daily specials.** Each day is a `<li>` inside `<ul class="specials">`. The specials row is sized for four days in `styles.css` (`grid-template-columns: repeat(4, 1fr)`), so change that number if you add or remove a day.

**Unofficial-site notice.** The hero has a short "unofficial fan site" note (`<p class="unofficial-note">`) linking to Marvin's Facebook page, and the `print-header` block has a matching line for the printed menu. If you reword one, update the other and keep the full disclaimer in the footer.

**Colors and dark mode.** Colors in `styles.css` are custom properties named by job (`--accent-text`, `--accent-fill`, `--heading-alt`, `--bar-bg`, `--frame`, `--focus`, and so on), not by hue, because the same maroon is text in some places and a fill in others. The light values are in `:root`, and the dark values are in the `@media (prefers-color-scheme: dark)` block right below it. For any new color, use these properties (or add a new one), give it a dark value in that block, and check contrast in both modes. The `@media print` block, further down, resets every one of them to black on white so the printed menu doesn't change in dark mode, so add any new property there too. The Google map itself stays light because Google's embed has no dark version.

**Hours.** Hours appear in three places that need to match:

1. The table in the `#hours` section, which visitors see
2. The `print-header` block above the menu, which only appears on the printed menu
3. `openingHoursSpecification` in the structured data near the top of the file, which Google reads. Days left out of this list are treated as closed. Use 24-hour times, and `23:59` for midnight.

**Address or phone.** These also appear in several places: the hero and contact buttons, the pinned call bar (in both `index.html` and `404.html`), the print header, the "Get directions" links, the map, and the structured data. Search the files for the old value to find them all.

**New outside services.** The pages have a Content-Security-Policy (a `<meta http-equiv="Content-Security-Policy">` tag near the top of `<head>`) that only allows the site's own files and the Google Maps embed (only the `/maps/embed` address on google.com can be framed). If you add another embed, analytics, a font host, or anything else loaded from outside, add its address to the policy on **both** `index.html` and `404.html`, or browsers will block it. The same goes for inline scripts, inline styles, and `style="..."` attributes: put them in `app.js` or `styles.css` instead.

**Fonts.** The Bowlby One and Libre Franklin (400, 600, 700) font files are preloaded with `<link rel="preload">` tags near the top of `index.html`'s `<head>`, so the text doesn't jump when the fonts load. If you rename or replace a font file, update its preload tag, the `@font-face` rule in `styles.css`, and `PRECACHE` in `sw.js`.

**Adding images or other files.** Offline support saves a fixed list of files, set in `PRECACHE` at the top of `sw.js`. If you add a new image or file the page depends on, add it to that list and change `CACHE_VERSION` (for example, `v1` to `v2`) so phones pick up the new list. Offline support only saves files from that list. Bumping `CACHE_VERSION` also clears every phone's saved copies, which is the quick fix if a broken page was ever saved. Editing existing files, including menu and price changes, needs nothing extra.

**Banner.** The hero uses `assets/Marvins-1200x600.jpg` plus WebP copies at 480, 800, and 1200 px wide (`Marvins-480x240.webp`, `Marvins-800x400.webp`, `Marvins-1200x600.webp`) so phones download a smaller file. The JPEG is the fallback and the link-preview image. If the banner is ever replaced, regenerate all three WebP sizes (keep the 2:1 shape and the same names) as well as the JPEG. The install tip's icon (`assets/install-tip-icon.webp`, 88 px) is a resized copy of `apple-touch-icon.png`; regenerate it if that icon changes.

**Map.** The Google Maps address is stored in the `data-map-src` attribute of the `.map-frame` block in the Location section. `app.js` builds the iframe from it shortly before the section scrolls into view (or right away in browsers without IntersectionObserver). Until then a placeholder with an "Open in Google Maps" link stands in, which is also what shows without JavaScript.

**Home-screen icons.** The icons in `assets/` (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and `icon-maskable-512.png`) are crops of the banner. If you replace them, keep the same file names and sizes. The maskable version needs Marvin's face inside the center 80%, because Android trims the edges into circles and other shapes.

**Favicon.** `favicon.ico` and `assets/favicon-192.png` are a tighter crop of Marvin's face than the home-screen icons, so the glasses stay readable at tiny sizes. They're what browser tabs and Google search results show. Keep the file names the same if you replace them, since Google prefers a favicon address that doesn't change.

**Install tip wording.** The instructions for each browser are in `index.html`, in the `install-tip` block near the bottom. `app.js` decides which version each phone sees.

**After any content change**, update the `<lastmod>` date in `sitemap.xml` to the current date so search engines know to re-check the page.

## Previewing locally

Open `index.html` in any browser to check your content changes. To preview the printed menu, use your browser's Print Preview (Ctrl+P). The page links to `app.js` and the icons with paths that start with `/`, so the **Print the menu** button, offline support, and the install tip only work through the local web server below.

`404.html` uses paths that start with `/`, so it only looks right when served from a local web server. From the project folder, run:

```bash
python -m http.server
```

Then visit `http://localhost:8000/404.html`.

Offline support and the install tip also need the local web server, since browsers only allow them on `https://` sites and `localhost`. After a change, if the page looks out of date, do a hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on Mac) so the browser skips its saved copy. To test offline mode, open the page once, stop the server, and reload.

## Automated checks

The **Site checks** workflow runs on every pull request into `main` (including Dependabot's), every push to `main`, every Monday at 9 AM Eastern, and on demand (**Actions → Site checks → Run workflow**). A newer commit on a pull request cancels that PR's older run. It has three jobs:

- **HTML validation** checks `index.html` and `404.html` with [html-validate](https://html-validate.org/). Rules are set in `.htmlvalidate.json`.
- **Link check** checks every link with [lychee](https://lychee.cli.rs/), including in-page jump links like `#menu`. Settings are in `lychee.toml`. Facebook, Yelp, and TripAdvisor often block automated checkers even when their pages are fine, so those "blocked" responses are treated as OK.
- **Site files** runs `.github/scripts/check-site.js`, which fails if a file listed in `PRECACHE` (in `sw.js`) is missing, `manifest.webmanifest` or the structured data in `index.html` is not valid JSON, a manifest icon is missing, or a local file referenced by `href` or `src` in either page does not exist.

If a check fails, GitHub emails the repo owner. Open the failed run in the Actions tab to see which line or link caused it.

To run the HTML and site-file checks locally (requires Node.js):

```bash
npx html-validate index.html 404.html
node .github/scripts/check-site.js
```

The actions used by the workflow are pinned to full commit SHAs (with the version in a comment), html-validate is pinned to an exact version in the workflow (raise it by hand), and **Dependabot** (`.github/dependabot.yml`) opens a pull request each week when one has a newer release. Review and merge those like any other change; the Site checks run on them automatically.

GitHub pauses scheduled workflows after 60 days without commits. If that happens, re-enable it from the Actions tab.

## License

The code in this repository is available under the [MIT License](LICENSE). As noted at the top of that file, the license covers the code only and does not grant any rights to the Marvin's name, menu content, photographs, or other images. The font files in `assets/fonts/` are separate: they are licensed under the SIL Open Font License (see `assets/fonts/OFL.txt`).
