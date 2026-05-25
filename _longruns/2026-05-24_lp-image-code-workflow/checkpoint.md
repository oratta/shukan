---
phase: Build
status: in_progress
last_updated: 2026-05-25T19:00:00+09:00
---

## 完了フェーズ

- [x] Setup: ツール検証 / コードベース調査 / ベースラインテスト
- [x] Build Contract: longrun-reviewer APPROVED (BLOCKER 0 / SHOULD_FIX 0)
- [x] Build / change-A (lp-foundation): APPROVED + 全 task `[x]` + 230 tests PASS + 6 commits

## 進行中

- [ ] Build / change-B〜G: **画像生成方式を変更中**（LP 全体 1 枚絵 → セクション別 8 枚個別生成、リサーチ §2.4 / §3.1 準拠）
  - ユーザーが Codex App で 8 セクション画像を順次生成中
  - ガイド: `_longruns/2026-05-24_lp-image-code-workflow/codex-app-section-prompts.md`
  - 8 枚揃ったら Claude が独立コンポーネントとして実装 → marketing-preview で組み立て
- [ ] Build / change-H: 統合 + GA4 + a11y + copy.ts 全面置換（change-B〜G 完了後）

## 試作（参照価値あり、書き直し対象）

- `src/components/landing/Hero.tsx` / `ProblemSolution.tsx` / `WhySmitch.tsx` / `HowItWorks.tsx` / `Evidence.tsx` / `CtaWaitlistForm.tsx`
- `src/app/marketing-preview/page.tsx`
- `public/landing/{hero, problem-solution, evidence, hero-codex, lp-mockup-full}.png`

これらは「Claude が plan に沿って一度実装してみた素材」だが、ユーザー判断で「写真にメッセージ性がない / LP 全体 1 枚絵はリサーチ違反」として全面書き直しが確定。8 枚画像が揃ったら新画像 + リッチな editorial 構成で再実装する。

## ツール検証結果

- **openspec**: `/Users/oratta/.volta/bin/openspec` (v1.2.0)
- **git**: 2.40.1 on `lp-image-code-workflow`
- **node**: v22.7.0, npm 10.8.3
- **vitest**: 4.0.18 設定済み (`npm run test:run`)
- **playwright**: `@playwright/test` インストール済み、`playwright.config.ts` なし
- **OpenSpec 初期化状態**: ✅ 完了済み + `longrun-tdd` schema fork 済み
- **Codex CLI**: `/Users/oratta/.superset/bin/codex` v0.133.0（`image` サブコマンドは**未提供**。`codex exec` 経由で gpt-image を呼び出す方法は試したが、品質的にユーザー却下 → ユーザーが Codex App で対応）

## ベースラインテスト結果

- 初期: 11 test files / 197 tests / 全 PASS
- change-A 完了時: 13 test files / **230 tests / 全 PASS**（change-A で 33 tests 追加）

## change-A 成果物

| ファイル | 内容 |
|---|---|
| `docs/design/DESIGN.md` | LP design system（OKLCh + HEX 併記、Codex Style Block 用） |
| `docs/design/brand-references/README.md` | 16 枚 role-label 仕組み |
| `docs/design/prompts/section-prompt-template.md` | リサーチ §5.1 ベースの汎用テンプレ |
| `scripts/check-design-md-sync.sh` | globals.css と DESIGN.md の OKLCh diff 検出 |
| `scripts/codex-image-gen.sh` | Codex CLI 薄ラッパ（D-A-3 通り未 install でも validation までは動く） |
| `CLAUDE.md` | Smitch concept core + Hard rules |
| `supabase/migrations/20260524000000_add_waitlist.sql` | waitlist テーブル（本番適用は change-G まで保留） |

## ユーザー手動タスク（未実施、change-A デプロイゲート）

1. Cloudflare DNS: `www.s-mitch.com` CNAME → `cname.vercel-dns.com`
2. Vercel project `shukan` に `www.s-mitch.com` ドメイン追加（`vercel domains add www.s-mitch.com shukan`）
3. Vercel env vars: `NEXT_PUBLIC_MARKETING_HOSTS=www.s-mitch.com` を Production + Preview に設定

完了すれば `https://www.s-mitch.com` で marketing route が表示される。change-B〜G の最終確認時 or change-H 後のいずれかのタイミングで実施。

## 次セッションへの引き継ぎ

**`_longruns/2026-05-24_lp-image-code-workflow/RESUME.md` を最初に読むこと。**

RESUME.md に以下が記載済み:

- 現在の状況（一行）
- ユーザーが今やっていること
- 次セッションで Claude がやるべきこと
- 主要ファイルパス
- 重要な決定事項（D-S-1〜D-S-5、D-A-1〜D-A-6）
- やってはいけないアプローチ（試行錯誤の教訓）
- 残タスク全体像

## dev server

- ポート 3000 は Obsidian 占有（kill 禁止）
- 本プロジェクトは **3001** で起動: `PORT=3001 npm run dev`
- 試作確認 URL: `http://localhost:3001/marketing-preview`
