## 1. docs/infrastructure/ ディレクトリ作成

- [ ] 1.1 `docs/infrastructure/` を mkdir する（既存ファイルがないこと確認）

## 2. environment-strategy.md 本体作成

- [ ] 2.1 OAK Casino `~/.superset/worktrees/OAK Casino/proud-dryosaurus/docs/environment-strategy.md` を読み込み、Smitch 用に再構成しながら `docs/infrastructure/environment-strategy.md` に書き出す
- [ ] 2.2 アーキテクチャ ASCII 図を Smitch 用 URL（localhost:3000 / 動的 / staging.s-mitch.com / s-mitch.com）に書き換える
- [ ] 2.3 「各サービスの環境構成」セクション: Vercel project `shukan`、Supabase `xhqddzdpcpvxpprxykct` (dev) / `erminkotxfnxlkxktejv` (prod) を記載
- [ ] 2.4 LIFF/LINE 関連セクションを完全削除し、Google OAuth + Email 認証の「画面別アクセス」表に置き換え
- [ ] 2.5 「環境変数」表を Smitch 用に再作成（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY のみ、LIFF 関連なし）
- [ ] 2.6 Cron Jobs セクションは「現状なし」として 1 行追加

## 3. 新規セクション追加

- [ ] 3.1 「開発ワークフロー」セクションを Draft PR + Merge Queue + `preview` ラベル発火 + workflow_dispatch の 5 段階で記述
- [ ] 3.2 「Staging 動作確認時の禁則事項」セクションを追加: (a) staging 書き込みは prod DB に直接反映 / (b) RLS で他ユーザーは見えないが書き込みは本物 / (c) QA 用途は専用 QA アカウントを prod に作成
- [ ] 3.3 「vercel.json 設計理由」セクションを追加: GitHub Actions + Vercel CLI でデプロイするため Git 連携無効化、`autoAlias` は no-op になり削除

## 4. assertion 検証（テスト相当）

- [ ] 4.1 `test -f docs/infrastructure/environment-strategy.md` が成功する
- [ ] 4.2 `grep -i liff docs/infrastructure/environment-strategy.md` が 0 件
- [ ] 4.3 `grep -i "line developers" docs/infrastructure/environment-strategy.md` が 0 件
- [ ] 4.4 `grep -c "staging.s-mitch.com" docs/infrastructure/environment-strategy.md` が 1 以上
- [ ] 4.5 `grep -c "禁則事項" docs/infrastructure/environment-strategy.md` が 1 以上
- [ ] 4.6 `grep -c "autoAlias" docs/infrastructure/environment-strategy.md` が 1 以上
- [ ] 4.7 `grep -c "Merge Queue\|merge_group" docs/infrastructure/environment-strategy.md` が 1 以上

## 5. コミット

- [ ] 5.1 `git add docs/infrastructure/environment-strategy.md openspec/changes/env-strategy-docs/`
- [ ] 5.2 commit message: `docs: add environment-strategy for Smitch (4 envs + Draft PR/Merge Queue)`
- [ ] 5.3 コミットハッシュを longrun-builder の報告に含める
