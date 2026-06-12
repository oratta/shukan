# Design: founding-teaser-waitlist

## Context

マネタイズ run の change-C。Founding Member プログラム（最初50人=50%off永久 / 次200人=30%off永久）の需要検証のため、課金基盤（change-A: Stripe、change-B: 枠管理）に先行してティザーページと waitlist を公開する。

現状:
- marketing-host-routing 済み: `src/middleware.ts` が `NEXT_PUBLIC_MARKETING_HOSTS` を参照し、marketing host の `/` を `/marketing` に rewrite。matcher は `['/', '/discover/:path*', '/stats/:path*', '/settings/:path*', '/marketing/:path*']` で、matcher 外のルートは認証なしで素通り
- i18n: next-intl 4.8.2（cookie ベース、`src/i18n/request.ts` が `locale` cookie → `src/messages/{en,ja}.json` を解決。デフォルト `en`）
- 既存 LP は `src/app/marketing/copy.ts` の静的 ja エクスポート方式だが、本 change では踏襲しない（plan.md 採用方針）
- Supabase RLS は全テーブル per-user。anon insert の前例なし
- ブランド制約: 『静かに寄り添う／うさんくさくない』。偽の緊急性・ダークパターン禁止

## Goals / Non-Goals

**Goals:**
- `/founding` ティザーページ（Hero → 階層特典 → CS優先の約束 → waitlist フォーム → FAQ）を en/ja で公開する
- waitlist メールを Supabase `waitlist` テーブルに locale/source 付きで保存する
- anon insert のみ許可する安全な RLS 設計を、前例として文書化されたマイグレーションで導入する
- 残り枠は change-B の公開カウンタAPIの実数を表示し、API 未提供時も嘘の数字を出さずに先行公開できる構成にする

**Non-Goals:**
- Stripe 課金・Checkout 導線（change-A）
- 枠確保ロジック・カウンタAPI自体の実装（change-B）
- 特商法表記・プライバシーポリシー追記（change-D。waitlist のメール取得条項は change-D が既存 `/privacy` に追記する）
- waitlist へのメール配信（確認メール・告知メール）。保存のみ
- CAPTCHA / IP rate limit 等の本格的 bot 対策（unique(email) + upsert 無害化で初期は十分。濫用が観測されたら後続対応）

## Decisions

### D1: ルートは `src/app/founding/`、middleware matcher は拡張しない
- **判断**: `/founding` を `(app)` グループ外のトップレベルルートとして追加する。`src/middleware.ts` の matcher に `/founding` を**追加しない**ことで、認証チェックなしの公開ページになる。apex / marketing host のどちらの host からも同一パスで到達できる（Next.js は host に関係なく同じルートツリーを提供するため、rewrite 分岐は不要）
- **代替案 A**: matcher に `/founding` を追加し、middleware 内で公開分岐を書く
- **却下理由**: plan.md change-A の方針「middleware matcher は拡張しない」と整合。matcher 外に置く方が Supabase セッション処理のコストもゼロで、`/login` ページと同じ前例（グループ外公開ルート）に従う
- **補足**: `marketing-host-routing` spec の要件は変更しないため、Modified Capabilities は発生しない

### D2: i18n は next-intl `founding` 名前空間（copy.ts 方式は踏襲しない）
- **判断**: `src/messages/en.json` / `ja.json` に `founding` 名前空間を追加し、Server Component では `getTranslations('founding')`、フォーム（Client Component）では `useTranslations('founding')` で参照する
- **代替案 A**: `src/app/marketing/copy.ts` と同じ静的エクスポート方式
- **却下理由**: plan.md で確定済み。waitlist に保存する `locale` と表示言語を cookie ベースで一貫させる必要があり、将来の課金導線（change-A/B のアプリ内 UI）とも同じ i18n 系で繋がる
- **locale の取得**: Server Action 内で `getLocale()`（next-intl/server）を使い、表示と同じ cookie 解決ロジックで保存する

### D3: waitlist 書き込みは Server Action + anon キー（service_role を使わない）
- **判断**: `src/app/founding/actions.ts` に Server Action を置き、サーバー側で email 形式バリデーション → 既存の anon キーの Supabase server client で `upsert({ onConflict: 'email', ignoreDuplicates: true })` する。重複は成功として扱う（登録済みかどうかを外部に漏らさない）
- **代替案 A**: ブラウザから anon client で直接 insert
- **却下理由**: バリデーションとレスポンス整形をサーバーに寄せられる Server Action の方が、エラーメッセージの i18n・将来の rate limit 追加が容易。RLS は同じ anon ポリシーで効く（service_role をアプリコードに持ち込まない）
- **代替案 B**: `/api/waitlist` route handler
- **却下理由**: フォーム 1 つに API ルートは過剰。App Router の標準は Server Action

### D4: waitlist RLS は anon insert のみ・select は service_role のみ
- **判断**: マイグレーションで以下を実装する
  - `waitlist(id uuid pk default gen_random_uuid(), email text not null unique, locale text not null default 'en', source text not null default 'founding-teaser', created_at timestamptz not null default now())`
  - email 形式 CHECK 制約（DB レベルの最終防衛線）
  - `alter table ... enable row level security`
  - INSERT ポリシーのみ `to anon, authenticated` で付与。SELECT/UPDATE/DELETE ポリシーは作らない（読み出しは RLS を bypass する service_role = ダッシュボード/管理スクリプトのみ）
  - **anon insert はコードベース初の前例**のため、SQL コメントで「なぜ許可するか・なぜ select を制限するか・濫用対策（unique + CHECK + upsert 無害化）」を明記する
- **代替案 A**: service_role で書き込み、RLS は全拒否
- **却下理由**: service_role キーをアプリ実行系に持ち込むと事故面が広がる。anon insert-only は公開フォームの標準パターンで、plan.md でも確定済み

### D5: 残り枠表示は change-B カウンタAPI参照 + 非表示フォールバック
- **判断**: 階層特典セクションは change-B の公開カウンタAPI（anon 取得可・集計値のみ・10〜30秒キャッシュ）から実数を fetch して表示する。API が未提供（change-B 未デプロイ）または fetch 失敗時は、**数字部分を出さずに**特典説明のみ表示する。コンポーネント・messages・コピーのどこにも残り枠の数値リテラルを書かない
- **代替案 A**: change-B 完成までプレースホルダ数字（例: 残り50）を表示
- **却下理由**: config rule「残り枠は実数を表示。ハードコードしない」违反であり、景表法（change-D）の実数表示要件にも反する。嘘の数字を出すくらいなら出さない方がブランド整合
- **依存の明記**: 本 change のうち**残り枠ライブ表示のみ**が change-B `founding-member-program` に依存する。静的コンテンツ + waitlist は独立して実装・公開可能。API の正式なパス/レスポンス形状は change-B 側で確定するため、本 change ではフェッチャーを 1 ファイル（薄い関数）に隔離し、change-B 確定後の差し替えを 1 箇所に閉じる

### D6: コピーのトーンガード
- **判断**: 偽カウントダウン・架空の在庫煽り・「今だけ」系の煽り文言を使わない。緊急性は「枠は実数で、埋まったら締め切る」という事実の透明な提示のみで表現する。FAQ には「無料期間はあるか」「割引は本当に永久か」「解約はいつでもできるか」等、うさんくささを能動的に解消する Q を置く
- **テスト面**: カウントダウンコンポーネント不在・数値リテラル不在を構造テスト/grep で検証する（spec の Scenario に対応）

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| anon insert を悪用した大量ゴミ登録（コードベース初の前例） | `unique(email)` + DB CHECK + upsert 無害化で増殖を抑止。select 不可なので情報露出はゼロ。濫用観測時に CAPTCHA / rate limit を後続追加（Non-Goals に明記） |
| change-B カウンタAPIの形状が未確定のまま先行実装 | フェッチャーを薄い 1 関数に隔離し、未提供時は数字非表示フォールバック。change-B マージ後にフェッチャーのみ差し替え |
| 重複登録を「成功」と返すことで登録済みユーザーが気づかない | 仕様として許容（登録済み情報の漏洩防止を優先）。waitlist は一方向の意思表示でありユーザー側の状態管理は不要 |
| email CHECK 制約が厳しすぎて正当な email を弾く | CHECK は緩い形式チェック（`%@%.%` 程度）に留め、厳密なバリデーションは Server Action 側で実施。二層で役割分担 |
| `founding` 名前空間のキーが en/ja で不揃いになる | キーセット一致を Vitest でテスト（spec Scenario に対応） |
| marketing host で `/founding` が `/marketing` 系 rewrite と干渉 | middleware の Branch 1 は `pathname === '/'` のみ対象、Branch 3 は `/marketing` のみ対象なので `/founding` は素通り。matcher 外であることをテストで固定 |

## Migration Plan

1. `supabase/migrations/<timestamp>_waitlist.sql` を作成（テーブル + CHECK + RLS + コメント）
2. dev プロジェクトに `supabase db push` → anon insert / anon select 不可を確認
3. アプリコード（messages / page / form / action）をデプロイ。この時点で waitlist 受付開始可能（残り枠は非表示フォールバック）
4. change-B マージ後、カウンタAPIフェッチャーを正式パスに接続し、残り枠ライブ表示を有効化
5. ロールバック: ページは `/founding` ルート削除のみで戻せる。`waitlist` テーブルは収集済みデータ保全のため drop しない（insert 経路が消えるだけで無害）

## Implementation Decisions (TDD apply)

### D7: 階層特典カードはインライン描画（ネスト component にしない）
- **判断**: tier カードを `renderTierCard()` という helper 関数で page tree に**直接**埋め込む。`<TierCard/>` のような子 component にはしない
- **理由**: 構造テスト（marketing-page.test 流の tree-walking）は関数 component の中身を展開しない。割引ラベル（"50% off" / "50%オフ"）と API 由来の残数を tree の text として検証可能にするには、page tree に literal text node として現れる必要がある
- **代替案**: テスト側で `@testing-library/react` を導入して実レンダリング。却下理由: 既存テストは DOM ランタイム無しの tree-walking 方式で統一されており、依存を増やさない方が整合（YAGNI）

### D8: WaitlistForm は client component、page テストでは文字列 `'form'` にモック
- **判断**: `WaitlistForm` は `'use client'` + `useActionState` で実装。page 構造テストでは `vi.mock` で `WaitlistForm: 'form'` を返し、`<WaitlistForm/>` が素の `<form>` 要素として tree に現れるようにする
- **理由**: client component の中身（hooks）は Server Component の同期 tree-walk では展開できない。フォーム挙動（バリデーション・upsert・i18n）は `founding-actions.test.ts` で独立検証し、page テストは「フォームが存在する」構造のみを担保する（責務分離）
- **可逆性**: テストのモック差し替えのみで完結し、本番コードに影響しない

### D9: Server Action は `(prevState, formData)` シグネチャ・source は定数 `'founding-teaser'`
- **判断**: `submitWaitlist(prevState, formData)` を `useActionState` 互換のシグネチャで実装。`source` はアプリ側で `'founding-teaser'` 定数を渡す（DB default と一致）。email バリデーションは `^[^@\s]+@[^@\s]+\.[^@\s]+$`（DB CHECK と二層）
- **理由**: D3（Server Action）と React 19 の `useActionState` を素直に繋ぐ標準形。source を定数にすることで将来の流入元別計測（別ページからの登録）にも 1 引数追加で拡張できる

### D10: 残り枠フェッチャーのエンドポイントは env で差し替え可能・default `/api/founding/slots`
- **判断**: `fetchRemainingSlots()` は `FOUNDING_COUNTER_API_URL`（明示指定）→ `NEXT_PUBLIC_APP_URL + /api/founding/slots`（default）の順で URL を解決。`next: { revalidate: 15 }` で change-B の 10〜30秒キャッシュ契約に合わせる。レスポンスが契約形状（`founder50/founder30` × `cap/claimed/remaining`）を満たさなければ `null`
- **理由**: D5 の「フェッチャー 1 箇所隔離」を満たしつつ、change-B のパス未確定リスクを env で吸収。change-B 確定後はこのファイルだけ差し替える

### D11: waitlist 書き込みは `upsert(ignoreDuplicates)` ではなく素の `insert()` + 23505 成功扱い（バグ修正）
- **背景**: ブラウザ検証（longrun-browser-verifier が実 DB で再現確認）で、`/founding` の waitlist 登録が**新規メールでも全件失敗**することが判明
- **原因**: D3 で採用した `.upsert({ onConflict: 'email', ignoreDuplicates: true })` は PostgREST が `INSERT ... ON CONFLICT DO NOTHING` にコンパイルする。PostgreSQL は ON CONFLICT の競合検出に対象行の読み取り（SELECT 権限）を要求するが、D4 で `waitlist` は anon に SELECT ポリシーを与えていない（メール保護）。結果、**新規メールでも RLS 違反 42501 で失敗**する
- **エビデンス（実 DB anon クライアント）**:
  - 素の INSERT（新規）→ 201 成功
  - 素の INSERT（重複）→ 409 / Postgres code `23505`（unique_violation）
  - `upsert(ignoreDuplicates)`（新規）→ 401 / code `42501`（RLS 違反。原因を再現）
- **判断**: `.upsert(..., { ignoreDuplicates })` を素の `.insert()` に置き換え、エラーコード `23505` を**成功扱い**にする。これで「新規 → 201 成功」「重複 → 23505 を成功にマップし登録済みかどうかを漏らさない」を両立し、D4 の anon insert-only / select 不可の RLS 設計を一切変えずにフォームを通す。`23505` 以外のエラーは従来通り `errorGeneric` で返す
- **代替案 A**: `waitlist` に anon SELECT ポリシーを追加して `upsert(ignoreDuplicates)` を成立させる
- **却下理由**: メール一覧が anon に露出し D4 の情報保護設計が崩れる。RLS を緩めるのは不可逆性が高く却下
- **代替案 B**: service_role で書き込む
- **却下理由**: D4 の「service_role をアプリ実行系に持ち込まない」方針に反する
- **重複無害化の意味論への影響**: D3/D4 の「重複は成功として扱い、追加行も作らない」は維持される（`unique(email)` が増殖を防ぎ、23505 を成功にマップするのでユーザー体験は不変）。Risks 表の該当行（unique + CHECK + upsert 無害化）は「upsert 無害化」を「insert + 23505 成功扱い」に読み替える
- **テスト**: モックテスト（`founding-actions.test.ts`）を insert + 23505 成功扱いに更新。加えて**実 DB 統合テスト**（`founding-waitlist-integration.test.ts`）を追加し、anon クライアントで「新規 insert 成功 / 同一 email 再送 23505 経路 / 不正 email はバリデーション拒否」を検証。env 未設定環境では `describe.skipIf` で skip。anon に DELETE がないため、テスト用 email を `qa+waitlist-test@example.com` 固定にして重複成功経路で冪等化

## Open Questions

- change-B の公開カウンタAPIの正式なパス・レスポンス形状（D5 のフェッチャー隔離で吸収。change-B 側の design で確定。default は `/api/founding/slots`、env `FOUNDING_COUNTER_API_URL` で上書き可能に実装済み）
- ティザーの SEO/OGP メタデータをどこまで作り込むか（最低限の title/description は layout に置く。本格 OGP は marketing-seo の既存パターンに後続で合わせる）
