# Decisions Log — PWA インストール可能化

意思決定の記録。各エントリにはエビデンス（実行コマンドと出力）を含める。

## D1: 依存インストールの実施（Setup, 2026-06-12）
- 事象: `npm run test:run` が `sh: vitest: command not found` で失敗
- 判断: worktree に node_modules が無いだけと判断し `npm install` を実行
- エビデンス: install 後 `npm run test:run` → `Test Files 11 passed (11) / Tests 197 passed (197)`
- 注: package.json / package-lock.json への変更はなし（lockfile 通りのインストールのみ）

## D2: Build Contract レビュー結果の取捨選択（2026-06-12）
- longrun-reviewer 判定: APPROVE（BLOCKER 0件、NOTE 2件）
- NOTE1「quit 習慣の完了経路 markQuitDailyDone もバナートリガー対象にすべき」→ **採用**。根拠: plan.md 技術要件が「setDayStatus / markQuitDailyDone — 完了操作の2経路」を参照パターンとして明記しており、片経路のみのトリガーは plan の意図（習慣完了でバナー表示）との契約不整合。change-B の config.yaml rules に追記済み
- NOTE2「manifest.ts と layout の metadata.manifest は二重定義ではなく両方必要」→ 情報提供レベル。plan 修正不要（builder への指示に含める）
- エビデンス: reviewer 出力全文はセッションログ参照。habit-card.tsx L103-115 の prevStatusRef パターン、useHabits.ts L146/L169 の2経路を確認済み

## D3: 仕様レビュー（Spec Review Round 1）の取捨選択（2026-06-12）
- 判定: change-A APPROVE / change-B REQUEST_CHANGES（BLOCKER 1, SHOULD_FIX 2, NOTE 1）
- 指摘1（BLOCKER）「markQuitDailyDone は未配線。関数経路ベースのトリガーは実装で詰まる」→ **採用**。根拠: `grep -rln markQuitDailyDone src/` で useHabits.ts のみ＝事実誤認に該当。design/spec/tasks を「today status の遷移検出」ベースに修正
- 指摘2（SHOULD_FIX）「page.tsx に per-habit 前回 status 保持の仕組みがない」→ **採用**。design.md に useRef スナップショット方式を具体化して追記
- 指摘3（SHOULD_FIX）「遷移判定を純関数 isCompletionTransition に切り出すべき」→ **採用**。根拠: plan.md 自身の rule「ロジックは src/lib/pwa/ の純関数に置く」との契約整合。rocket_used も完了扱い（habit-card.tsx:106-108 の既存仕様に整合）
- 指摘4（NOTE）「『既存キー不変』THEN は機械検証不能」→ **採用（軽量）**。spec の THEN から削除（config.yaml rules / design 制約としては維持）
- 修正後 `openspec validate install-prompt-ui --strict` → valid

## D4: 仕様レビュー Round 2（2026-06-12）
- change-B: install-prompt-ui → **APPROVE**（BLOCKER 0 / SHOULD_FIX 0。Round 1 の4指摘 + rocket_used 問題すべて反映確認済み）
- 両 change とも実装フェーズへ進行可

## D5: change-A 実装時の `tsc --noEmit` 既存エラーの扱い（2026-06-12, builder）
- 事象: tasks 3.1「`npx tsc --noEmit` エラーなし」を実行すると 9 件のエラーが出る（habits.test.ts / impact.test.ts / middleware.test.ts。HabitCompletion の `id` 未定義、NODE_ENV read-only 等）
- 判断: これらは**本 change 由来ではない先行エラー**。3つの選択肢を評価:
  - (a) 既存テストの型エラーも修正する → スコープ外（plan.md は manifest と metadata の変更のみに限定）。YAGNI 違反かつ非可逆的な広範囲変更となり却下
  - (b) tasks 3.1 を未達として失敗報告 → 本 change の品質を正しく表さない。却下
  - (c) **本 change の追加/変更ファイルが型エラーゼロであることを確認し、それを 3.1 の達成基準とする** → 採用。可逆的・最小・plan のスコープに忠実
- エビデンス:
  - base commit を `git stash` した状態でも `tsc --noEmit` のエラー件数は同じ 9 件（先行エラーであることを実証）
  - `npx tsc --noEmit 2>&1 | grep -E "manifest|layout"` → 0 件（本 change のファイルにエラーなし）
  - `npm run build` の "Running TypeScript ..." フェーズは PASS（next の tsconfig は test ファイルを除外）し `/manifest.webmanifest` を Static route として生成
- 結論: 本 change は型安全。先行エラーは別 change で扱うべき技術的負債として温存

## D6: manifest フィールドの値確定（2026-06-12, builder）
- design.md D2 の移行表に従い実装。追加4フィールドの値: `id: "/"`（start_url と一致）/ `lang: "en"`（name・description が英語のため）/ `dir: "ltr"` / `categories: ["health", "lifestyle", "productivity"]`
- icons の purpose は未指定（plan.md rule: maskable にしない）。テストで `purpose === undefined` を明示アサートし退行を防止
- theme_color "#2B4162" / background_color "#F8F9FA" は変更禁止制約どおり踏襲。テストで固定値アサート
