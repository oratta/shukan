#!/usr/bin/env node
// Fails if a required NEXT_PUBLIC_* env is undefined or empty in the env file
// that `vercel pull` wrote. NEXT_PUBLIC_* vars are inlined into the client
// bundle at build time, so an empty value gets baked in and cannot be fixed at
// runtime (this caused the 2026-07-12 Preview 500). Run this between
// `vercel pull` and `vercel build` so an empty value fails the build instead.
//
// Usage:
//   node scripts/check-required-env.mjs <env-name|path-to-env-file>
//   node scripts/check-required-env.mjs preview      # reads .vercel/.env.preview.local
//   node scripts/check-required-env.mjs production   # reads .vercel/.env.production.local
//   node scripts/check-required-env.mjs .vercel/.env.preview.local

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';

// Keys that must be present and non-empty. Kept as an array so future required
// keys are a one-line addition.
const REQUIRED_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const arg = process.argv[2];
if (!arg) {
  console.error('✗ Missing argument. Pass an environment name (e.g. preview) or an env file path.');
  process.exit(1);
}

// Treat the argument as a file path if it looks like one, otherwise as an
// environment name mapped to `.vercel/.env.<name>.local`.
const looksLikePath = arg.includes('/') || arg.endsWith('.local');
const envPath = looksLikePath
  ? (isAbsolute(arg) ? arg : join(repoRoot, arg))
  : join(repoRoot, '.vercel', `.env.${arg}.local`);

let contents;
try {
  contents = readFileSync(envPath, 'utf8');
} catch (err) {
  console.error(`✗ Cannot read env file: ${envPath}`);
  console.error(`  ${err.message}`);
  process.exit(1);
}

// Parse KEY=VALUE lines. Values may be wrapped in single or double quotes
// (vercel pull writes double-quoted values).
const values = new Map();
for (const rawLine of contents.split('\n')) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) continue;
  const eq = line.indexOf('=');
  if (eq === -1) continue;
  const key = line.slice(0, eq).trim();
  let value = line.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  values.set(key, value);
}

const empty = REQUIRED_KEYS.filter((key) => {
  const value = values.get(key);
  return value === undefined || value === '';
});

if (empty.length > 0) {
  console.error(`✗ Required env keys are undefined or empty in ${envPath}:`);
  for (const key of empty) {
    console.error(`  ${key}`);
  }
  console.error('\nNEXT_PUBLIC_* vars are inlined into the client bundle at build');
  console.error('time. An empty value here bakes an empty string into the build and');
  console.error('cannot be recovered at runtime. Fix the Vercel env var (must not be');
  console.error('a Sensitive-typed var, which `vercel pull` returns as empty).');
  process.exit(1);
}

console.log(`✓ ${REQUIRED_KEYS.length} required env keys present and non-empty in ${envPath}.`);
