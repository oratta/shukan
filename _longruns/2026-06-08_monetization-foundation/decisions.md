# Decisions Log — monetization-foundation

意思決定の記録。各判断にはエビデンス（実行コマンドと出力）を含める。

## D1: Stripe スキルは未導入、Context7 で代替（Setup, 2026-06-12）

- **判断**: plan.md セットアップ前提の「Stripe スキルのプロジェクトインストール」は、ローカル・marketplace・OpenSkills のいずれにも該当スキルが存在しないため、Context7 による最新ドキュメント参照で代替する
- **エビデンス**:
  - `ls ~/.claude/skills/ | grep -i stripe` → ヒットなし
  - `ls ~/.claude/plugins/marketplaces/*/plugins/*/skills/ | grep -i stripe` → ヒットなし
  - `npx openskills search stripe` → 出力なし（利用不可）
- **影響**: longrun-builder への指示に「Stripe 実装前に Context7 で `stripe` / `stripe-node` の最新パターンを確認すること」を含める

## D2: Build Contract レビュー指摘の取捨選択（Build Contract, 2026-06-12）

- **判断**: longrun-reviewer の指摘4件＋既存コード問題2件を全て「(a) 採用すべき指摘」と判定し plan.md に反映。嗜好レベルの指摘は含まれていなかったため反論なし
- **判定内訳**:
  - 指摘1 (BLOCKER) Webhook/API route の middleware 整合 → 採用（事実誤認の余地なし: matcher に `/api/*` 不在を reviewer がコード確認済み）。Webhook=matcher外+署名検証 / 認証route=handler内 getUser() / matcher 拡張しない、を採用方針として明記
  - 指摘2 i18n 方式未確定 → 採用（marketing/copy.ts が next-intl 非使用という事実と plan の en/ja 要求の矛盾）。next-intl 方式に確定
  - 指摘3 waitlist anon RLS 具体策 → 採用（セキュリティ）。anon insert のみ/select は service_role/unique(email)+upsert
  - 指摘4 (NOTE) 残り枠カウンタのキャッシュ → 採用（anon read 経路は機能要件）。公開エンドポイント+10〜30秒キャッシュ
  - 既存 /privacy /terms の存在 → 採用（事実）。change-D は既存ページへの追記と明記
- **エビデンス**: reviewer 報告内の参照ファイル（src/middleware.ts の matcher、src/app/marketing/copy.ts、supabase/migrations/20260212000000_init_schema.sql の RLS 全件 `to authenticated`、src/app/privacy/・terms/ の存在）

## D3: Spec Review 指摘の取捨選択（Build前半, 2026-06-12）

- **判断**: longrun-reviewer の Spec Review 指摘5件を全て「(a) 採用」と判定し spec/tasks に反映。嗜好レベルの指摘なし
- **判定内訳**:
  - 指摘1 trial 失効の status 遷移セマンティクス → 採用（spec 曖昧性。builder が遷移ジョブの要否を迷う）。「status 遷移なし・`trial_end < now` 判定のみ」シナリオを change-A spec に追加
  - 指摘2 (BLOCKER) `tax_behavior: inclusive` の受け皿不在 → 採用（change 間契約違反。Price は作成後に tax_behavior 変更不可）。change-A spec 本文+シナリオ、change-A tasks 1.2、change-B tasks 3.1 に反映
  - 指摘3 残枠カウンタのレスポンス形状契約 → 採用（C/D との統合時のフィールド名食い違い防止）。change-B spec にレスポンス形状シナリオを追加
  - 指摘4 change-B tasks section 1 が GREEN 先行 → 採用（longrun-tdd スキーマの TDD 強制に違反）。RED 先行に並べ替え
  - 指摘5 (NOTE) 境界レース時の Price 補正が未テスト → 採用（課金額の正確性）。change-B spec にシナリオ、tasks 2.4 にテストケースを追加
- **エビデンス**: 反映後 `openspec validate` 4 change 全て valid（2026-06-12 実行ログ）

## change-C 実装判断（founding-teaser-waitlist, TDD apply 2026-06-12）

自律実行中（AskUserQuestion 不可）の設計判断。詳細は `openspec/changes/founding-teaser-waitlist/design.md` の D7–D10。

- **D7 階層特典カードはインライン描画**: tier カードを `renderTierCard()` helper で page tree に直接埋め込む。理由: 既存 tree-walking 構造テストは関数 component の中身を展開しないため、割引ラベル/API 残数を text node として検証可能にする必要がある。@testing-library 導入は YAGNI で却下
- **D8 WaitlistForm は client component、page テストで `'form'` 文字列にモック**: フォーム挙動は `founding-actions.test.ts` で独立検証し、page テストは「フォーム存在」構造のみ担保（責務分離）。本番コードに影響しない可逆なテスト都合
- **D9 Server Action シグネチャ `(prevState, formData)` / source 定数**: React 19 `useActionState` と素直に接続。email バリデーションは Server Action（厳格）と DB CHECK（緩い最終防衛線）の二層
- **D10 残り枠フェッチャーのエンドポイント env 差し替え**: `FOUNDING_COUNTER_API_URL` → default `/api/founding/slots`。`next.revalidate: 15` で change-B の 10〜30秒キャッシュ契約に整合。契約形状（`founder50/founder30 × cap/claimed/remaining`）を満たさなければ `null` を返し数値非表示フォールバック。change-B 確定後はこの 1 ファイルのみ差し替え
- **保留事項**: migration の `supabase db push`（tasks 1.3）と waitlist DB 行の手動確認（tasks 4.4）は、並行 run 制約によりマージ後にメインで適用・確認する。worktree からは push しない。ページ表示・i18n・RLS SQL 実装は完了済み
