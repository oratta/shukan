---
phase: Archive
status: complete
last_updated: 2026-06-12T12:15:00
---

## Verify結果
| 軸 | スコア | しきい値 | 判定 | 検証Agent |
|----|-------|---------|------|----------|
| 品質 | 100% | 100% | ✅ | longrun-verifier |
| 完成度 | 100% (14/14) | 80% | ✅ | longrun-verifier |
| 機能性 | 100% (26/26 検証可能分。46件は認証/Stripeキー制約で人間委譲) | 100% | ✅ | longrun-browser-verifier (claude-in-chrome フォールバック。Playwright MCP 利用不可) |
| UX | 100% (5/5) | 70% | ✅ | longrun-browser-verifier |

- Verify中の修正2件: portal route POST シグネチャ（b70055c）/ waitlist upsert→insert+23505（c444fcc、実バグ。ブラウザ再検証で解消確認）
- テスト最終: 386 passed / 43 files（実DB統合テスト1本含む）

## 完了フェーズ
- [x] Setup: ツール検証・コードベース調査・ベースライン記録完了
- [x] Build Contract: APPROVED by longrun-reviewer（ラウンド2。ラウンド1の指摘4件+既存コード問題2件を全採用して plan.md 反映 → D2 参照）
- [x] Build前半: OpenSpec 4 change 作成・validate 済み + Spec Review（指摘5件全採用 → D3）+ verification-guide.md 生成（72 Scenario）
- [x] Build後半: 4 change + 統合結線を TDD 実装、全て main にマージ済み

## Build結果
| Change | Branch (merged) | Tests | Status |
|--------|----------------|-------|--------|
| change-A stripe-billing-foundation | d64b6a4 | +52 | Complete（deferred: 実Stripeキー疎通） |
| change-C founding-teaser-waitlist | 35444fa | +20 | Complete（migration は dev 適用済み） |
| change-B founding-member-program | b74124f | +48 | Complete（RPC実DB検証は統合検証項目） |
| change-D jp-legal-compliance | d9c36d9 | +32 | Complete（deferred: 事業者実値/弁護士レビュー） |
| 統合結線 billing-integration | 5645b5e | +33 | Complete（/account・確認画面・PaywallGate結線） |

- テスト: **382 passed / 42 files**（ベースライン 197 → +185）
- build: 成功 / lint: ベースライン維持（9 errors / 35 warnings、全て既存ファイル由来）
- verification-guide.md: 72/72 Scenario で「テスト実装完了」「ロジック実装完了」[x]
- dev DB: migration 3本適用済み（add_subscriptions / waitlist / founding_memberships）。dev プロジェクトは paused から restore 済み

## 既知の deferred（実環境・人間ゲート）
1. 実 Stripe テストキー投入 → `npm run stripe:setup` で Products/Prices 実作成（tax_behavior: inclusive）→ Price ID を env へ
2. 実 DB での plpgsql RPC 検証（小cap境界・並行claim・RLS）
3. `LEGAL_*` 環境変数の事業者実値設定（未設定だと特商法ページに [要記入] が出る。リリースブロッカー）
4. 法定文言の人間（弁護士）レビュー

## 次フェーズへの引き継ぎ
- 次: Verify（longrun-verifier 静的検証 → longrun-browser-verifier ブラウザ検証）
- ブラウザ検証時の注意: Stripe 実キーなしのため Checkout 実遷移は不可。確認画面表示・paywall・ティザー・waitlist・カウンタAPI は検証可能

## ツール検証結果
- openspec: /Users/oratta/.volta/bin/openspec (v1.2.0)
- git: 2.40.1 on monetization-strategy-pla
- openspec/: 初期化済み（schemas/longrun-tdd 存在）
- vitest: npm run test:run で実行可（npm install 実施済み）

## テストベースライン
- 11 test files / 197 tests 全PASS（2026-06-12 09:03）

## Stripe スキル探索結果（plan.md セットアップ前提）
- ローカル skills / marketplace plugins: Stripe スキルなし
- OpenSkills: 利用不可
- → 代替: Context7（plugin:context7）で Stripe + Next.js 16 App Router の最新パターンを builder が参照する方針

## コードベース調査の要点（Explore Agent 報告より）
- ルーティング: `(app)`=認証保護 / `marketing/`=ホスト分岐（`NEXT_PUBLIC_MARKETING_HOSTS` + middleware rewrite）。`/privacy` `/terms` は認証不要ページの前例
- middleware matcher: `/`, `/discover/*`, `/stats/*`, `/settings/*`, `/marketing/*`。新規公開ページ/API は matcher 外なら認証不要
- Supabase: client.ts(browser)/server.ts(SSR cookie)。habits.ts に snake↔camel マッピング + CRUD + RPC パターン
- migrations: `YYYYMMDDHHmmss_desc.sql` 形式 14本。RLS は `auth.uid() = user_id` パターン。view は service_role 限定の前例あり（article_feedback_stats）
- i18n: `src/messages/{en,ja}.json` + cookie locale
- テスト: vitest (node env, `src/**/*.test.ts(x)`)、Playwright は `e2e-verify.spec.ts`
- API route 前例: `src/app/auth/callback/route.ts`。Edge function 前例: `supabase/functions/delete-user`
- Stripe 依存パッケージ: なし（新規導入）

## Changes状態
| Change | Tasks | Tests | Status |
|--------|-------|-------|--------|
| change-A (Stripe課金基盤) | - | - | 未着手 |
| change-B (Founding割引) | - | - | 未着手（A依存） |
| change-C (ティザーLP+waitlist) | - | - | 未着手（静的部分は独立、残枠APIはB依存） |
| change-D (国内法準拠) | - | - | 未着手（表記/プライバシーは独立、確認画面はA/B依存） |

## 次フェーズへの引き継ぎ
- 次: Build Contract（longrun-reviewer で plan.md の Changes 分解レビュー）


## Feedback/Archive（2026-06-24）
Feedback ループで対応した項目（全て main ブランチにコミット済み）:
- LocaleSwitcher を /founding に追加（f4a9884）
- /account の intl FORMATTING_ERROR 修正（9f9b966）
- /api/founding/slots 503 → service_role 設定 + ティザー self-fetch 廃止（83b8133）
- origin/main（PR #9 PWA）取り込みマージ（ed5943a、messages 衝突解消・453→tests）
- Stripe テストキー投入 + 価格7種生成（tax_behavior inclusive）+ 両 .env.local 反映
- checkout 不具合の実機特定: .env.local の secret key 連結破損を修復 + Stripe アカウント事業者名未設定（ユーザー対応）
- waitlist insert+23505 修正（c444fcc）
- 自分の founding tier 表示機能を追加（2d79b6c）+ バッジ折返し修正（87afc4a）

アーカイブ: OpenSpec 4 change を 2026-06-24-* として archive、delta spec をメイン spec に同期。ランディレクトリを _longruns/_archive/ へ移動。
最終テスト: 472 passed。残課題（リリース前人間ゲート）: LEGAL_* 事業者実値・弁護士レビュー・本番 webhook 設定・Vercel env（SERVICE_ROLE_KEY / APP_URL / STRIPE_*）。
