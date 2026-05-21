# Design: marketing-routing-middleware

## Context

Smitch アプリは `s-mitch.com`（apex）で稼働中。Issue #1 でブランディング LP を公開する必要があり、`www.s-mitch.com` をマーケティング用 host として確保した。同一 Next.js 16 デプロイ内で host ベースに出し分けることで、別リポ・別 CI/CD を避けつつ、apex 側の既存ユーザー認証フロー（`src/middleware.ts` で `auth.getUser()` → 未ログインなら `/login` redirect）を一切壊さない設計が要求される。

既存 middleware は matcher `/, /discover/:path*, /stats/:path*, /settings/:path*` で動作し、`/login` は matcher 対象外（無限ループ回避のため意図的）。

## Goals

- `www.s-mitch.com/` で LP を表示する
- `s-mitch.com/` 以下の既存挙動を完全に維持する
- LP 側で Supabase auth を呼ばない（パフォーマンス + 未ログインユーザーの心理的障壁低減）
- preview deployment / ローカル開発でも LP を確認できる

## Non-Goals

- LP の最終レイアウト / コピー / ビジュアル（codex+gpt-image-2 に委譲）
- 英語ローカライズ（ja 単体先行）
- A/B テスト / waitlist / メール取得（後続 issue）
- SEO の細部チューニング（change-C 範囲、ここでは routing のみ）

## Decisions

### D1: route group `(marketing)` ではなく実パス `src/app/marketing/` を採用
- **判断**: `src/app/marketing/page.tsx` + `src/app/marketing/layout.tsx` を実パスで配置し、middleware で `host=www && pathname=/` のとき `/marketing` に rewrite する
- **代替案 A**: `app/(marketing)/page.tsx` を route group で配置
- **却下理由**: route group は URL 上は無視されるため、`app/(app)/page.tsx`（既存 home）と `(marketing)/page.tsx` が同じ `/` に解決され Next.js ビルド時に「You cannot have two parallel pages」エラーで失敗する

### D2: `NEXT_PUBLIC_MARKETING_HOSTS` 環境変数による host 集合一元化
- **判断**: middleware と robots/sitemap の host 判定を全て `process.env.NEXT_PUBLIC_MARKETING_HOSTS`（カンマ区切り）で行う
- **代替案 A**: middleware 内に host 名をハードコード（`'www.s-mitch.com'`）
- **却下理由**: preview deployment URL（`shukan-xxx.vercel.app`）でも LP を動作確認するため、host 集合を env で動的に拡張できる必要がある

### D3: middleware matcher は既存パターンに `/marketing/:path*` を追加するのみ
- **判断**: matcher `/, /discover/:path*, /stats/:path*, /settings/:path*, /marketing/:path*` とし、`/login` は引き続き対象外
- **代替案 A**: matcher を全パス対象 (`'/((?!_next|api|static).*)'`) に拡大
- **却下理由**: 影響範囲が大きい。既存挙動回帰のリスクが上がる。最小差分で目的を達するため必要なパスのみ追加

### D4: dev 環境では `?marketing=1` クエリパラメータで強制的に marketing 表示
- **判断**: `NODE_ENV !== 'production'` のとき `searchParams.get('marketing') === '1'` でも marketing rewrite を発動
- **代替案 A**: `/etc/hosts` 書き換えのみで対応
- **却下理由**: 書き換え操作はコストが高い。escape hatch があると Vitest や手動テストが楽になる

### D5: middleware の host 判定は **関数冒頭で即 return**
- **判断**: 関数の最初に `host` チェックを行い、marketing 対象なら `NextResponse.rewrite` を返して即終了。Supabase クライアント作成・`auth.getUser` 呼び出しを通過しない
- **代替案 A**: Supabase 呼び出し後に host 判定して rewrite
- **却下理由**: 未ログイン LP 訪問者で Supabase API を叩く意味がない。コスト・レイテンシ・心理的障壁の3点で不利

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `host` header は信頼境界の外（プロキシで上書きされる可能性）→ 攻撃者が host 偽装で marketing 表示を強制する可能性 | LP は public 情報のみ表示し、認証情報は含まないため攻撃価値が低い。production env では Vercel が host 検証してくれる |
| middleware matcher に `/marketing/:path*` を追加することで apex から `/marketing` への直接アクセスが middleware を通る | 設計通り。apex 側で `/marketing` を `/` に rewrite して隠蔽する目的のため必要な変更 |
| dev escape hatch `?marketing=1` が本番に混入すると LP 経由 SEO 操作の余地が生まれる | `NODE_ENV !== 'production'` ガードを必ず実装。Vitest で「production env では `?marketing=1` を無視」シナリオを assert |
| middleware が rewrite を返すパスとデフォルト Next.js routing が衝突する可能性 | matcher を限定し、`pathname === '/'` の場合のみ rewrite。`/marketing` 直接アクセスの場合だけ別分岐 |
| Vitest で middleware を直接 import すると `next/server` の polyfill が必要 | `@vitest/environment` を node にし、`NextRequest` / `NextResponse` を import して使う。Next.js 16 で動作する公式パターン |

## Migration Plan

- なし（DB 変更なし、既存ユーザー影響なし）
- デプロイ時の手順は change-C の deploy-steps.md に集約

## Open Questions

- なし（plan.md レビューで全 BLOCKER 解消、Build Contract APPROVE 済み）
