# Summary — LP Branding Longrun

## 期間
- 開始: 2026-05-12 16:35 JST（session_start at HEAD 040ebbe）
- Build 完了: 2026-05-12 17:26 JST
- Verify 完了: 2026-05-12 17:34 JST（推定）
- 関連 Issue: [#1 ブランディングページ（LP）作成](https://github.com/oratta/shukan/issues/1)

## ゴール（達成）
Smitch のコアメッセージ（"Switch your path." / 「なりたい自分から科学が習慣を導く」）を体現する LP の **routing 基盤・shell・SEO/OGP・deploy 手順** を整備し、`www.s-mitch.com` で公開できる状態にする。LP の本格デザイン（codex + gpt-image-2 担当）の入力資料も同時に確保。

## Changes（全 3 件、merge 済み）

| Change | Capability | TDD テスト数 | コミット |
|--------|-----------|-------------|---------|
| marketing-routing-middleware | marketing-host-routing | 11 件 | d0c9b63 → merge 37521dc |
| lp-shell-and-copy | lp-content | 5 件 | 394abde → merge f8732bc |
| seo-ogp-deploy | marketing-seo | 10 件 | f77a3d3 → merge b2a9a2d |

合計新規テスト: **26 件**（baseline 171 + 新規 26 = **197 件全 PASS**）

## テスト・ビルド結果
- `npm run test:run`: ✅ 197 / 197 PASS
- `npm run lint`: baseline と同値（9 errors / 35 warnings、marketing 由来の新規違反 0）
- `npm run build`: ✅ Compiled successfully、routes `/marketing` `/robots.txt` `/sitemap.xml` 登録

## 4軸評価スコア
| 軸 | スコア | しきい値 | 判定 |
|----|-------|---------|------|
| 品質 | 100% | 100% | ✅ |
| 完成度 | 96% | 80% | ✅ |
| 機能性 | 100% (20/20 Scenarios) | 100% | ✅ |
| UX | 90% | 70% | ✅ |

## 意思決定サマリー（decisions.md 参照）
- **D1**: route group `(marketing)` 非採用、実パス `src/app/marketing/`（`(app)/page.tsx` との `/` 衝突回避）
- **D2**: host 判定は `NEXT_PUBLIC_MARKETING_HOSTS` env で一元化
- **D3**: middleware matcher は現行 + `/marketing/:path*` 追加、`/login` は対象外維持
- **D4**: Cloudflare proxy OFF / Vercel 同一プロジェクトに www 追加
- **D5**: LP の最終レイアウト・ビジュアルは codex + gpt-image-2 に委譲、本runは「土台」のみ
- **D6**: Build Contract レビュー（apex robots disallow 採用 / OGP 既存流用 / duplicate content 後続対処）
- **D7**: Spec Review BLOCKER 2 件＋SHOULD_FIX を全採用（パス統一 / async headers / 分岐順序 / h1 限定 / inline SVG 禁止 / layout 責務境界）
- **D8**: change-A builder 自律判断（x-middleware-rewrite 検証 / production env での escape hatch 無視テスト追加 / marketing layout は html 非保持 / sync Server Component）
- **D9**: change-B builder 自律判断（RTL 不採用で tree-walking 継続 / CTA は素の `<a>` / accessible name は可視テキスト）
- **D10**: change-C builder 自律判断（vi.mock factory hoisting / NBSP 不可視差分対応 / dev server 起動を smoke-test に委譲）

## 主要ファイル変更
- 新規: `src/app/marketing/{page,layout,copy}.tsx`、`src/app/robots.ts`、`src/app/sitemap.ts`
- 更新: `src/middleware.ts`（host ベース rewrite + matcher 拡張）
- 新規テスト: `src/__tests__/{middleware,marketing-page,robots,sitemap,marketing-metadata}.test.ts(x)`
- 成果物: `_longruns/2026-05-12_lp-branding/{plan,checkpoint,decisions,verification-guide,deploy-steps,summary}.md`

## デプロイ手順
`_longruns/2026-05-12_lp-branding/deploy-steps.md` を参照（5 ステップ: Vercel ドメイン追加 / Cloudflare CNAME proxy OFF / Vercel env 設定 / SSL 待ち / 動作確認）

## Backlog 追加（本run由来、openspec/backlog.md に記録）
- LP `<html lang>` 動的化（locale が next-intl 由来で en になる）
- LP 本格デザイン（codex + gpt-image-2 委譲）
- LP Analytics / A/B / waitlist
- middleware host 大文字小文字対応（実害低）
- 視覚レイアウトの本番 smoke-test（Playwright MCP 不在のため未確認）

## 次のアクション
1. **ユーザー確認**: LP の挙動確認（dev サーバー起動 → `?marketing=1` で LP 確認 / curl で robots/sitemap 確認）
2. **本番デプロイ**: deploy-steps.md に従い Vercel + Cloudflare 設定 → www.s-mitch.com で smoke-test
3. **codex + gpt-image-2**: LP 本格デザインを別 run で実施
