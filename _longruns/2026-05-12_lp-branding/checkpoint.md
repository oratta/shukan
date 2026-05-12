---
phase: Build Contract
status: complete
last_updated: 2026-05-12T16:55:00+09:00
---

## 完了フェーズ
- [x] Setup: ツール検証 / OpenSpec 初期化 / schema longrun-tdd 設置 / .gitignore 更新
- [x] Build Contract: APPROVED by longrun-reviewer (agentId a7055e7a972126bc8)
  - 指摘1 (a) 採用 → plan.md change-C robots.ts apex `disallow: '/'` 明示
  - 指摘2,3 (b) 反論 → decisions.md D6 に記録
- [x] Build前半: OpenSpec change 作成（3件、全て validate pass）+ Spec Review APPROVE（agentId a177300e89e5cc043、BLOCKER 2件＋SHOULD_FIX を全採用）+ verification-guide.md 生成（20 Scenario）

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
