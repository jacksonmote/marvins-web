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
- Daily specials, hours, and an embedded Google Map
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
- Automated weekly HTML validation and link checking (see [Automated checks](#automated-checks))

## Technologies used

The site is plain HTML and CSS with no framework, no build step, and no dependencies to install.

- **HTML5** for the page structure, with semantic landmarks for accessibility
- **CSS3** for all styling: custom properties for the color palette, CSS Grid and Flexbox for layout, a sticky menu bar, and a print stylesheet for the printable menu
- **JavaScript** (no libraries) for the print button, offline support, app-mode detection, and the install tip
- **Web App Manifest** so phones can install the site to the home screen
- **Service Worker and Cache API** for offline support
- **Google Fonts**: Bowlby One for headings and Libre Franklin for body text
- **Google Maps** embed for the location map, and Google Maps links for directions
- **Schema.org structured data (JSON-LD)** so search engines can read hours, address, and phone
- **Open Graph and Twitter Card tags** for link previews
- **GitHub Actions** to run the automated checks
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
LICENSE                          MIT license for the code (see License)
app.js                           Offline setup, app-mode detection, and the install tip; loaded by both pages
sw.js                            Service worker: saves the site for offline use
manifest.webmanifest             App name, colors, and icons for home-screen installs
assets/                          Banner image, favicon, and home-screen icons
.github/workflows/site-checks.yml  Automated HTML and link checks
.htmlvalidate.json               Settings for the HTML check
lychee.toml                      Settings for the link check
```

## Updating the site

Everything below is in `index.html` unless noted.

**Menu items and prices.** Each item is a `<li>` inside its category's `<section class="category">`. Copy an existing item and change the name, description, and price. Half sizes go in a `<p class="half">` line under the description. The GCB feature block near the top of the menu has its own price, so update it too if the GCB price changes.

**Daily specials.** Each day is a `<li>` inside `<ul class="specials">`. The specials row is sized for four days in `styles.css` (`grid-template-columns: repeat(4, 1fr)`), so change that number if you add or remove a day.

**Hours.** Hours appear in three places that need to match:

1. The table in the `#hours` section, which visitors see
2. The `print-header` block above the menu, which only appears on the printed menu
3. `openingHoursSpecification` in the structured data near the top of the file, which Google reads. Days left out of this list are treated as closed. Use 24-hour times, and `23:59` for midnight.

**Address or phone.** These also appear in several places: the hero and contact buttons, the pinned call bar (in both `index.html` and `404.html`), the print header, the "Get directions" links, the map, and the structured data. Search the files for the old value to find them all.

**Adding images or other files.** Offline support saves a fixed list of files, set in `PRECACHE` at the top of `sw.js`. If you add a new image or file the page depends on, add it to that list and change `CACHE_VERSION` (for example, `v1` to `v2`) so phones pick up the new list. Editing existing files, including menu and price changes, needs nothing extra.

**Home-screen icons.** The icons in `assets/` (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and `icon-maskable-512.png`) are crops of the banner. If you replace them, keep the same file names and sizes. The maskable version needs Marvin's face inside the center 80%, because Android trims the edges into circles and other shapes.

**Install tip wording.** The instructions for each browser are in `index.html`, in the `install-tip` block near the bottom. `app.js` decides which version each phone sees.

**After any content change**, update the `<lastmod>` date in `sitemap.xml` to the current date so search engines know to re-check the page.

## Previewing locally

Open `index.html` in any browser to check your changes. To preview the printed menu, use your browser's Print Preview.

`404.html` uses paths that start with `/`, so it only looks right when served from a local web server. From the project folder, run:

```bash
python -m http.server
```

Then visit `http://localhost:8000/404.html`.

Offline support and the install tip also need the local web server, since browsers only allow them on `https://` sites and `localhost`. After a change, if the page looks out of date, do a hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on Mac) so the browser skips its saved copy. To test offline mode, open the page once, stop the server, and reload.

## Automated checks

The **Site checks** workflow runs on every push to `main`, every Monday at 9 AM Eastern, and on demand (**Actions → Site checks → Run workflow**). It has two jobs:

- **HTML validation** checks `index.html` and `404.html` with [html-validate](https://html-validate.org/). Rules are set in `.htmlvalidate.json`.
- **Link check** checks every link with [lychee](https://lychee.cli.rs/), including in-page jump links like `#menu`. Settings are in `lychee.toml`. Facebook, Yelp, and TripAdvisor often block automated checkers even when their pages are fine, so those "blocked" responses are treated as OK.

If a check fails, GitHub emails the repo owner. Open the failed run in the Actions tab to see which line or link caused it.

To run the HTML check locally (requires Node.js):

```bash
npx html-validate index.html 404.html
```

GitHub pauses scheduled workflows after 60 days without commits. If that happens, re-enable it from the Actions tab.

## Monitoring

The live site is also watched by an external uptime monitor that checks every few minutes that the page loads and still shows the "Marvin's Delivers" headline. If that headline ever changes, update the monitor's keyword to match. Domain renewal is handled through the registrar's auto-renew.

## License

The code in this repository is available under the [MIT License](LICENSE). As noted at the top of that file, the license covers the code only and does not grant any rights to the Marvin's name, menu content, photographs, or other images.
