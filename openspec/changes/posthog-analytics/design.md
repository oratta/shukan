# Design: posthog-analytics

> 実装済み（PR #35）の事後記録。設計判断の根拠を残す。

## Context

Smitch にはアナリティクスが一切なく、ローンチ後の改善判断と成功率ソーシャル機能（#22）の元データが取れない。Next.js 16 App Router + Supabase Auth 構成。ユーザーの習慣名・メモは機微情報になり得るため「匿名計測」が issue の要件。

## Goals / Non-Goals

**Goals:**
- キー未設定環境で完全 no-op になる安全な計測基盤
- ad-blocker 耐性のある first-party プロキシ経由の送信
- 成功率算出（取り組み/挫折）に必要な行動イベントの計装
- 個人特定情報・自由入力テキストを送らない匿名設計

**Non-Goals:**
- セッションレコーディング、Feature Flags、A/B テストの活用（将来検討）
- サーバーサイド計測（posthog-node）
- 成功率の集計・表示そのもの（#22 で実施）
- エラー監視（#18 Sentry が担当）

## Decisions

1. **初期化は `src/instrumentation-client.ts`**（Provider コンポーネントではなく）
   - Next.js 15.3+ の標準フック。React ツリーに依存せず最速で初期化され、Providers の構成を汚さない
   - 代替案: PostHogProvider + useEffect — pageview 手動計装が必要になり構成が増えるため不採用

2. **アプリコードは `src/lib/analytics.ts` ラッパー経由のみ**
   - posthog-js への直接依存を 1 箇所に閉じ込め、イベント名を union 型で管理（typo 防止・一覧性）
   - `posthog.__loaded` ガードで未初期化時 no-op

3. **`/ingest` rewrites による first-party プロキシ**（next.config.ts）
   - ad-blocker は `*.posthog.com` への直接リクエストを高確率でブロックするため
   - 送信先は PostHog Cloud US（`us.i.posthog.com` / `us-assets.i.posthog.com`）にハードコード。EU 移行時は rewrites を書き換える
   - `skipTrailingSlashRedirect: true` が必要（PostHog 側パスの互換性）

4. **匿名性の実装**
   - identify は Supabase user UUID のみ（`person_profiles: 'identified_only'`）
   - `mask_all_text` / `mask_all_element_attributes` で autocapture から DOM テキストを除外（習慣名がボタン等に出るため）
   - カスタムイベントのプロパティは enum / count / boolean / UUID のみ。自由入力（習慣名・メモ・リフレクションコメント）は送らない

5. **イベント計装は `useHabits` フック内**（UI コンポーネントではなく）
   - 全習慣操作が集約される単一ポイントで、Supabase 書き込み成功後に capture する（楽観的 UI と分離）
   - 挫折シグナルは `habit_archived`（updateHabit で `archived: true` のとき）と `habit_deleted` の 2 系統

## Risks / Trade-offs

- [middleware が `/ingest` を掴むと Supabase セッション処理が走る] → matcher は明示列挙式で `/ingest` を含まないため影響なし。matcher 変更時は注意
- [mask_all_text により autocapture の分析解像度が下がる] → 主要行動はカスタムイベントで補完済み
- [rewrites の送信先ハードコード（US）] → EU 移行は考えにくい。必要になったら rewrites と ui_host を変更
- [キー未設定だと本番でも無音でイベントが落ちる] → 仕様（no-op）。デプロイチェックリストに env var 設定を明記

## Migration Plan

1. PR #35 をマージ
2. PostHog Cloud (US) でプロジェクト作成、Project API Key 取得
3. Vercel 環境変数 `NEXT_PUBLIC_POSTHOG_KEY` を Production / Preview に設定、`.env.local` にも追加
4. デプロイ後、PostHog Activity でイベント流入を確認
5. ロールバック: env var を外せば次デプロイから no-op に戻る（コード revert 不要）

## Open Questions

- なし（運用開始後、#22 の集計要件に応じてイベントプロパティ追加を検討）
