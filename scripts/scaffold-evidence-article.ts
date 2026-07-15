#!/usr/bin/env node
// エビデンス記事の雛形を生成し、レジストリ（impact-articles/index.ts）に配線する。
//
// 使い方:
//   npx tsx scripts/scaffold-evidence-article.ts <article_id> "<習慣名>" [--dry-run]
//   例: npx tsx scripts/scaffold-evidence-article.ts drink_green_tea "緑茶を飲む"
//
// やること:
//   1. src/data/impact-articles/<slug>.ts を TODO 付き雛形で作成（heroImage 含む）
//   2. index.ts に import 1行 + マップ1行を挿入（--dry-run なら挿入せず表示のみ）
//
// これは「骨組み」だけを作る。リサーチ・効果値・出典・推論段落・calculationLogic は
// life-impact-article スキルの手順（Step 2〜6）に沿って人間/LLM が埋める。
// 埋め終えたら `npm run validate:evidence` と `npm test` で検証する。

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const positional = args.filter((a) => !a.startsWith('--'));
const [articleId, habitName] = positional;

if (!articleId || !habitName) {
  console.error('Usage: tsx scripts/scaffold-evidence-article.ts <article_id> "<習慣名>" [--dry-run]');
  process.exit(1);
}
if (!/^[a-z][a-z0-9_]*$/.test(articleId)) {
  console.error(`✗ article_id は snake_case（英小文字・数字・アンダースコア）で: '${articleId}'`);
  process.exit(1);
}

const slug = articleId.replace(/_/g, '-');
const camel = articleId.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const articleFile = resolve(root, 'src/data/impact-articles', `${slug}.ts`);
const indexFile = resolve(root, 'src/data/impact-articles/index.ts');

if (existsSync(articleFile)) {
  console.error(`✗ 既に存在します: ${articleFile}`);
  process.exit(1);
}

const indexSrc = readFileSync(indexFile, 'utf-8');
if (new RegExp(`\\b${articleId}:`).test(indexSrc)) {
  console.error(`✗ '${articleId}' は既に index.ts に登録済みです`);
  process.exit(1);
}

// ── 記事TSの雛形 ───────────────────────────────────────────────
// researchBody は {{health_inference}} 等のブロックプレースホルダーを含む固定テキスト、
// inferences は推論段落、calculationParams/calculationLogic は効果値と算出根拠。
// 詳細は .claude/skills/life-impact-article/references/article-template.md 参照。
const template = `import type { LifeImpactArticle } from '@/types/impact';

// TODO(evidence): life-impact-article スキルの Step 2〜6 に沿ってリサーチ・効果値・出典・
// 推論段落・calculationLogic を埋める。埋めたら \`npm run validate:evidence\` と \`npm test\`。
export const ${camel}: LifeImpactArticle = {
  habitCategory: '${articleId}',
  habitName: '${habitName}',

  article: {
    researchBody:
      // 導入（プレースホルダーなしの強い一文） + 研究紹介 + ブロックプレースホルダー
      'TODO: 導入の一文。\\n\\n' +
      'TODO: 健康面の研究紹介（固定テキスト・具体的な研究結果と出典）。\\n\\n' +
      '{{health_inference}}\\n\\n' +
      'TODO: コスト面への橋渡し。\\n\\n' +
      '{{cost_inference}}\\n\\n' +
      'TODO: 収入面への橋渡し。\\n\\n' +
      '{{income_inference}}\\n\\n' +
      '{{cumulative}}',

    // 最低1件、可能なら3件以上。author/year/journal を含める。
    sources: [
      {
        id: 1,
        text: 'TODO: Author, et al. (Year). "Title." Journal, Volume(Issue), Pages.',
        url: 'https://example.com/TODO',
      },
    ],
  },

  // 各段落: ユーザー属性の明示 → 研究との差分説明 → 調整理由 → 具体的な数値
  inferences: {
    health: 'TODO: 健康寿命の推論段落（42歳日本人男性プロフィール）。',
    cost: 'TODO: 出費削減の推論段落。',
    income: 'TODO: 収入増加の推論段落。',
    cumulative:
      'TODO: **1ヶ月続けると** … / **1年続けると** … / **10年続けると** … の累積効果。',
  },

  // 効果値（分/日・円/日）。daily × 365 が cumulative と整合すること。
  calculationParams: {
    dailyHealthMinutes: 0, // TODO
    dailyCostSaving: 0, // TODO
    dailyIncomeGain: 0, // TODO
    // 気分改善の独立した定量エビデンスがある代表記事のみ > 0（480分ベースライン × x%）。
    // 二重計上を避けるため、健康寿命で計上済みの効果は 0 のままにする。
    dailyPositiveMoodMinutes: 0,
  },

  confidenceLevel: 'medium', // high | medium | low（low は人間レビュー必須）

  // 各軸2〜4ステップ。最終ステップの result に calculationParams の数値を
  // （カンマ無しで）含めること。validate:evidence が整合を検証する。
  calculationLogic: {
    health: [
      { label: 'TODO: 研究結果', value: 'TODO' },
      { label: 'TODO: 日割り換算', formula: 'TODO', result: 'TODO分/日' },
    ],
    cost: [
      { label: 'TODO', value: 'TODO' },
      { label: 'TODO: 合計', formula: 'TODO', result: 'TODO円/日' },
    ],
    income: [
      { label: 'TODO', value: 'TODO' },
      { label: 'TODO: 合計', formula: 'TODO', result: 'TODO円/日' },
    ],
  },

  // ヒーロー画像（任意）。url はサイズクエリ(?w=..)なしのベースURL。
  // 未設定なら Discover / シートは既定グラデーションにフォールバックする。
  heroImage: {
    url: 'https://images.unsplash.com/photo-TODO',
    gradient: 'from-slate-400 to-slate-600',
  },

  defaultHabitType: 'positive', // positive | quit
  defaultIcon: 'sparkles', // lucide アイコン名
};
`;

// ── index.ts への配線 ─────────────────────────────────────────
const importLine = `import { ${camel} } from './${slug}';`;
const mapLine = `  ${articleId}: ${camel},`;

const importAnchor = "import type { LifeImpactArticle } from '@/types/impact';";
const mapAnchor = '} satisfies Record<string, LifeImpactArticle>;';

if (dryRun) {
  console.log('── [dry-run] 生成される記事TS:', articleFile);
  console.log(template);
  console.log('── [dry-run] index.ts に挿入する行:');
  console.log(`  import: ${importLine}`);
  console.log(`  map:    ${mapLine.trim()}`);
  process.exit(0);
}

if (!indexSrc.includes(importAnchor) || !indexSrc.includes(mapAnchor)) {
  console.error('✗ index.ts のアンカーが見つかりません。手動で以下を追加してください:');
  console.error(`  ${importLine}`);
  console.error(`  ${mapLine.trim()}  // マップ内に`);
  // 記事ファイルは作るが配線は手動に委ねる
  writeFileSync(articleFile, template);
  console.error(`（記事TSは作成済み: ${articleFile}）`);
  process.exit(1);
}

writeFileSync(articleFile, template);

let nextIndex = indexSrc.replace(importAnchor, `${importLine}\n${importAnchor}`);
nextIndex = nextIndex.replace(mapAnchor, `${mapLine}\n${mapAnchor}`);
writeFileSync(indexFile, nextIndex);

console.log(`✓ 作成: src/data/impact-articles/${slug}.ts`);
console.log(`✓ 配線: index.ts に import と '${articleId}' マップ行を追加`);
console.log('\n次のステップ:');
console.log('  1. 記事TSの TODO を life-impact-article スキルの手順で埋める');
console.log('  2. npm run validate:evidence');
console.log('  3. npm test');
