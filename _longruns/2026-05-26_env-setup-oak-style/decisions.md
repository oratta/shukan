# Decisions Log — env-setup-oak-style

## D1: 2026-05-28 — インフラ run における TDD の適用範囲

**判断**: 本 run の change のうち、change-B（workflow YAML）以外（A/C/D の docs）は TDD（テスト先行）を厳密適用しない。受け入れ条件 5-14 の「ファイル存在 + 内容 grep + actionlint PASS」を Scenario の代替とする。

**理由**: plan.md でユーザー合意済みの設計。インフラ/ドキュメント type の change には Vitest 単体テストが書けないため、受け入れ条件側で検証可能性を担保している。Round 1/2 のレビュー（longrun-reviewer）でも APPROVE 済み。

**エビデンス**:
- plan.md L130-132: 「インフラ run のため、テスト = actionlint PASS + workflow 構文検証 + 既存 npm test PASS + npm run lint PASS で代替」
- baseline 確認: `npm run test:run` で既存 197 tests PASS（コマンド実行済、出力上記）

## D2: 2026-05-28 — node_modules インストールの実施

**判断**: worktree セットアップで `node_modules あり` と表示されたが実体は空（1 ファイルのみのシンボリックリンク）だったため `npm install` を実行。

**理由**: workflow yaml で `npx next build` / `vitest` などのコマンドを参照するため、ローカルで `actionlint`/`npm test`/`npx next build` が実行できる状態を作る必要がある。

**エビデンス**: `ls node_modules/.bin/vitest` が初回 not found → `npm install` 後に baseline test PASS（197 tests）。

## D3: 2026-05-28 — Build Contract Round 2 で APPROVE、6 件全件採用

**判断**: longrun-reviewer の Round 1 指摘（BLOCKER 1: Fork PR ガード、SHOULD_FIX 2: npm test step、SHOULD_FIX 3: Git Integration 切断順序、NOTE 4: change-A 独立性、SHOULD_FIX 5: TDD 適用方針、NOTE 6: setup-vercel-env.yml/e2e-tests スコープ外）を全件採用して plan.md を修正。Round 2 で APPROVE。

**理由**: 6 件すべてバイアス緩和ガード（spec違反/契約違反/事実誤認/依存順序の誤り/セキュリティ）に該当。特に BLOCKER 1 は Fork PR からの secret 漏洩経路を塞ぐセキュリティ事項のため反論余地なし。

**エビデンス**: TaskOutput a333d17f87f30c5af で Round 2 APPROVE 確認済み。
