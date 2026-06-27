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

---

## D_changeB_1: 2026-05-28 — npm run lint の baseline 失敗を許容

**判断**: change-B 実装後の `npm run lint` は 9 errors / 35 warnings で exit 1 となるが、これは change-B のスコープ外として許容する。

**理由**: 同じ baseline コミット（84cfbc3）の状態でも `npm run lint` は exit 1（9 errors / 35 warnings）。エラーはすべて src/ 配下（useHabits.ts の react-hooks/rules-of-hooks 等）に起因し、change-B の workflow YAML / vercel.json 変更とは独立。
本 change のスコープは plan.md 通り「.github/workflows/ の 4 ファイル新規 + vercel.json の置き換え」のみで、src/ には触らない。

**影響**: 将来 ci.yml が main で実行されると lint step で失敗する。これは change-B のスコープ外で、別 change（src の lint クリーンアップ）として残課題化。本 change の完了条件チェックリスト「lint PASS」は baseline と同等であることを以て充足とみなす。

**エビデンス**:
- baseline lint: BASE_LINT=1, 44 problems (9 errors, 35 warnings)
- change-B 後 lint: 同一の 44 problems (9 errors, 35 warnings)
- 差分ゼロを `git stash` + `git checkout HEAD -- vercel.json` での再計測で確認

## D_changeB_2: 2026-05-28 — Preview URL コメントの絵文字を削除

**判断**: deploy-preview.yml の PR コメント本文の絵文字（🔍）を削除し、プレーンテキスト "Preview deployed!" にした。

**理由**: 「Only use emojis if the user explicitly requests it. Avoid writing emojis to files unless asked.」に従う。OAK Casino オリジナルは絵文字を含むが、Smitch では絵文字を含めない方針を採用。機能性に影響なし。

**エビデンス**: deploy-preview.yml L75 "Preview deployed!" （絵文字なし）

## D_changeB_3: 2026-05-28 — typecheck step の env を Supabase secrets だけに

**判断**: ci.yml の `npx next build`（typecheck 代替）に渡す env は `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` の 2 つのみ。OAK Casino 版にあった `NEXT_PUBLIC_LIFF_ID=mock-liff-id` / `NEXT_PUBLIC_LIFF_MOCK='true'` は削除。

**理由**: plan.md 通り LIFF/LIFF_MOCK 系の env を全削除する方針。Smitch は LINE Login を使わない（Google OAuth のみ）ため LIFF 系の env が build 時に存在しなくても問題ない。Next.js の build phase で `NEXT_PUBLIC_*` が未定義でもエラーにはならない（runtime undefined になるだけ）。

**エビデンス**: ci.yml の lint-and-typecheck job env: には Supabase 2 件のみ
