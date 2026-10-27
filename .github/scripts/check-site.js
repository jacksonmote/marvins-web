#!/usr/bin/env node
// Checks that the files the site depends on actually exist and that its data
// blocks are valid. No dependencies; run from the repo root with:
//   node .github/scripts/check-site.js
// Exits with code 1 and a message for each problem found.

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

// d. Local files referenced by href or src in the pages must exist
for (const file of ['index.html', '404.html']) {
  const html = file === 'index.html' ? indexHtml : read(file);
  if (html === null) continue;
  for (const m of html.matchAll(/\s(?:href|src)\s*=\s*"([^"]*)"/g)) {
    const ref = m[1].trim();
    if (ref === '' || ref.startsWith('#')) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('//')) continue; // https:, tel:, mailto:, etc.
    checkExists(ref, file, `${file} reference`);
  }
}

if (problems.length > 0) {
  console.error(`Site file check FAILED (${problems.length} problem${problems.length === 1 ? '' : 's'}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('Site file check passed: PRECACHE files, manifest, JSON-LD, and local references are all fine.');
