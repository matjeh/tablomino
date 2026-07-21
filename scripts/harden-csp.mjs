#!/usr/bin/env node
// Post-processes the Capacitor static export (out/*.html): replaces the CSP
// <meta> tag's `script-src 'unsafe-inline'` with sha256 hashes of that
// page's actual inline scripts (Next's RSC hydration payload -- static and
// deterministic per page in a static export), so the shipped app doesn't
// need 'unsafe-inline' in script-src. Run after `next build` in
// build:capacitor; not applicable to the (frozen) server build, which still
// needs 'unsafe-inline' since headers() can't vary the CSP per route here.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const OUT_DIR = 'out';
const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const UNSAFE_INLINE_SCRIPT_SRC = /script-src (&#x27;|')self(&#x27;|') (&#x27;|')unsafe-inline(&#x27;|')/;

function htmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, files);
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

let patched = 0;
for (const file of htmlFiles(OUT_DIR)) {
  let html = readFileSync(file, 'utf-8');
  const hashes = new Set();
  let m;
  INLINE_SCRIPT_RE.lastIndex = 0;
  while ((m = INLINE_SCRIPT_RE.exec(html))) {
    hashes.add(`'sha256-${createHash('sha256').update(m[1], 'utf-8').digest('base64')}'`);
  }
  if (hashes.size === 0 || !UNSAFE_INLINE_SCRIPT_SRC.test(html)) continue;
  html = html.replace(UNSAFE_INLINE_SCRIPT_SRC, `script-src 'self' ${[...hashes].join(' ')}`);
  writeFileSync(file, html);
  patched++;
}

if (patched === 0) {
  console.error("harden-csp: patched 0 files -- expected at least one (did the CSP meta tag format change?)");
  process.exit(1);
}
console.log(`harden-csp: patched ${patched} file(s), script-src now uses per-page hashes instead of 'unsafe-inline'.`);
