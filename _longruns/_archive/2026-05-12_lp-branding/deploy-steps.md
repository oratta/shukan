# Deploy Steps — Marketing LP (www.s-mitch.com)

LP のブランディング（change-A/B/C）を本番に反映するための手動デプロイ手順。
Vercel 既存 `shukan` プロジェクトに対し www サブドメインを追加し、Cloudflare DNS と env を構成する。

前提:
- 本 worktree のブランチ `feature/seo-ogp-deploy` は `main` にマージ済みであること。
- 既に `s-mitch.com` (apex) は Vercel `shukan` プロジェクトに紐付き、Cloudflare DNS A レコード `76.76.21.21` proxy OFF で本番稼働中。
- 本手順は **追加** デプロイであり、apex 配信や既存アプリ動線（`/login`、`(app)` ルート）に影響を与えてはならない。

---

## (1) Vercel `shukan` プロジェクトに `www.s-mitch.com` を追加

1. Vercel Dashboard → `orattas-projects/shukan` → Settings → **Domains**。
2. **Add Domain** に `www.s-mitch.com` を入力 → Add。
   - 既存の Vercel プロジェクト（`shukan`）にそのまま追加する。新規プロジェクトは作らない。
3. Vercel が DNS 設定を案内する。次手順の Cloudflare 側で対応する。
4. 「Recommended: Set as primary」のような提案が出ても **無視**。apex / www は両方とも primary 扱いせず、middleware が host で出し分ける設計（change-A）。

検証コマンド（Vercel CLI を使う場合）:
```bash
vercel domains ls --scope orattas-projects
# → "www.s-mitch.com" が "shukan" にアタッチされていること
```

---

## (2) Cloudflare DNS に CNAME を追加（**proxy OFF 必須**）

1. Cloudflare Dashboard → `s-mitch.com` ゾーン → **DNS** → **Records**。
2. **Add record**:
   - Type: `CNAME`
   - Name: `www`
   - Target: `cname.vercel-dns.com`
   - **Proxy status: DNS only（灰色雲、proxy OFF）** ← 必須
   - TTL: Auto
3. **proxy ON（橙色雲）にしないこと**。Cloudflare proxy 経由だと Vercel の Let's Encrypt 証明書発行 (ACME challenge) が失敗し、SSL `Issued` に到達しない。

検証コマンド:
```bash
dig CNAME www.s-mitch.com +short
# → cname.vercel-dns.com.

# Cloudflare の proxy が掛かっていないことを確認（Cloudflare の IP に解決されたら NG）
dig www.s-mitch.com +short
# → 最終的に Vercel の A レコード（76.76.21.21 等）に解決されるはず
```

---

## (3) Vercel env `NEXT_PUBLIC_MARKETING_HOSTS=www.s-mitch.com` を Production / Preview 両方に設定

1. Vercel Dashboard → `shukan` → Settings → **Environment Variables**。
2. **Add New**:
   - Key: `NEXT_PUBLIC_MARKETING_HOSTS`
   - Value: `www.s-mitch.com`
   - Environments: ☑ Production / ☑ Preview / ☐ Development（dev は escape hatch `?marketing=1` を使う想定）
3. Save 後、**Production の再デプロイ** が必要（env を反映するため）。
   - Vercel UI → Deployments → 最新の Production deployment → "..." → **Redeploy** → "Use existing Build Cache" は OFF 推奨。
   - もしくは CLI: `vercel --prod`

検証コマンド (Vercel CLI):
```bash
vercel env ls production --scope orattas-projects
# → NEXT_PUBLIC_MARKETING_HOSTS が Production に存在すること
```

---

## (4) Vercel SSL ステータスが `Issued` になるまで待機

1. Vercel Dashboard → `shukan` → Settings → Domains。
2. `www.s-mitch.com` の SSL ステータスが **`Issued`** になるまで待つ。
   - 通常 1〜5 分。長くても 10 分以内には反映される。
   - **`Pending`** のまま 15 分以上経過する場合は、Cloudflare proxy が ON に戻っていないか / DNS 伝播が遅延していないか確認する（手順 (2) を見直す）。
3. `Issued` になったら、ブラウザで `https://www.s-mitch.com/` にアクセスし、証明書エラーが出ないことを確認。

検証コマンド:
```bash
curl -I https://www.s-mitch.com/ 2>&1 | head -5
# → HTTP/2 200 が返ること、SSL warning が出ないこと
```

---

## (5) 本番動作確認チェックリスト（smoke test）

下記を全て手動で確認し、問題があれば即 rollback（Vercel UI から旧 deployment を Promote）。

### LP 表示（www）
- [ ] `https://www.s-mitch.com/` にアクセス → marketing ページ（Hero "Switch your path." / Problem / Solution / Footer）が表示される
- [ ] LP に `(app)` レイアウト（Header / BottomNav）が **出ない** こと
- [ ] `<html lang="ja">` 相当（`<div lang="ja">` でも可）
- [ ] CTA ボタンが見える、`href="https://s-mitch.com/login"` を指している（クリックして `/login` に遷移）

### 既存 apex 動線（s-mitch.com）
- [ ] `https://s-mitch.com/` 未ログイン → 既存通り `/login` にリダイレクト
- [ ] `https://s-mitch.com/` ログイン済み → 既存 `(app)` ホームが表示
- [ ] `https://s-mitch.com/login` でログイン可能
- [ ] `https://s-mitch.com/marketing` を直接叩いても apex では `/` に rewrite され LP が露出しない（change-A S6）

### SEO / OGP
- [ ] `curl https://www.s-mitch.com/robots.txt` → `Allow: /` と `Sitemap: https://www.s-mitch.com/sitemap.xml`
- [ ] `curl https://s-mitch.com/robots.txt` → `Disallow: /`（apex は完全 disallow）
- [ ] `curl https://www.s-mitch.com/sitemap.xml` → `https://www.s-mitch.com/` を含む
- [ ] `curl https://s-mitch.com/sitemap.xml` → 空（`<urlset></urlset>`）
- [ ] `curl -s https://www.s-mitch.com/ | grep -E 'og:(title|description|image)|twitter:card'` → 4種すべてヒット
- [ ] OGP プレビュー: [opengraph.xyz](https://www.opengraph.xyz/url/https%3A%2F%2Fwww.s-mitch.com%2F) で og:image (`/og-image.png`) が解決される

### CTA → login（クロスドメイン動線）
- [ ] LP の CTA をクリック → `https://s-mitch.com/login` に遷移
- [ ] そのまま Google OAuth → ログイン後 `(app)` ホームに到達

---

## ロールバック手順

1. Vercel Dashboard → `shukan` → Deployments。
2. 旧 Production deployment（merge 直前）の "..." → **Promote to Production**。
3. env を戻す必要は通常なし（middleware が host で判定するため、www DNS だけ外せば即座に旧挙動）。
4. もし www DNS そのものを外す場合: Cloudflare の CNAME レコードを削除（Vercel 側のドメインは残しても害なし）。

---

## メモ

- preview deployment では `NEXT_PUBLIC_MARKETING_HOSTS` を Preview 環境にも設定済みのため、`*.vercel.app` の host では robots は `Disallow: /` を返し、preview がインデックスされない（design.md Risks 参照）。
- 将来 SEO 構造化データ（JSON-LD）/ analytics を導入する場合は別 issue で扱う（design.md Non-Goals）。
