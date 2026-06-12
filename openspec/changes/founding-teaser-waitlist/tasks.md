# Tasks: founding-teaser-waitlist

## 1. DB マイグレーション（waitlist）

- [ ] 1.1 `supabase/migrations/<timestamp>_waitlist.sql` を作成: `waitlist(id, email unique, locale, source, created_at)` + email 形式 CHECK 制約 + RLS（INSERT のみ `to anon, authenticated`、SELECT/UPDATE/DELETE ポリシーなし）
- [ ] 1.2 マイグレーション SQL に anon insert を許可する意図・select 制限の理由・濫用対策（unique + CHECK + upsert 無害化）をコメントで明記（コードベース初の前例のため）
- [ ] 1.3 dev プロジェクトに `supabase db push` し、anon キーで insert 成功・select 0件（または拒否）・malformed email 拒否を確認

## 2. テスト先行（RED）

- [ ] 2.1 messages テスト: `src/messages/en.json` / `ja.json` の `founding` 名前空間がキーセット一致（hero / tiers / promise / waitlist / faq）であることを assert
- [ ] 2.2 ページ構造テスト: `/founding` ページが Hero（単一 h1）→ 階層特典（50%/30% 両方）→ CS優先の約束 → waitlist フォーム → FAQ（3問以上）を順に含むことを assert（既存 marketing-page.test の tree-walking 方式を踏襲）
- [ ] 2.3 トーンガードテスト: カウントダウンコンポーネント不在・founding コンポーネント/messages 内に残り枠の数値リテラルが無いことを assert
- [ ] 2.4 Server Action テスト: 正常 email で upsert が呼ばれ locale/source が渡る / 不正 email で insert されずエラー / 重複 email でも成功レスポンス、を Supabase client モックで assert
- [ ] 2.5 middleware テスト追加: `config.matcher` に `/founding` が含まれないこと、`/founding` リクエストが `/login` リダイレクトされないことを assert
- [ ] 2.6 残り枠表示テスト: カウンタAPIモックが値を返すとき実数が表示され、エラー/未提供時は数値なしで特典説明のみ表示されることを assert
- [ ] 2.7 `npm run test:run` で新規シナリオが RED であることを確認

## 3. 最小実装（GREEN）

- [ ] 3.1 `src/messages/en.json` / `ja.json` に `founding` 名前空間を追加（Hero / 階層特典 / CS優先の約束 / waitlist フォームラベル・成功・エラー文言 / FAQ）。トーンは『静かに寄り添う／うさんくさくない』、偽の緊急性なし
- [ ] 3.2 `src/app/founding/layout.tsx` を作成（最低限の title/description メタデータ）
- [ ] 3.3 `src/app/founding/page.tsx` を作成（Server Component、`getTranslations('founding')`。DESIGN.md セマンティックカラーのみ使用、hex リテラル禁止）
- [ ] 3.4 残り枠フェッチャーを薄い 1 関数として隔離実装（change-B カウンタAPI参照。未提供/失敗時は `null` を返し、ページ側は数値非表示フォールバック）
- [ ] 3.5 `src/app/founding/waitlist-form.tsx`（Client Component）と `src/app/founding/actions.ts`（Server Action）を作成: email バリデーション → `getLocale()` で locale 取得 → anon client で `upsert({ onConflict: 'email', ignoreDuplicates: true })` → 重複も成功として localized メッセージ返却
- [ ] 3.6 `npm run test:run` で全シナリオ GREEN

## 4. 品質確認（REFACTOR + 検証）

- [ ] 4.1 `npm run lint` 新規違反ゼロ
- [ ] 4.2 `npm run build` 成功（Next.js 16.1.6 / Turbopack、SSR/middleware を壊していないこと）
- [ ] 4.3 `grep -rnE '#[0-9A-Fa-f]{3,8}' src/app/founding/` が 0 件であることを確認
- [ ] 4.4 dev サーバーで手動確認: 未ログインで `/founding` 表示（apex / `?marketing=1` 双方）、locale cookie 切替で en/ja 反映、waitlist 登録 → Supabase ダッシュボード（service_role）で行を確認、重複登録が成功表示になること
- [ ] 4.5 既存テスト全 PASS（regression なし）を確認
