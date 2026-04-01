# Longrun: Release Infrastructure

**作成日**: 2026-04-01
**目的**: s-mitch.com でのSmitch本番公開に必要なインフラ設定を完了し、ドキュメントを最新化する

## Background

Smitchへのリブランド、レビュー履歴カレンダー、デスクトップナビ、法的ページ等の実装は完了済み。
Vercelにドメイン追加・staged production設定まで完了しているが、DNS・OAuth・テスト修正が残っている。
ドッグフーディング期限は 2026-04-08。

## Scope

- テスト修正（記事数不一致）
- DNS設定手順書（Cloudflare → Vercel）
- OAuth リダイレクトURL手順書（Supabase + Google）
- 本番動作確認チェックリスト
- docs/context 最新化（current-phase.md, milestones.md, tasks.md, issues.md）

## Changes

### Change 1: テスト修正
**ファイル**: `src/__tests__/calculation-logic.test.ts`
**内容**: 記事数のアサーション 30 → 35 に修正。テスト名も更新。
**実行**: Claude が自動で修正 → `npm run test:run` で確認
**スキル**: なし（単純な修正）

### Change 2: DNS設定手順書
**出力**: ユーザーへの手順提示（ファイル作成なし）
**内容**:
1. Cloudflareダッシュボードで s-mitch.com の DNS 設定を開く
2. CNAME レコード追加: `@` → `cname.vercel-dns.com`（プロキシOFF）
3. CNAME レコード追加: `www` → `cname.vercel-dns.com`（プロキシOFF）
4. Vercel側で DNS 検証パス確認
**依存**: なし
**実行**: ユーザーが手動で実施

### Change 3: OAuth リダイレクトURL手順書
**出力**: ユーザーへの手順提示（ファイル作成なし）
**内容**:
1. Supabase Dashboard → Authentication → URL Configuration
   - Site URL を `https://s-mitch.com` に変更
   - Redirect URLs に `https://s-mitch.com/**` を追加
2. Google Cloud Console → OAuth 2.0 Client
   - Authorized redirect URIs に `https://wonmzxdkqlvvdclpfwkn.supabase.co/auth/v1/callback` が存在することを確認
   - Authorized JavaScript origins に `https://s-mitch.com` を追加
**依存**: Change 2（DNS設定後が望ましい）
**実行**: ユーザーが手動で実施

### Change 4: 本番動作確認
**内容**: DNS反映後に以下を確認
- [ ] `https://s-mitch.com` にアクセスできる
- [ ] HTTPS が有効
- [ ] Google OAuth ログインが動作する
- [ ] 習慣の作成・完了・削除が動作する
- [ ] レビュー機能が動作する
**依存**: Change 2, 3

### Change 5: docs/context 最新化
**ファイル**:
- `docs/context/current-phase.md` — 進捗更新、実装済み機能にリブランド・レビュー履歴等を追加
- `docs/context/core/milestones.md` — リブランド・デスクトップナビ・法的ページ等を追記
- `docs/context/core/tasks.md` — 最終更新日の更新
- `docs/context/core/issues.md` — 解決済みがあれば更新
- `docs/context/core/project.md` — Smitchリブランド反映、capability数更新
**依存**: Change 1〜4 完了後（最新状態を反映するため）
**スキル**: なし
**実行**: Claude が自動で修正

## Execution Order

```
Change 1 (テスト修正)          ← Claude 自動、即時
    ↓
Change 2 (DNS手順書)           ← 手順提示 → ユーザー実施
Change 3 (OAuth手順書)         ← 手順提示 → ユーザー実施（DNS後が望ましい）
    ↓
Change 4 (動作確認)            ← DNS反映待ち（数分〜48時間）→ ユーザー確認
    ↓
Change 5 (docs更新)            ← Claude 自動
```

## Risk

| リスク | 影響 | 対策 |
|--------|------|------|
| DNS反映に時間がかかる | 動作確認が遅れる | Cloudflareプロキシ OFF で反映を早める |
| OAuth redirect URL 不足 | ログインできない | Supabase + Google 両方のURL設定を確認 |
| Vercel auto-alias が OFF | 手動プロモートが必要 | `vercel promote` コマンドで対応 |

## Done Criteria

- [ ] `npm run test:run` 全テストパス
- [ ] `https://s-mitch.com` でアプリにアクセス可能
- [ ] Google OAuth ログインが s-mitch.com で動作
- [ ] docs/context が最新状態に更新済み
