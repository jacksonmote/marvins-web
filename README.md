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
- Daily specials, hours, and a Google Map that loads automatically when a visitor scrolls near the Location section, so visitors who don't scroll that far load nothing from Google. The map runs in a sandbox, and Chrome, Edge, and other Chromium browsers load it without the visitor's Google cookies (other browsers may still let Google use its cookies there)
- A short "unofficial fan site" note in the hero that links to Marvin's Facebook page for official news, alongside the full disclaimer at the bottom of the page
- Automatic dark mode that follows the device's light/dark setting (no toggle button); the printed menu stays black on white either way
- Category bar that stays pinned while scrolling the menu
- Tap-to-call buttons, including a call bar pinned to the bottom of the screen on phones
- "Get directions" buttons that open Google Maps with Marvin's as the destination
- Printable menu: the "Print the menu" button (or Ctrl+P / Cmd+P) produces a clean two-page, black-and-white menu with address, phone, and hours
- Links to Facebook, Yelp, TripAdvisor, goputnam.com, and Marvin's merchandise on Etsy
- Custom 404 page for mistyped addresses
- Plain-language privacy page at `/privacy/`, linked from every page's footer: no cookies, analytics, ads, or trackers, plus what Google Maps and GitHub (the host) do.
- Accessibility statement at `/accessibility/`, linked from every page's footer next to Privacy: the goal (WCAG 2.2 Level AA), what the site does for keyboard, screen reader, zoom, and dark-mode users, its known limits (such as the Google map), and how to send feedback.
- Installable on phones: add it to the home screen and it opens full-screen like an app, with its own Marvin's icon
- Works offline once visited: the menu, prices, and hours load with no signal (the map needs a connection)
- Install tip that shows each phone the right steps: on iPhone and iPad, Safari, Chrome, and other browsers each get their own Share-menu instructions (in-app browsers such as Facebook's can't install, so they get no tip), and Android gets an Install button
- In app mode, the print button is hidden since printing from a phone app is awkward

**Behind the scenes**

- Link previews (Open Graph) so shared links show the banner, title, and description
- Structured data so search engines can show hours, address, and phone
- Canonical URL, `robots.txt`, and `sitemap.xml` for search engines
- Accessibility checked with axe and Lighthouse (no automated issues found; known limits are listed on the accessibility page)
- Lighthouse run automatically on every pull request, on phone and desktop settings, so a change that lowers a score is caught before it goes live
- Web app manifest and home-screen icons made from the banner
- Offline support through a service worker that always loads the live site when online, so menu and price changes show up right away (on a very slow connection it shows the saved copy after 4 seconds, and saves the live page when it arrives, for next time)
- Content Security Policy and referrer policy on every page, so only the site's own files and the Google Maps embed can load; the privacy and accessibility pages allow no scripts at all, and the homepage and 404 page require Trusted Types
- Automated HTML validation, link checking, and site-file checks, run on every pull request into `main`, after every push to `main`, and weekly (see [Automated checks](#automated-checks))

## Technologies used

The site is plain HTML and CSS with no framework, no build step, and no dependencies to install. The only packages the repo uses are the CI-only checking tools in `.github/tools/` (html-validate and Lighthouse CI, pinned by a lockfile), which the automated checks install; the live site never loads them, and GitHub Pages doesn't publish them.

- **HTML5** for the page structure, with semantic landmarks for accessibility
- **CSS3** for all styling: custom properties for the color palette (with an automatic dark mode through `prefers-color-scheme`), CSS Grid and Flexbox for layout, a sticky menu bar, and a print stylesheet for the printable menu
- **JavaScript** (no libraries) for the print button, the scroll-triggered map, offline support, app-mode detection, and the install tip
- **Web App Manifest** so phones can install the site to the home screen
- **Service Worker and Cache API** for offline support
- **Self-hosted web fonts** (WOFF2 files in `assets/fonts/`): Bowlby One for headings and Libre Franklin for body text. Both are licensed under the SIL Open Font License (see `assets/fonts/OFL.txt`), and nothing is loaded from Google Fonts
- **Google Maps** embed for the location map (loaded when the Location section is about to scroll into view, not on page load), and Google Maps links for directions
- **Schema.org structured data (JSON-LD)** so search engines can read hours, address, and phone
- **Open Graph and Twitter Card tags** for link previews
- **Content Security Policy and referrer policy** (meta tags on every page) so the pages can only load their own files plus the Google Maps embed, with no inline scripts or styles, plus **Trusted Types** on the pages that run `app.js`
- **GitHub Actions** to run the automated checks, with each action pinned to a full commit SHA and kept current by Dependabot
- **html-validate** and **lychee** for HTML validation and link checking
- **npm** (CI only) to install html-validate and Lighthouse CI from a lockfile in `.github/tools/`, with package install scripts blocked; Dependabot alerts cover them
- **axe** and **Lighthouse** for accessibility and performance auditing, with **Lighthouse CI** running Lighthouse automatically in GitHub Actions

## File structure

```
index.html                       The whole site: menu, specials, hours, location, contact
styles.css                       All styling, including the print layout; shared by every page
404.html                         Page shown for any address that doesn't exist
privacy/index.html               Privacy policy, served at /privacy/ (the only place the privacy contact email appears)
accessibility/index.html         Accessibility statement, served at /accessibility/
robots.txt                       Tells search engines they can crawl the site, except the repo files GitHub Pages also publishes (README, AGENTS.md, LICENSE, settings files)
sitemap.xml                      Lists the pages for search engines
CNAME                            Points GitHub Pages at marvinsgreencastle.com
.nojekyll                        Tells GitHub Pages to serve the files as-is (no Jekyll processing)
LICENSE                          MIT license for the code (see License)
AGENTS.md                        How to work on the repo (change checklist and rules that must not break), for people and coding agents
app.js                           Print button, scroll-to-load map, offline setup, app-mode detection, and the install tip; loaded by index.html and 404.html (the privacy and accessibility pages run no script)
sw.js                            Service worker: saves the site for offline use
manifest.webmanifest             App name, colors, and icons for home-screen installs
favicon.ico                      Browser-tab and Google search icon (16, 32, and 48 px)
assets/                          Banner (JPEG plus 480, 800, and 1200 px WebP versions), install-tip icon (install-tip-icon.webp), large favicon, and home-screen icons
assets/fonts/                    Self-hosted WOFF2 fonts (Bowlby One, Libre Franklin) and their OFL license
.github/workflows/site-checks.yml  Automated HTML, link, and site-file checks
.github/workflows/lighthouse.yml   Automated Lighthouse scores for the homepage, privacy page, accessibility page, and 404 page
.github/lighthouse/lighthouserc.json  Lighthouse CI settings and minimum scores (kept out of the repo root so the site doesn't publish it)
.github/scripts/check-site.js    Checks offline files, manifest, structured data, local file references, privacy and accessibility footer links, outside requests, and the Content-Security-Policy
.github/tools/package.json       CI-only tools (html-validate, Lighthouse CI) at exact versions; not part of the website
.github/tools/package-lock.json  Exact versions of those tools and everything they depend on
.github/tools/.npmrc             Makes npm skip package install scripts for these tools
.github/dependabot.yml           Weekly pull requests when a pinned GitHub Action has an update (CI tool updates are off for now; see Automated checks)
.github/SECURITY.md              How to report a security problem privately
.htmlvalidate.json               Settings for the HTML check
lychee.toml                      Settings for the link check
.gitignore                       Keeps local Lighthouse CI reports (.lighthouseci/) and installed CI tools (.github/tools/node_modules/) out of the repo
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

**New outside services.** The pages have a Content-Security-Policy (a `<meta http-equiv="Content-Security-Policy">` tag near the top of `<head>`) that only allows the site's own files and the Google Maps embed (only the `/maps/embed` address on google.com can be framed). If you add another embed, analytics, a font host, or anything else loaded from outside, add its address to the policy on **every** page (`index.html`, `404.html`, `privacy/index.html`, and `accessibility/index.html`), or browsers will block it. `check-site.js` fails if any page's policy allows an outside address other than the Google Maps embed (and if `app.js` or `sw.js` names any outside address), so update that check too, along with the privacy page (see below). The same goes for inline scripts, inline styles, and `style="..."` attributes: put them in `app.js` or `styles.css` instead.

**Stricter policies per page.** On top of that shared policy:

- `privacy/index.html` and `accessibility/index.html` run no script, so they have `script-src 'none'` and `worker-src 'none'`. If either page ever needs a script, loosen these on that page and in `check-site.js` together.
- `index.html` and `404.html` load `app.js` and require Trusted Types (`require-trusted-types-for 'script'; trusted-types marvins-sw`). In browsers that support them (Chrome, Edge, Safari), scripts can't put plain strings into risky places like `innerHTML` or `serviceWorker.register()`. `app.js` registers the service worker through a policy named `marvins-sw` that only ever allows `/sw.js`; browsers without Trusted Types use the plain path. Code that sets `innerHTML`, `outerHTML`, `document.write`, or a script's `src` from a string will be blocked, so use `textContent` and `createElement` instead, or add a narrow policy and list its name in `trusted-types` on both pages (and in `check-site.js`).
- `frame-src` is exactly the Google Maps embed on `index.html` and `'none'` everywhere else.
- `connect-src` stays `'self'` on every page even though no page fetches anything: with `'none'`, Lighthouse can't download `robots.txt` (Chrome applies the page's `connect-src` to that request), so its robots.txt audit would fail. Requests the service worker makes aren't governed by a page's policy.

**Fonts.** The Bowlby One and Libre Franklin (400, 600, 700) font files are preloaded with `<link rel="preload">` tags near the top of the `<head>` in `index.html`, `404.html`, `privacy/index.html`, and `accessibility/index.html`, so the text doesn't jump when the fonts load. If you rename or replace a font file, update its preload tags, the `@font-face` rule in `styles.css`, and `PRECACHE` in `sw.js`.

**Adding images or other files.** Offline support saves a fixed list of files, set in `PRECACHE` at the top of `sw.js`. If you add a new image or file the page depends on, add it to that list and change `CACHE_VERSION` (for example, `v1` to `v2`) so phones pick up the new list. When a page takes more than 4 seconds to load, the service worker shows the saved copy, keeps the request going, and saves the live copy when it arrives, so a slow connection doesn't keep showing an old menu. Offline support only saves files from that list, one copy of each: a visit with a query string (such as `?fbclid=` from Facebook or `?utm_source=`) updates that same copy instead of adding a new one. Bumping `CACHE_VERSION` also clears every phone's saved copies, which is the quick fix if a broken page was ever saved. Editing existing files, including menu and price changes, needs nothing extra.

**Banner.** The hero uses `assets/Marvins-1200x600.jpg` plus WebP copies at 480, 800, and 1200 px wide (`Marvins-480x240.webp`, `Marvins-800x400.webp`, `Marvins-1200x600.webp`) so phones download a smaller file. The JPEG is the fallback and the link-preview image. If the banner is ever replaced, regenerate all three WebP sizes (keep the 2:1 shape and the same names) as well as the JPEG. The install tip's icon (`assets/install-tip-icon.webp`, 88 px) is a resized copy of `apple-touch-icon.png`; regenerate it if that icon changes.

**Map.** The Google Maps address is stored in the `data-map-src` attribute of the `.map-frame` block in the Location section. `app.js` builds the iframe from it shortly before the section scrolls into view (or right away in browsers without IntersectionObserver). Until then a placeholder with an "Open in Google Maps" link stands in, which is also what shows without JavaScript. The iframe gets `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"`, which lets the map run as Google's own site and open Google Maps in a new tab, but not submit forms, start downloads, show dialogs, or navigate this page away. These four are the smallest set that keeps the map working: without `allow-same-origin`, Google's map code throws errors (the frame still can't touch this site, since it's a different origin), and without `allow-popups-to-escape-sandbox`, "Open in Maps" opens a broken page. It also gets `credentialless`, so Chromium browsers load it without the visitor's Google cookies (other browsers ignore it). There is no `referrerpolicy` on it: `no-referrer` would drop the `Referer` header, but Chromium and Safari still tell the map which site it's on (`location.ancestorOrigins`), so it wouldn't hide anything. If you change these attributes, re-test the map (zoom, pan, "Open in Maps") in Chrome, Firefox, and Safari, check the console for errors from inside the map, and update the privacy page's "The map" section if what Google receives changes.

**Home-screen icons.** The icons in `assets/` (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and `icon-maskable-512.png`) are crops of the banner. If you replace them, keep the same file names and sizes. The maskable version needs Marvin's face inside the center 80%, because Android trims the edges into circles and other shapes.

**Favicon.** `favicon.ico` and `assets/favicon-192.png` are a tighter crop of Marvin's face than the home-screen icons, so the glasses stay readable at tiny sizes. They're what browser tabs and Google search results show. Keep the file names the same if you replace them, since Google prefers a favicon address that doesn't change.

**Install tip wording.** The instructions for each browser are in `index.html`, in the `install-tip` block near the bottom. `app.js` decides which version each phone sees.

**Privacy page.** `privacy/index.html` is a plain-language policy that has to stay true. If a change adds a script, analytics, cookies, storage, an embed, or any third-party request, update the privacy page text and its "Last updated" date (the `<time datetime>` element) in the same pull request, and set the `privacy/` `<lastmod>` in `sitemap.xml` to match. The privacy contact email appears on that page only, never in the footer, README, or elsewhere. Every page's footer links to `/privacy/` (the privacy page shows "Privacy" as plain text with `aria-current="page"`), and `check-site.js` fails if a footer link is missing, the email shows up on another page, or a page loads anything from another origin besides the Google Maps embed. Its Contact heading has `id="contact"`, because the accessibility page links to `/privacy/#contact`.

**Accessibility page.** `accessibility/index.html` is a plain-language accessibility statement that also has to stay true. It states a goal (WCAG 2.2 Level AA) and never claims the site is "compliant", "conforms", or is "fully accessible". Update it when a change affects how people use the site: a new embed, a new interactive feature (a button, pop-up, form, or anything else people use), a new known limit, or a fix for one listed under "Known limits". In the same pull request, update its "Last reviewed" date (the `<time datetime>` element) and set the `accessibility/` `<lastmod>` in `sitemap.xml` to match. The page says fuller checks are done by hand at each review, so before changing that date, run axe (WCAG 2.2 AA and best-practice) on every page in light and dark mode, Tab through every page to check the focus outline, and check each page at 320 px wide and at 200% zoom for sideways scrolling. It sends feedback to the Contact section of the privacy page instead of naming an email address, because the privacy contact email appears only on the privacy page. Every page's footer links to `/accessibility/` next to `/privacy/` (the accessibility page shows "Accessibility" as plain text with `aria-current="page"`), and `check-site.js` fails if that link is missing.

**Repo files and search engines.** GitHub Pages publishes every file in the repo except the `.github/` folder, so `README.md`, `AGENTS.md`, `LICENSE`, `CNAME`, `lychee.toml`, `.htmlvalidate.json`, `.gitignore`, `.nojekyll`, and `assets/fonts/OFL.txt` can all be opened on the live site. `robots.txt` asks search engines not to crawl them, with one `Disallow` line each, and allows everything else. If you add another file that isn't part of the site outside `.github/`, add a `Disallow` line for it too. Never disallow the pages, `styles.css`, `app.js`, or the images and fonts, since search engines need them to see the pages properly. `Disallow` only stops crawling: it doesn't guarantee a file never shows up in search results (a search engine can still list an address it finds linked elsewhere, without its contents). Pages can't send the `X-Robots-Tag` header, and Markdown files can't carry a robots `<meta>` tag, so `robots.txt` is the only option here.

**After any content change**, update the `<lastmod>` date in `sitemap.xml` to the current date so search engines know to re-check the page.

## Previewing locally

Open `index.html` in any browser to check your content changes. To preview the printed menu, use your browser's Print Preview (Ctrl+P). The page links to `app.js` and the icons with paths that start with `/`, so the **Print the menu** button, offline support, and the install tip only work through the local web server below.

`404.html`, `privacy/index.html`, and `accessibility/index.html` use paths that start with `/`, so they only look right when served from a local web server. From the project folder, run:

```bash
python -m http.server
```

Then visit `http://localhost:8000/404.html`, `http://localhost:8000/privacy/`, or `http://localhost:8000/accessibility/`.

Offline support and the install tip also need the local web server, since browsers only allow them on `https://` sites and `localhost`. After a change, if the page looks out of date, do a hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on Mac) so the browser skips its saved copy. To test offline mode, open the page once, stop the server, and reload.

## Automated checks

The **Site checks** workflow runs on every pull request into `main` (including Dependabot's), every push to `main`, every Monday at 13:00 UTC (9 AM Eastern during daylight saving time, 8 AM otherwise), and on demand (**Actions → Site checks → Run workflow**). A newer commit on a pull request cancels that PR's older run. It has three jobs:

- **HTML validation** checks `index.html`, `404.html`, `privacy/index.html`, and `accessibility/index.html` with [html-validate](https://html-validate.org/). Rules are set in `.htmlvalidate.json`.
- **Link check** checks every link with [lychee](https://lychee.cli.rs/), including jump links like `#menu` and `/privacy/#contact`. Settings are in `lychee.toml`, and the lychee version is pinned in the workflow (see [CI tools and updates](#ci-tools-and-updates)). Facebook, Yelp, and TripAdvisor often block automated checkers even when their pages are fine, so those "blocked" responses are treated as OK.
- **Site files** runs `.github/scripts/check-site.js`, which fails if a file listed in `PRECACHE` (in `sw.js`) is missing, `manifest.webmanifest` or the structured data in `index.html` is not valid JSON, a manifest icon is missing, or a local file referenced by `href` or `src` in a page does not exist. It also fails if a page's footer doesn't link to both `/privacy/` and `/accessibility/` (on those two pages, the page's own entry must be plain text marked `aria-current="page"` instead of a link), the privacy contact email appears anywhere but the privacy page, or a page (or `styles.css`) loads something from another origin other than the Google Maps embed. The local-file and outside-origin checks, and the Content-Security-Policy check below, read attributes however they're quoted (`"..."`, `'...'`, or no quotes); the footer and structured-data checks expect double quotes, and the footer check ignores anything inside HTML comments. It also fails if a page's Content-Security-Policy is missing, allows a wildcard (`*`), a whole scheme (`https:`, `http:`, `data:`, `blob:`), any keyword containing `unsafe` (such as `'unsafe-inline'` or `'wasm-unsafe-eval'`), or any source other than `'self'`, `'none'`, and the Google Maps embed (allowed in `frame-src` only), sets the same directive twice, or lacks `object-src 'none'`, `base-uri 'self'`, or `form-action 'none'`. It also requires each page's stricter values (see "Stricter policies per page" under [Updating the site](#updating-the-site)), so they can't quietly loosen: `frame-src` exactly the Maps embed on the homepage and `'none'` elsewhere, Trusted Types with only the `marvins-sw` policy on the homepage and 404 page, and `script-src 'none'` and `worker-src 'none'` on the privacy and accessibility pages. Finally, it fails if `app.js` or `sw.js` names an outside address anywhere, comments included, other than the Google Maps embed. It skips the `.git`, `node_modules`, and `.lighthouseci` folders.

If a check fails, GitHub emails the repo owner. Open the failed run in the Actions tab to see which line or link caused it.

To run the HTML and site-file checks locally (requires Node.js), first install the CI tools from the project folder. Do this once, and again whenever `.github/tools/package-lock.json` changes:

```bash
npm ci --ignore-scripts --prefix .github/tools
```

Then:

```bash
.github/tools/node_modules/.bin/html-validate index.html 404.html privacy/index.html accessibility/index.html
node .github/scripts/check-site.js
```

### CI tools and updates

The website has no dependencies, but the checks do. html-validate and Lighthouse CI are listed at exact versions in `.github/tools/package.json`, and `.github/tools/package-lock.json` pins every package they depend on, each with a checksum. The workflows install them with `npm ci --ignore-scripts --prefix .github/tools` and run that installed copy (never `npx`), so every run uses exactly the locked versions. The packages underneath html-validate and Lighthouse CI stay at their locked versions until one of those two is updated. Package install scripts are blocked three ways: the `--ignore-scripts` flag, `ignore-scripts=true` in `.github/tools/.npmrc`, and `npm_config_ignore_scripts` in each job. So installing the tools never runs code from a package. It also means Lighthouse CI doesn't download its own browser; it uses the Chrome already installed on GitHub's machines (or on your computer, locally). `.github/tools/package.json` has no `scripts` section, and GitHub Pages doesn't publish the `.github` folder.

The actions used by the workflows (Site checks and Lighthouse) are pinned to full commit SHAs, with the version in a comment. Each week, **Dependabot** (`.github/dependabot.yml`) opens a pull request when a pinned action has a newer release that has been out for at least 7 days. To review one, check that it changes only the pinned SHA and version comment, read the release notes it links to, and merge it if the Site checks and Lighthouse runs pass.

**lychee.** The Link check job's action (`lycheeverse/lychee-action`) downloads the lychee program itself when it runs, so the lychee version is set in `.github/workflows/site-checks.yml` (`lycheeVersion: v0.24.2`) instead of being left to the action's default, and Dependabot doesn't change it. When Dependabot updates the action, open its `action.yml` at the new version, find the default under `lycheeVersion`, and if it's newer, raise `lycheeVersion` to match in the same pull request (or a follow-up), after checking that the lychee release is at least 14 days old. lychee is given no GitHub token (`token: ""`); it only uses one to avoid GitHub's rate limits, and the site's few github.com links stay well under them. If the Link check ever starts failing on github.com links, remove the `token` line so the action passes the job's read-only token again.

**Updating the CI tools by hand.** Dependabot can't open pull requests for the tools right now: GitHub rejects the pull requests it tries to open for `.github/tools/`. So its version updates for the tools are turned off (`open-pull-requests-limit: 0`). Dependabot alerts still cover the lockfile, so known security problems in the tools show up under the repo's **Security** tab. Dependabot still tries to open a security fix for a new alert, and that attempt shows up as a failed Dependabot run in the Actions tab. That failure is expected; make the update by hand instead. When there's a newer release, or an alert that a newer release fixes:

1. With the tools installed (see above), check what's newer and when each release came out:

   ```bash
   npm outdated --prefix .github/tools
   npm view @lhci/cli time --json
   npm view html-validate time --json
   ```

   Wait until a release has been out for at least 14 days, since a bad release is usually caught and withdrawn by then. The one exception is a release that fixes a serious security alert; that can go ahead sooner, after reading its release notes.

2. On a new branch, set the new exact version (no `^`) in `.github/tools/package.json`, then update the lockfile with Node.js 22, the version CI uses. This doesn't run any package scripts:

   ```bash
   npm install --ignore-scripts --prefix .github/tools
   ```

3. Read the release notes, check that only `.github/tools/package.json` and `package-lock.json` changed, run the checks locally (above and under [Lighthouse](#lighthouse)), and open a pull request. If a Lighthouse CI update changes the scores, compare its reports with `main` before merging.

Never change versions in `package-lock.json` by editing it directly, and don't add `overrides` to force a dependency outside the range its parent package asks for.

GitHub pauses scheduled workflows after 60 days without commits. If that happens, re-enable it from the Actions tab.

### Lighthouse

The **Lighthouse** workflow runs [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) on every pull request into `main`, every push to `main`, and on demand (**Actions → Lighthouse → Run workflow**). It serves the repo as a static site and tests `/`, `/privacy/`, `/accessibility/`, and `/404.html` three times each, once with phone settings and once with desktop settings. A run fails if, for any page:

- Accessibility, Best Practices, or SEO is below 100
- Performance is below 90 (below 100 only shows a warning, since GitHub's machines vary from run to run)
- Cumulative Layout Shift is above 0.1

Settings and minimum scores are in `.github/lighthouse/lighthouserc.json`. On the 404 page only, one SEO audit is turned off: "is crawlable", since that page is `noindex` on purpose. Lighthouse's full-page screenshot is turned off because taking it scrolls the whole page into view, which would load the Google map. The reports (HTML and JSON) are attached to each run as artifacts for 14 days (open the run and look under **Artifacts**). They are never uploaded to a public report server.

To run it locally (requires Node.js and Chrome), first install the CI tools from the project folder with `npm ci --ignore-scripts --prefix .github/tools` (see [Automated checks](#automated-checks)). Then:

```bash
.github/tools/node_modules/.bin/lhci collect --config=.github/lighthouse/lighthouserc.json --url=http://localhost/ --url=http://localhost/privacy/ --url=http://localhost/accessibility/
.github/tools/node_modules/.bin/lhci collect --config=.github/lighthouse/lighthouserc.json --additive --url=http://localhost/404.html --collect.settings.skipAudits=is-crawlable
.github/tools/node_modules/.bin/lhci assert --config=.github/lighthouse/lighthouserc.json
```

Add `--collect.settings.preset=desktop` to both `collect` commands for desktop settings. To save the HTML and JSON reports to `.lighthouseci/reports/`, also run `.github/tools/node_modules/.bin/lhci upload --config=.github/lighthouse/lighthouserc.json`. Everything goes in `.lighthouseci/`, which git ignores and the site-file check skips. The Lighthouse CI version is set by `.github/tools/package-lock.json` (see [CI tools and updates](#ci-tools-and-updates)).

## License

The code in this repository is available under the [MIT License](LICENSE). As noted at the top of that file, the license covers the code only and does not grant any rights to the Marvin's name, menu content, photographs, or other images. The font files in `assets/fonts/` are separate: they are licensed under the SIL Open Font License (see `assets/fonts/OFL.txt`).
