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
