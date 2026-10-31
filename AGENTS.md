# AGENTS.md

How to work on this repo, for any person or coding agent.

## What this is
Unofficial fan website for Marvin's restaurant in Greencastle, Indiana: plain HTML, CSS, and JavaScript with no build step and no dependencies, served by GitHub Pages. It is not affiliated with the restaurant. See README.md for features ("Features"), file layout ("File structure"), how to change content ("Updating the site"), and local preview ("Previewing locally").

## Checklist for every change
1. Branch from the latest `main`. One PR per change.
2. Run the same checks CI runs:
   - `npx html-validate index.html 404.html`
   - `node .github/scripts/check-site.js`
   - The link check (lychee, config in `lychee.toml`) runs in CI only.
3. For visible changes, preview over `python -m http.server` (opening files from disk won't load `app.js`) at phone and desktop widths, in light and dark mode, and in Print Preview. Stop the server afterward.
4. Light mode must stay pixel-identical unless the change is meant to alter it.
5. Keep Lighthouse at 100 (desktop and mobile) with CLS about 0. Compare against `main` on the same server; a local Python server reads about 2 points low on mobile.
6. Update README.md in the same PR when features, technologies, file structure, or how-to notes change.
7. After content changes, update `<lastmod>` in `sitemap.xml`.
8. If you add a file the page depends on (image, font, etc.), add it to `PRECACHE` in `sw.js` and bump `CACHE_VERSION`.
9. Keep each file's line endings as they are (`git ls-files --eol`): CRLF for index.html, 404.html, styles.css, app.js, sw.js, robots.txt, sitemap.xml, and assets/fonts/OFL.txt; LF for everything else. Edit with byte-safe tools; a tool that rewrites whole files can change line endings or empty a file.

## Invariants (never break)
- **Disclaimer.** The footer disclaimer stays on every page. The hero "unofficial fan site" note and the matching print-header line stay too; if one is reworded, update the other.
- **No third-party requests** except the Google Maps embed, which loads only when the Location section is about to scroll into view. Fonts are self-hosted WOFF2; never use Google Fonts. The three Libre Franklin fonts are preloaded in `index.html`; if a font file is renamed, update the preloads, `@font-face`, and `PRECACHE`.
- **Strict CSP** (meta tag) on both pages. `index.html` allows the Maps iframe; `404.html` has `frame-src 'none'`. No inline scripts, inline styles, `style=""` attributes, or inline event handlers: put code in `app.js` and styling in `styles.css`. Any new outside service (embed, analytics, font host) must be added to the CSP on both pages.
- **Numbers that must match everywhere:**
  - GCB price: the feature block at the top of the menu and the Sandwiches list.
  - Hours: the `#hours` table, the print-header block, and `openingHoursSpecification` in the structured data.
  - Address and phone: hero, contact, call bar (both pages), print header, directions links, map, structured data. Search for every instance.
- **Colors** are custom properties named by job (`--accent-text`, `--accent-fill`, `--heading-alt`, ...). Light values live in `:root`, dark values in the `prefers-color-scheme` block right below it. A new color needs both, plus a reset in `@media print` (the printed menu stays black on white). Dark mode is automatic: no toggle, no JS. Known limits: the Google map stays light, and manifest colors are light-only.
- **Print layout:** the printed menu stays at two pages, black on white.
- **Offline:** `sw.js` is network-first, and its `PRECACHE` list must match the real files (CI checks this).
- **Non-commercial:** no ads, affiliate links, donations, or sales. Do not copy reviews from other sites; summarize in your own words or use testimonials with permission.
- **Nothing private** in the repo: no credentials, personal details, local paths, plans, or notes, and no operational details about accounts or monitoring.

## Repo hygiene
- Commit only project files.
- GitHub Actions are pinned to full commit SHAs with a version comment (`# v1.2.3`). Dependabot keeps them current.
- Workflows use `pull_request`, never `pull_request_target`, with minimal `permissions`.
- Do not add dependencies or a build step.

## Collaboration
- Fetch `origin` and bring your branch up to date with `main` before pushing.
- `main` takes changes only through pull requests. Required checks, by exact job name: **HTML validation**, **Link check**, **Site files**.
- A new commit on a PR cancels its older check run.
- After a merge, confirm the "pages build and deployment" and "Site checks" runs pass.
