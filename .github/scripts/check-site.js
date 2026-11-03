#!/usr/bin/env node
// Checks that the files the site depends on actually exist and that its data
// blocks are valid. No dependencies; run from the repo root with:
//   node .github/scripts/check-site.js
// Exits with code 1 and a message for each problem found.
//
// It also guards what the privacy page (privacy/index.html) promises: every
// page's footer links to it, its contact email appears nowhere else, and no
// page loads anything from another origin except the Google Maps embed.

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const problems = [];

function read(file) {
  try {
    return fs.readFileSync(path.join(root, file), 'utf8');
  } catch (err) {
    problems.push(`${file}: cannot read file (${err.code || err.message})`);
    return null;
  }
}

// Turn a site path like "/assets/x.png" or "styles.css" into a repo file path.
// "/" (and any folder) means that folder's index.html.
function resolveSitePath(sitePath, fromFile) {
  const clean = sitePath.split('#')[0].split('?')[0];
  if (clean === '') return null;
  const base = clean.startsWith('/') ? clean.slice(1) : path.join(path.dirname(fromFile), clean);
  const target = base === '' || clean.endsWith('/') ? path.join(base, 'index.html') : base;
  return path.normalize(target);
}

function checkExists(sitePath, fromFile, description) {
  const target = resolveSitePath(sitePath, fromFile);
  if (target === null) return;
  if (!fs.existsSync(path.join(root, target))) {
    problems.push(`${description}: "${sitePath}" does not exist (looked for ${target.split(path.sep).join('/')})`);
  }
}

// a. Every path in PRECACHE (sw.js) must exist
const sw = read('sw.js');
if (sw !== null) {
  const match = sw.match(/const\s+PRECACHE\s*=\s*\[([\s\S]*?)\]\s*;/);
  if (!match) {
    problems.push('sw.js: could not find the PRECACHE array');
  } else {
    const paths = [...match[1].matchAll(/(['"])(.*?)\1/g)].map((m) => m[2]);
    if (paths.length === 0) problems.push('sw.js: PRECACHE array is empty');
    for (const p of paths) checkExists(p, 'sw.js', 'sw.js PRECACHE');
  }
}

// b. manifest.webmanifest must be valid JSON and its icons must exist
const manifestText = read('manifest.webmanifest');
if (manifestText !== null) {
  try {
    const manifest = JSON.parse(manifestText);
    for (const icon of manifest.icons || []) {
      checkExists(icon.src, 'manifest.webmanifest', 'manifest.webmanifest icon');
    }
  } catch (err) {
    problems.push(`manifest.webmanifest: not valid JSON (${err.message})`);
  }
}

// c. The JSON-LD block in index.html must be valid JSON
const indexHtml = read('index.html');
if (indexHtml !== null) {
  const blocks = [...indexHtml.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (blocks.length === 0) problems.push('index.html: no JSON-LD block found');
  blocks.forEach((b, i) => {
    try {
      JSON.parse(b[1]);
    } catch (err) {
      problems.push(`index.html: JSON-LD block ${i + 1} is not valid JSON (${err.message})`);
    }
  });
}

// All pages: every .html file in the repo (skipping .git, node_modules, and
// .lighthouseci, where a local Lighthouse CI run saves its reports)
const SKIP_DIRS = new Set(['.git', 'node_modules', '.lighthouseci']);
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const rel = dir === '.' ? entry.name : `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}
const allFiles = walk('.');
const pages = allFiles.filter((f) => f.endsWith('.html'));
const PRIVACY_PAGE = 'privacy/index.html';
const MAPS_EMBED = 'https://www.google.com/maps/embed';

// d. Local files referenced by href or src in the pages must exist
for (const file of pages) {
  const html = file === 'index.html' ? indexHtml : read(file);
  if (html === null) continue;
  for (const m of html.matchAll(/\s(?:href|src)\s*=\s*"([^"]*)"/g)) {
    const ref = m[1].trim();
    if (ref === '' || ref.startsWith('#')) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('//')) continue; // https:, tel:, mailto:, etc.
    checkExists(ref, file, `${file} reference`);
  }
}

// e. Every page's footer links to the privacy page (the privacy page itself shows
// "Privacy" as plain text marked aria-current="page")
if (!pages.includes(PRIVACY_PAGE)) problems.push(`${PRIVACY_PAGE}: the privacy page is missing`);
for (const file of pages) {
  const html = file === 'index.html' ? indexHtml : read(file);
  if (html === null) continue;
  const footer = html.match(/<footer[\s>][\s\S]*?<\/footer>/);
  if (!footer) {
    problems.push(`${file}: no <footer> found, so there is no link to the privacy page`);
  } else if (file === PRIVACY_PAGE) {
    if (!/aria-current="page"/.test(footer[0])) problems.push(`${file}: the footer should show "Privacy" as plain text with aria-current="page"`);
    if (/href="\/privacy\/"/.test(footer[0])) problems.push(`${file}: the footer should not link to the page itself`);
  } else if (!/href="\/privacy\/"/.test(footer[0])) {
    problems.push(`${file}: the footer must link to the privacy page (href="/privacy/")`);
  }
}

// f. The privacy contact email appears on the privacy page only
const privacyHtml = read(PRIVACY_PAGE);
if (privacyHtml !== null) {
  const emails = [...new Set([...privacyHtml.matchAll(/mailto:([^"?\s]+)/gi)].map((m) => m[1].toLowerCase()))];
  if (emails.length !== 1) {
    problems.push(`${PRIVACY_PAGE}: expected exactly one contact email (mailto: link), found ${emails.length}`);
  }
  const textFile = /\.(html|css|js|json|md|ya?ml|toml|txt|xml|webmanifest)$/i;
  for (const file of allFiles) {
    if (file === PRIVACY_PAGE || file === '.github/scripts/check-site.js') continue; // this script mentions mailto: itself
    if (!(textFile.test(file) || file === 'CNAME')) continue;
    const text = read(file);
    if (text === null) continue;
    const lower = text.toLowerCase();
    if (lower.includes('mailto:')) problems.push(`${file}: contains a mailto: link; the privacy contact email may appear only on ${PRIVACY_PAGE}`);
    for (const e of emails) {
      if (lower.includes(e)) problems.push(`${file}: contains the privacy contact email; it may appear only on ${PRIVACY_PAGE}`);
    }
  }
}

// g. Nothing loads from another origin except the Google Maps embed
function isExternal(url) {
  return /^(?:https?:)?\/\//i.test(url.trim());
}
function checkNotExternal(url, file, what) {
  if (isExternal(url)) {
    problems.push(`${file}: ${what} loads from another origin (${url.trim().slice(0, 80)}); only the Google Maps embed (${MAPS_EMBED}) is allowed`);
  }
}
const LOADING_REL = /(^|\s)(stylesheet|icon|apple-touch-icon|mask-icon|manifest|preload|prefetch|modulepreload|preconnect|dns-prefetch|prerender)(\s|$)/i;
for (const file of pages) {
  const html = file === 'index.html' ? indexHtml : read(file);
  if (html === null) continue;
  // Elements that load a file: src, srcset, poster, data (<object>)
  for (const m of html.matchAll(/\s(src|srcset|poster|data)\s*=\s*"([^"]*)"/gi)) {
    const urls = m[1].toLowerCase() === 'srcset' ? m[2].split(',').map((c) => c.trim().split(/\s+/)[0]) : [m[2]];
    for (const u of urls) checkNotExternal(u, file, `<... ${m[1]}=...>`);
  }
  // <link> tags that load something (canonical, alternate, etc. only describe the page)
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = (m[0].match(/\srel\s*=\s*"([^"]*)"/i) || [])[1] || '';
    const href = (m[0].match(/\shref\s*=\s*"([^"]*)"/i) || [])[1];
    if (href !== undefined && LOADING_REL.test(rel)) checkNotExternal(href, file, `<link rel="${rel}">`);
  }
  // The map's address is loaded by app.js; it must be the Google Maps embed
  for (const m of html.matchAll(/\sdata-map-src\s*=\s*"([^"]*)"/gi)) {
    if (!m[1].trim().startsWith(MAPS_EMBED)) problems.push(`${file}: data-map-src must start with ${MAPS_EMBED}`);
  }
  // The Content-Security-Policy may name no outside address except the Maps embed
  const csp = (html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"/i) || [])[1];
  if (csp === undefined) {
    problems.push(`${file}: no Content-Security-Policy meta tag`);
  } else {
    for (const m of csp.matchAll(/(?:https?:)?\/\/[^\s;]+/gi)) {
      if (!m[0].startsWith(MAPS_EMBED)) problems.push(`${file}: the Content-Security-Policy allows another origin (${m[0]}); only ${MAPS_EMBED} is allowed`);
    }
  }
}
const stylesCss = read('styles.css');
if (stylesCss !== null) {
  for (const m of stylesCss.matchAll(/url\(\s*['"]?\s*((?:https?:)?\/\/[^)'"\s]+)/gi)) {
    problems.push(`styles.css: url() loads from another origin (${m[1]})`);
  }
  for (const m of stylesCss.matchAll(/@import\s+(?:url\()?\s*['"]?\s*((?:https?:)?\/\/[^)'"\s;]+)/gi)) {
    problems.push(`styles.css: @import loads from another origin (${m[1]})`);
  }
}

if (problems.length > 0) {
  console.error(`Site file check FAILED (${problems.length} problem${problems.length === 1 ? '' : 's'}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('Site file check passed: PRECACHE files, manifest, JSON-LD, local references, privacy links, and outside requests are all fine.');
