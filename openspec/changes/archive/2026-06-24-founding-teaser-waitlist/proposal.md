# Proposal: founding-teaser-waitlist

## Why

Founding Member プログラム（初期貢献者を永久割引で優遇）の需要検証を、課金基盤（change-A/B）の完成を待たずに始めたい。ティザーページ + waitlist でメールを集めれば、枠を消費せずに「払う意思のあるユーザー」の規模を測れる。マネタイズ run（2026-06-08_monetization-foundation）の change-C に相当する。

## What Changes

- **新規追加**: ティザーページ `/founding`（Hero → 階層特典説明（50%off 残りN / 30%off 残りM）→ CS優先の約束 → waitlist 登録フォーム → FAQ）。未ログインで閲覧可能
- **新規追加**: waitlist メール取得フォーム → Supabase `waitlist` テーブル保存（`id`, `email` unique, `locale`, `source`, `created_at`）
- **新規追加**: `waitlist` マイグレーション。RLS は `to anon` で insert のみ許可、select は service_role のみ。anon insert はコードベース初の前例のためマイグレーションにコメントで意図を明記
- **新規追加**: next-intl の `src/messages/{en,ja}.json` に `founding` 名前空間を追加（en/ja 対応）。既存 `src/app/marketing/copy.ts` の静的日本語エクスポート方式は踏襲しない
- **更新（依存）**: 残り枠ライブ表示は change-B `founding-member-program` の公開カウンタAPIを参照（実数表示。ハードコード禁止）。API 未提供の間は枠数の表示を出さないフォールバックで先行リリース可能

## Capabilities

### New Capabilities
- `founding-teaser`: Founding Member ティザーページ（`/founding`）の表示・i18n・waitlist 登録・残り枠ライブ表示能力

### Modified Capabilities
- なし（`marketing-host-routing` の middleware matcher は変更しない。`/founding` は matcher 外の公開ルートとして追加するため、既存 spec の要件は変わらない）

## Impact

- **影響コード（新規）**: `src/app/founding/page.tsx` / `src/app/founding/layout.tsx` / `src/app/founding/waitlist-form.tsx` / `src/app/founding/actions.ts` / `supabase/migrations/*_waitlist.sql`
- **影響コード（更新）**: `src/messages/en.json` / `src/messages/ja.json`（`founding` 名前空間追加のみ）
- **影響しないもの**: `src/middleware.ts`（matcher 拡張なし）、既存 `(app)` 配下、`src/app/marketing/`（スタイル参照のみ）
- **依存**: 残り枠ライブ表示のみ change-B の公開カウンタAPIに依存。静的コンテンツ + waitlist は独立して着手・リリース可能
- **DB**: `waitlist` テーブル新設（既存テーブルへの変更なし）
