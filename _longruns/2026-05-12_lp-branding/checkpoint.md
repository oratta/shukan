---
phase: Build
status: complete
last_updated: 2026-05-12T17:26:00+09:00
---

## Changes 状態
| Change | Tasks | Tests | Status |
|--------|-------|-------|--------|
| marketing-routing-middleware | 13/13 | 11 PASS | Merged (d0c9b63) |
| lp-shell-and-copy | 13/13 | 5 PASS | Merged (394abde) |
| seo-ogp-deploy | 13/15 (3.4/3.5 deploy smoke待ち) | 10 PASS | Merged (f77a3d3) |

## verification-guide.md 進捗
- 20/20 Scenarios: テスト実装完了 [x]
- 20/20 Scenarios: ロジック実装完了 [x]
- 0/20 Scenarios: 動作確認完了（Verify フェーズで）
- 0/20 Scenarios: ユーザー確認完了（Feedback フェーズで）

## Total tests
197 PASS / 197 total（baseline 171 + change-A 11 + change-B 5 + change-C 10）

## Build
- `npm run build`: ✅ Compiled successfully
- Routes: `/marketing`, `/robots.txt`, `/sitemap.xml`, 既存 (app) routes 全て登録

## Verify結果
| 軸 | スコア | しきい値 | 判定 | 検証Agent |
|----|-------|---------|------|----------|
| 品質 | 100% | 100% | ✅ | longrun-verifier (agentId a592bf531cb396a34) |
| 完成度 | 96% | 80% | ✅ | longrun-verifier |
| 機能性 | 100% (20/20 Scenarios) | 100% | ✅ | longrun-browser-verifier (agentId a019955fd549b768f) |
| UX | 90% | 70% | ✅ | longrun-browser-verifier |

ブラウザ検証は curl + grep + SSR HTML 検査で実施（Playwright MCP / claude-in-chrome 不在）。視覚レイアウト検証は本番デプロイ後の smoke-test に委譲。

## Backlog 追加（本run由来）
- LP html lang locale 動的化（next-intl 影響）
- LP 本格デザイン（codex + gpt-image-2）
- LP Analytics / A/B / waitlist
- middleware host 大文字小文字対応

## 完了フェーズ
- [x] Setup: ツール検証 / OpenSpec 初期化 / schema longrun-tdd 設置 / .gitignore 更新
- [x] Build Contract: APPROVED by longrun-reviewer (agentId a7055e7a972126bc8)
  - 指摘1 (a) 採用 → plan.md change-C robots.ts apex `disallow: '/'` 明示
  - 指摘2,3 (b) 反論 → decisions.md D6 に記録
- [x] Build前半: OpenSpec change 作成（3件、全て validate pass）+ Spec Review APPROVE（agentId a177300e89e5cc043、BLOCKER 2件＋SHOULD_FIX を全採用）+ verification-guide.md 生成（20 Scenario）
- [x] Build後半: 3 change を順次 TDD 実装（worktree → builder Agent → merge）
  - change-A: worktree commit d0c9b63 → merge 37521dc
  - change-B: worktree commit 394abde → merge f8732bc
  - change-C: worktree commit f77a3d3 → merge b2a9a2d

## 次フェーズへの引き継ぎ
- plan.md: `_longruns/2026-05-12_lp-branding/plan.md`（v2、APPROVE 済み）
- Changes分解: change-A (marketing-routing-middleware) / change-B (lp-shell-and-copy) / change-C (seo-ogp-deploy)
- 依存関係: A → B → C（直列）

## ツール検証結果
- openspec: `/Users/oratta/.volta/bin/openspec` (v1.2.0)
- git: 2.40.1 on `plan-github-issue-1`
- node: v22.7.0, npm: 10.8.3
- カスタムスキーマ: `openspec/schemas/longrun-tdd/`（spec-driven から fork、apply.md / propose.md 反映済み）
- 既存 openspec/: specs/(16 capabilities) / changes/(archive のみ) / backlog.md(2項目)

## Changes分解（plan.md より）

| Change | スコープ要約 | 依存 | 主な変更ファイル |
|--------|------------|------|----------------|
| change-A: marketing-routing-middleware | `app/marketing/` 実パス配置 + `src/middleware.ts` に host ベース rewrite + `NEXT_PUBLIC_MARKETING_HOSTS` env + Vitest モックテスト | 独立 | `src/middleware.ts` / `app/marketing/page.tsx` / `app/marketing/layout.tsx` / `src/middleware.test.ts`(新規) |
| change-B: lp-shell-and-copy | LP土台（Hero/CTA/フッター）+ コアコピー1案決め打ち（product-concept.md から） | change-A | `app/marketing/page.tsx`（中身）/ `app/marketing/copy.ts` / 必要に応じて UI components |
| change-C: seo-ogp-deploy | dynamic `app/robots.ts` / `app/sitemap.ts` + Metadata API + deploy-steps.md | change-B | `app/robots.ts` / `app/sitemap.ts` / `app/marketing/layout.tsx`(metadata) / `_longruns/2026-05-12_lp-branding/deploy-steps.md` |

## ベースライン（既存）

- 既存テストフレームワーク: Vitest（`npm run test:run`）
- 動作確認URL: ローカル http://localhost:3000 / 本番 https://s-mitch.com
- ブランチ: `plan-github-issue-1`（worktree）

## 注意点
- middleware は既存の認証ガード（apex 側 `/`, `/discover`, `/stats`, `/settings`）を一切壊さない
- `/login` は middleware matcher 対象外のまま維持（無限ループ回避）
- LP は route group ではなく実パス `app/marketing/` に配置（`(app)/page.tsx` との `/` 衝突回避）
- Cloudflare proxy OFF 必須、Vercel 同一プロジェクトに www 追加
