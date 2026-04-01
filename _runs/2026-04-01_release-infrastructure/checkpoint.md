# Checkpoint: Release Infrastructure

**開始**: 2026-04-01
**Phase**: Done

## Progress

| Change | Status | Notes |
|--------|--------|-------|
| 1. テスト修正 | ✅ done | 30→35 修正、171テスト全パス |
| 2. DNS + Vercel ドメイン | ✅ done | s-mitch.com → shukan、HTTPS有効 |
| 3. Supabase 移行 | ✅ done | dev/prod 作成、マイグレーション適用、auth設定 |
| 4. GCP OAuth | ✅ done | smitch-prod プロジェクト、OAuth クライアント作成 |
| 5. Vercel 環境変数 | ✅ done | prod に新 Supabase キー設定、再デプロイ済み |
| 6. 動作確認 | ✅ done | ログイン成功 |
| 7. docs/memory 更新 | ✅ done | MEMORY.md 最新化 |

## Decisions

- D1: Cloudflare プロキシは OFF（Vercel SSL 証明書のため）
- D2: Supabase を dev/prod 分離（旧プロジェクトから移行、データは新規スタート）
- D3: GCP プロジェクト新規作成（smitch-prod）
- D4: OAuth 同意画面の supabase.co 表示は一旦保留
- D5: Life Impact データは引き続き静的フロントエンド管理（D2 decisions.md 維持）
- D6: メール認証（Magic Link）は将来検討課題としてバックログ追加

## Scope Changes (Plan からの差分)

- Supabase dev/prod 分離が追加（当初は既存プロジェクトの設定変更のみの予定だった）
- GCP プロジェクト新規作成が追加
- docs/context はシンボリックリンク切れのため更新不可 → MEMORY.md で代替
