# Smitch 環境構成

Smitch リポジトリにおける 4 環境（dev / preview / staging / production）の責務、接続先、デプロイ方式、運用ルールをまとめた設計ドキュメント。OAK Casino で確立された同型パターンを Smitch 文脈で再構成したもの。

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│  開発環境 (ローカル)                                          │
│                                                             │
│  npm run dev (localhost:3000)                               │
│  Supabase: 開発用プロジェクト xhqddzdpcpvxpprxykct (Free)     │
│  認証: Google OAuth + Email（Supabase Auth）                 │
│                                                             │
│  開発者が日常開発・動作確認する環境                            │
└──────────────────────┬──────────────────────────────────────┘
                       │ Draft PR 起票 → ラベル `preview` 付与
                       │ GitHub Actions: ci.yml + deploy-preview.yml
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Preview 環境 (Vercel, PR ごと動的)                          │
│                                                             │
│  URL: shukan-<hash>-orattas-projects.vercel.app             │
│  Supabase: 開発用プロジェクト xhqddzdpcpvxpprxykct           │
│  認証: Google OAuth + Email（開発と同じ）                    │
│                                                             │
│  PR ごとの動作確認用。ラベル `preview` 付与で発火              │
└──────────────────────┬──────────────────────────────────────┘
                       │ Merge Queue 経由で main マージ
                       │ merge_group で最終 CI → PASS でマージ確定
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Staging 環境 (Vercel)                                       │
│                                                             │
│  URL: staging.s-mitch.com                                   │
│  Supabase: 本番用プロジェクト erminkotxfnxlkxktejv（prod 共有）│
│  認証: Google OAuth + Email（本番 OAuth クライアントを共有）  │
│                                                             │
│  本番同等データで動作確認する環境                              │
│  ※ 書き込みは本番 DB に直接反映されるため要注意                │
└──────────────────────┬──────────────────────────────────────┘
                       │ 承認後、本番リリース
                       │ gh workflow run deploy-production.yml + Environment approval
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Production 環境 (Vercel)                                    │
│                                                             │
│  URL: s-mitch.com                                            │
│  Supabase: 本番用プロジェクト erminkotxfnxlkxktejv           │
│  認証: Google OAuth + Email                                  │
│                                                             │
│  全ユーザーがアクセスする環境                                   │
└─────────────────────────────────────────────────────────────┘
```

## 画面別アクセス方式

Smitch は通常の Web ブラウザ経由で全画面にアクセスする構成。認証は Supabase Auth（Google OAuth + Email）で行う。

| 画面 | ルート | 認証方式 | アクセス元 |
|---|---|---|---|
| アプリ本体 | `/(app)/*` | Supabase Auth（Google OAuth） | PC / スマホブラウザ |
| ログイン | `/login` | Supabase Auth（Google OAuth + Email） | PC / スマホブラウザ |
| API | `/api/*` | Supabase Auth セッション検証 | 内部呼び出し |

ミドルウェア (`src/middleware.ts`) がセッション refresh と未認証時の `/login` リダイレクトを担当する。

## 各サービスの環境構成

### Vercel（Hobby プラン）

| | 開発 (ローカル) | Preview (PR) | Staging | Production |
|---|---|---|---|---|
| URL | localhost:3000 | `shukan-<hash>-orattas-projects.vercel.app`（動的） | staging.s-mitch.com | s-mitch.com |
| デプロイ | `npm run dev` | `deploy-preview.yml`（ラベル `preview` 付与で発火） | `deploy-staging.yml`（main push） | `deploy-production.yml`（`workflow_dispatch` + approval） |
| 環境変数 | `.env.local` | Vercel Preview スコープ | Vercel Preview を pull → workflow で prod Supabase に override | Vercel Production スコープ |
| Cron Jobs | なし | なし | なし | なし（現状） |

Vercel プロジェクトは `shukan`（owner: `orattas-projects`）。Git 自動デプロイは `vercel.json` の `github.enabled: false` で無効化し、GitHub Actions + Vercel CLI でのみデプロイする。

### Supabase（Genetta-Shukan org / `eynuvlgfgnzobxxrscrf`）

| | 開発 (ローカル) + Preview | Staging + Production |
|---|---|---|
| プロジェクト | `xhqddzdpcpvxpprxykct`（dev, Tokyo / Free） | `erminkotxfnxlkxktejv`（prod, Tokyo） |
| 用途 | 開発・PR Preview 動作確認 | Staging / 一般ユーザー利用 |
| テストデータ | あり（任意の seed） | なし（実ユーザーデータのみ） |
| マイグレーション | `supabase db push --project-ref xhqddzdpcpvxpprxykct` | `supabase db push --project-ref erminkotxfnxlkxktejv`（手動） |

**設計（OAK Casino 同型）**: Staging と Production は同じ Supabase プロジェクト（prod DB）を共有する。本番同等データで動作確認するためのトレードオフ。Staging 動作確認時は次節の禁則事項を厳守すること。

Vercel 環境変数上は Preview スコープに dev DB の URL/key がセットされる。`deploy-staging.yml` は Preview env を pull した後、workflow 内で `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` を prod DB の値に上書きしてからビルド・デプロイする。

本番運用開始後、prod プロジェクト `erminkotxfnxlkxktejv` を Supabase Pro ($25/mo) にアップグレード必要（Free は 1 週間無操作で自動停止するため）。

### 認証構成

Smitch の認証は Supabase Auth に集約され、外部 ID プロバイダとして Google OAuth を使用する。

| | 開発 (ローカル) | Preview (PR) | Staging | Production |
|---|---|---|---|---|
| Supabase Auth プロジェクト | `xhqddzdpcpvxpprxykct` | `xhqddzdpcpvxpprxykct` | `erminkotxfnxlkxktejv`（prod 共有） | `erminkotxfnxlkxktejv` |
| Google OAuth クライアント | dev クライアント | dev クライアント | 本番クライアント（staging.s-mitch.com を Redirect URI に追加） | 本番クライアント |
| Email 認証（Magic Link 検討中） | 無効 | 無効 | 無効 | 無効 |

Staging の Google OAuth は本番クライアントを共有する。`staging.s-mitch.com` を GCP Console の Authorized Redirect URI に追加しておく必要がある。

## 環境変数

| 変数名 | 開発 (.env.local) | Preview (Vercel) | Staging (Vercel + override) | Production (Vercel) |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 開発用 URL（`xhqddzd*`） | 開発用 URL | `PROD_SUPABASE_URL` Secret で上書き | 本番 URL（`erminkot*`） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 開発用キー | 開発用キー | `PROD_SUPABASE_ANON_KEY` Secret で上書き | 本番キー |
| `SUPABASE_SERVICE_ROLE_KEY` | 開発用キー | 開発用キー | `PROD_SUPABASE_SERVICE_ROLE_KEY` Secret で上書き | 本番キー |

Smitch では Supabase 関連の環境変数のみを扱う（OAuth 等の外部認証は Supabase Dashboard 上で設定するため env には現れない）。

## Cron Jobs

現状 Smitch には Cron Jobs はない。必要になった時点で `vercel.json` の `crons` プロパティを追加する（別 run で実施）。

## Git ブランチ戦略

```
feature/xxx ──Draft PR──→ main ──Merge Queue──→ staging ──approval──→ production
  fix/xxx ─────┘                  (merge_group)   (auto)            (workflow_dispatch)
```

| ブランチ | 用途 | デプロイ先 |
|---|---|---|
| `feature/*`, `fix/*` | 機能開発・バグ修正 | （ローカルのみ。PR ラベル `preview` 付与時は Preview） |
| `main` | 統合ブランチ | Staging（自動） |
| （手動承認） | リリース | Production |

## 開発ワークフロー

Smitch では「Draft PR を更新し続けながら、明示的な発火だけで CI / Preview を消費する」運用を採用する。push 連動の自動 CI は意図的に持たない。

### 5 段階のフロー

1. **feature branch + Draft PR 起票**: `feature/xxx` を main から切り、`gh pr create --draft` で Draft PR を作成する。push しても CI / Preview は走らない（`pull_request` の `synchronize` を購読しないため）。
2. **ラベル `preview` 付与で CI + Preview deploy 発火**: 動作確認したいタイミングで `gh pr edit <PR> --add-label preview` する。`ci.yml`（lint + typecheck + test + actionlint）と `deploy-preview.yml`（Vercel Preview デプロイ + PR コメントに URL 投稿）が同時に走る。再発火したい場合はラベル外して付け直す。
3. **Ready 化 → Merge Queue で最終 CI**: Draft を Ready にしてマージボタンを押すと、GitHub Merge Queue（`merge_group` イベント）で `ci.yml` が再実行される。これが PASS して初めて main にマージされる。Required Status Check は `merge_group` 経由の `ci` のみに指定する（PR 上の `ci` を Required にすると、ラベル未付与時に pending のままマージ不可になるため）。
4. **main マージで staging 自動デプロイ**: main への push を契機に `deploy-staging.yml` が発火し、prod Supabase へ env override した上で `staging.s-mitch.com` にデプロイされる。`concurrency: group: staging-deploy` で多重実行を抑止。
5. **`workflow_dispatch` + approval で production デプロイ**: `gh workflow run deploy-production.yml -f confirm=true` で起動し、GitHub Environment "Production" の Required reviewers（oratta）が承認することで `s-mitch.com` にデプロイされる。`confirm != 'true'` の場合は最初の step で `exit 1` する二重ガード付き。

### 日常の開発フロー

```
1. feature/xxx ブランチを main から作成
2. ローカルで開発（npm run dev + 開発用 Supabase）
3. マイグレーションがある場合:
   → supabase db push --project-ref xhqddzdpcpvxpprxykct で dev に適用
   → ローカルで動作確認
4. Draft PR を起票（push しても CI は走らない）
5. 動作確認したいタイミングで PR にラベル `preview` を付与
   → ci.yml + deploy-preview.yml が走り、Preview URL が PR コメントに投稿される
6. レビュー後、Ready 化してマージボタン押下
   → Merge Queue で最終 CI → PASS で main にマージ
7. → 自動で staging.s-mitch.com にデプロイ
```

### Staging 確認フロー

```
8. Staging URL（staging.s-mitch.com）で動作確認
   ※ 後述の「Staging 動作確認時の禁則事項」を厳守
9. 問題があれば 1 に戻る
```

### Production リリースフロー

```
10. Staging 確認 OK
11. Production マイグレーションがある場合は手動で適用:
    supabase db push --project-ref erminkotxfnxlkxktejv
12. gh workflow run deploy-production.yml -f confirm=true
13. GitHub Environment "Production" の approval gate で oratta が承認
14. s-mitch.com にデプロイされる
```

## Staging 動作確認時の禁則事項

Staging は **prod Supabase（`erminkotxfnxlkxktejv`）を直接参照する**。ソースコードのみが本番と異なる構成のため、データ操作には次の制約がある。

### (a) Staging での書き込みは prod DB に直接反映される

`staging.s-mitch.com` から habit を作成・完了・削除した場合、その変更は本番 DB に保存される。本番ユーザーから自分のアカウントを見れば、staging で作ったデータがそのまま見える状態になる。**Staging で「お試し」のつもりでデータを作ってはいけない**。

### (b) RLS により他ユーザーのデータは見えないが、書き込みは本物

Supabase の Row Level Security は staging からの読み込みでも有効に働くため、他ユーザーのデータを覗き見ることはできない。しかし service_role_key を使う API ルートからは RLS をバイパスできるため、サーバー側ロジックの実装ミスで他ユーザーのデータを破壊する可能性は残る。staging での動作確認では、特に管理者経路や bulk 操作のテストには細心の注意を払うこと。

### (c) QA 用途では prod に専用 QA アカウントを作成して使う

Staging で UI を触りたい場合は、本番 DB 上に「QA 専用アカウント」を作成し、そのアカウントでログインして検証する。実ユーザーアカウント（oratta 個人など）で検証してはいけない。QA アカウントが意図せず本番 DB を汚しても、そのアカウントの完結したデータ範囲に閉じる。

## `vercel.json` の `github.enabled: false` 設計理由

`vercel.json` は最終的に次の形に確定している:

```json
{
  "github": {
    "enabled": false
  }
}
```

### なぜ `enabled: false` か

Smitch のデプロイ経路を完全に **GitHub Actions + Vercel CLI** に統一するため、Vercel 標準の Git 連携自動デプロイを停止する。`enabled: false` は Git push 時の Vercel 自動デプロイを完全に無効化する設定で、これにより:

- main への push で Vercel が勝手に Production デプロイすることを防ぐ（`deploy-production.yml` の approval gate を経由しないリリース事故を防止）
- feature branch への push で Preview デプロイが大量生成されることを防ぐ（コスト + 待ち時間削減）
- デプロイトリガーが「GitHub Actions の明示発火」だけになり、運用が一系統に統一される

### なぜ `autoAlias` を削除したか

旧 `vercel.json` には `autoAlias: false` が含まれていた。`autoAlias` は Vercel の Git 連携で自動生成される alias の挙動を制御するオプションで、**`github.enabled: false` で Git 連携自体が無効になると no-op**になる。残しておくと「何のために存在しているのか」が将来読み返した時に不明になるため、明示的に削除した。

### 切替時の順序ガイダンス

Vercel Dashboard 上の Git Integration 切断（`docs/infrastructure/staging-domain-setup.md` 参照）と `vercel.json` の `github.enabled: false` は二重ガード。切断は **GitHub Actions 経由の staging デプロイが少なくとも 1 回成功してから**行うこと。先に切断すると、staging への到達経路が一時的に存在しない時間帯が発生する。

## 費用見積もり

### 検品中（現在）

| サービス | 月額 | 備考 |
|---|---|---|
| Vercel Hobby | $0 | Preview + alias で staging 運用 |
| Supabase Free（prod `erminkot*`） | $0 | リリース前に Pro 化必要 |
| Supabase Free（dev `xhqddzd*`） | $0 | |
| Cloudflare DNS / GitHub | $0 | |
| **合計** | **$0** | ドメイン費用別 |

### 本番運用開始後

| サービス | 月額 | 備考 |
|---|---|---|
| Vercel Hobby | $0 | |
| Supabase Pro（prod） | $25/mo | Free は 1 週間無操作で自動停止のため必須 |
| Supabase Free（dev） | $0 | |
| Cloudflare DNS / GitHub | $0 | |
| **合計** | **$25/mo** | ドメイン費用別 |
