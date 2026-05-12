# Decisions Log — LP Branding (2026-05-12)

## D1: LP は実パス `app/marketing/` に配置（route group 非採用）
- **日時**: 2026-05-12（plan.md v2 反映）
- **判断**: `app/(marketing)/page.tsx` ではなく `app/marketing/page.tsx`
- **理由**: route group は URL 上は無視されるため、`(app)/page.tsx`（既存 home）と `(marketing)/page.tsx` が同じ `/` に解決されビルド失敗する。実パス配置 + middleware rewrite が Next.js 16 の標準パターン
- **エビデンス**: Plan Review v1（agentId aeaee99842846c64a）BLOCKER 1 指摘 → v2 で修正、レビュー APPROVE（agentId a94066ff1eafa1472）

## D2: host 判定は `NEXT_PUBLIC_MARKETING_HOSTS` env で一元化
- **日時**: 2026-05-12
- **判断**: middleware と robots.ts/sitemap.ts は `process.env.NEXT_PUBLIC_MARKETING_HOSTS` をカンマ区切りパースし、host 名が含まれるかで marketing/apex を判定
- **理由**: 本番（www.s-mitch.com）/ preview（shukan-xxx.vercel.app）/ dev（localhost）で異なる host を扱う必要があり、ハードコード回避。preview deployment でも env を一時設定するだけで LP 動作確認できる
- **エビデンス**: Plan Review SHOULD_FIX 3 指摘 → v2 で env 設計を追加、APPROVE

## D3: middleware matcher は現行のまま、host 判定は関数冒頭で実施
- **日時**: 2026-05-12
- **判断**:
  - 既存 matcher `/, /discover/:path*, /stats/:path*, /settings/:path*` は維持
  - 新規追加: `/marketing/:path*`（apex から直接アクセス時に rewrite で隠蔽するため）
  - middleware 関数冒頭で `host = request.headers.get('host')` を読み、`NEXT_PUBLIC_MARKETING_HOSTS` に含まれかつ `pathname === '/'` なら `NextResponse.rewrite('/marketing')` で即 return（auth.getUser を呼ばない）
- **理由**: matcher から `/login` を除外したままにすることで認証リダイレクトループを回避。host ベース判定で apex 経路は従来挙動を完全に維持
- **エビデンス**: Plan Review BLOCKER 2 / NOTE C 指摘 → v2 で rules 明文化、APPROVE

## D4: Cloudflare proxy OFF / Vercel 同一プロジェクトに www 追加
- **日時**: 2026-05-12
- **判断**:
  - Vercel `shukan` プロジェクトに `www.s-mitch.com` を追加ドメインとして登録（別プロジェクトを作らない）
  - Cloudflare DNS で `www` → CNAME `cname.vercel-dns.com`、proxy OFF（DNS only）必須
- **理由**: 同一 middleware で host 判定するため同一 deployment が必須。Cloudflare proxy ON では Vercel 証明書発行が遅延・失敗する事例あり
- **エビデンス**: Plan Review SHOULD_FIX 4 指摘 → v2 で rules 明文化、APPROVE。MEMORY の Infrastructure 記載（apex は proxy OFF）と整合

## D5: LP のコピー/レイアウト/ビジュアル本実装は本runスコープ外
- **日時**: 2026-05-12
- **判断**: 本runでは「土台」（routing, shell, SEO, deploy 手順）のみ。LP の最終レイアウト・コピー・ビジュアル素材は codex + gpt-image-2 に別途委譲
- **理由**: ユーザー指定。スコープを限定することで本runの確実性を担保し、デザイン創造性は codex+gpt-image-2 の得意領域で発揮させる
- **エビデンス**: longrun-plan Step 4 Interview ラスト質問の回答「gpt-image2を使って、codexで作らせてみたいので、LPの具体的な構成はいいや」
