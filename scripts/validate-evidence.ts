#!/usr/bin/env node
// エビデンス品質チェックの CLI。記事レジストリと習慣プリセットを検証し、
// error があれば exit 1（CI ゲート）。warning は表示のみで CI は落とさない。
//
// 使い方:
//   npm run validate:evidence            # オフライン（同期チェックのみ）
//   npm run validate:evidence -- --online  # 出典URLの到達性(HEAD)もチェック
//
// 検証ロジックの本体は src/lib/evidence/validate.ts（テストからも共有）。
// この CLI は表示と終了コードと --online の副作用だけを担う。

import { validateEvidence, collectSourceUrls, type Finding } from '@/lib/evidence/validate';

const online = process.argv.includes('--online');

function print(findings: Finding[]): void {
  const errors = findings.filter((f) => f.level === 'error');
  const warnings = findings.filter((f) => f.level === 'warning');

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}) — レビュー推奨・CIは落とさない:`);
    for (const w of warnings) {
      console.log(`  - [${w.code}]${w.article ? ` ${w.article}:` : ''} ${w.message}`);
    }
  }
  if (errors.length > 0) {
    console.error(`\n✗ Errors (${errors.length}) — 修正必須:`);
    for (const e of errors) {
      console.error(`  - [${e.code}]${e.article ? ` ${e.article}:` : ''} ${e.message}`);
    }
  }
}

async function checkOnline(): Promise<Finding[]> {
  const urls = collectSourceUrls();
  console.log(`\n🌐 --online: 出典URL ${urls.length} 件の到達性を確認中...`);
  const findings: Finding[] = [];
  // 過負荷を避けるため小さめの並列度で回す。
  const CONCURRENCY = 6;
  let i = 0;
  async function worker(): Promise<void> {
    while (i < urls.length) {
      const { article, sourceId, url } = urls[i++];
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 15000);
        let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
        // HEAD を弾くサーバ向けに GET でリトライ。
        if (res.status === 405 || res.status === 403) {
          res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
        }
        clearTimeout(timer);
        if (!res.ok) {
          findings.push({ level: 'warning', code: 'source-unreachable', article, message: `出典 id=${sourceId} の URL が ${res.status}: ${url}` });
        }
      } catch (err) {
        findings.push({ level: 'warning', code: 'source-unreachable', article, message: `出典 id=${sourceId} の URL に到達できない: ${url} (${(err as Error).message})` });
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return findings;
}

async function main(): Promise<void> {
  const findings = validateEvidence();
  if (online) {
    findings.push(...(await checkOnline()));
  }
  print(findings);

  const errorCount = findings.filter((f) => f.level === 'error').length;
  const warnCount = findings.filter((f) => f.level === 'warning').length;
  if (errorCount === 0) {
    console.log(`\n✓ evidence validation passed (${warnCount} warning${warnCount === 1 ? '' : 's'})`);
    process.exit(0);
  }
  console.error(`\n✗ evidence validation FAILED: ${errorCount} error${errorCount === 1 ? '' : 's'}`);
  process.exit(1);
}

main().catch((err) => {
  console.error('validate-evidence crashed:', err);
  process.exit(1);
});
