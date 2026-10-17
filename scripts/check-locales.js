#!/usr/bin/env node

/**
 * Checks that every translation in public/locales/{lang}/common.json has
 * exactly the same keys as the English file, so no string silently falls back
 * to English and no stale keys pile up.
 *
 *   npm run i18n:check
 */

import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'public', 'locales');
const BASE = 'en';

function keysOf(value, prefix = '') {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    keysOf(child, prefix ? `${prefix}.${key}` : key)
  );
}

function load(lang) {
  const file = path.join(localesDir, lang, 'common.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const baseKeys = new Set(keysOf(load(BASE)));
let failed = false;

for (const lang of fs.readdirSync(localesDir)) {
  if (lang === BASE) continue;
  const keys = new Set(keysOf(load(lang)));
  const missing = [...baseKeys].filter(key => !keys.has(key));
  const extra = [...keys].filter(key => !baseKeys.has(key));

  for (const key of missing) console.error(`❌ ${lang}: missing ${key}`);
  for (const key of extra) console.error(`❌ ${lang}: extra ${key}`);
  if (missing.length || extra.length) failed = true;
  else console.log(`✅ ${lang}: ${keys.size} keys match ${BASE}`);
}

process.exit(failed ? 1 : 0);
